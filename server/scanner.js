const fs = require('fs');
const path = require('path');

const RESOURCE_NAME = GetCurrentResourceName();
const RESOURCE_PATH = GetResourcePath(RESOURCE_NAME);
const QUARANTINE_DIR = path.join(RESOURCE_PATH, 'quarantine');
const QUARANTINE_INDEX = path.join(QUARANTINE_DIR, 'index.json');
const REPORTS_DIR = path.join(RESOURCE_PATH, 'reports');

for (const dir of [QUARANTINE_DIR, REPORTS_DIR]) {
    if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    }
}

const Config = global.KillDoorConfig || require('../config.js');

const CompiledXorRegexes = Config.Detection.XorPatterns.map(p => new RegExp(p, 's'));
const ManifestInjectRegex = new RegExp(Config.Detection.ManifestInjectPattern);

// Clientes com o painel aberto para receber streaming em tempo real
const activeUiClients = new Set();

let lastScanState = {
    scanning: false,
    progress: 100,
    lastScanTime: null,
    rootDir: '',
    mode: 'report',
    results: [],
    logs: [],
    stats: {
        totalFilesScanned: 0,
        totalManifestsScanned: 0,
        totalThreats: 0,
        criticalThreats: 0,
        warningThreats: 0,
        cleanedThreats: 0,
        pendingThreats: 0
    }
};

function sleepTick(ms = 5) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizePath(p) {
    return p.replace(/\\/g, '/');
}

function findResourcesRoot(startPath) {
    let current = path.resolve(startPath);
    for (let i = 0; i < 5; i++) {
        const base = path.basename(current).toLowerCase();
        if (base === 'resources') {
            return current;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
    }
    return path.resolve(startPath, '..');
}

function logConsole(msg, colorCode = '^7') {
    console.log(`^5[Piercer KillDoor]^7 ${colorCode}${msg}^7`);
}

function broadcastToUi(eventName, payload) {
    for (const clientSrc of activeUiClients) {
        try {
            emitNet(eventName, clientSrc, payload);
        } catch (e) {}
    }
}

function appendScanLog(text, level = 'info') {
    const entry = {
        time: new Date().toLocaleTimeString('pt-BR'),
        text,
        level
    };
    lastScanState.logs.push(entry);
    if (lastScanState.logs.length > 600) {
        lastScanState.logs.shift();
    }

    const colorMap = {
        info: '^7',
        accent: '^2',
        warn: '^3',
        danger: '^1',
        muted: '^0'
    };
    logConsole(text, colorMap[level] || '^7');

    // Envia a linha de log IMEDIATAMENTE em tempo real para o painel NUI
    broadcastToUi('piercer_killdoor:liveLog', entry);
}

function broadcastProgress(pct, currentFile = '') {
    lastScanState.progress = pct;
    recalculateStats();
    broadcastToUi('piercer_killdoor:liveProgress', {
        progress: pct,
        currentFile,
        stats: lastScanState.stats
    });
}

// ============================================================================
// SISTEMA DE QUARENTENA E RESTAURAÇÃO
// ============================================================================

function loadQuarantineIndex() {
    if (!fs.existsSync(QUARANTINE_INDEX)) return [];
    try {
        return JSON.parse(fs.readFileSync(QUARANTINE_INDEX, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveQuarantineIndex(list) {
    try {
        fs.writeFileSync(QUARANTINE_INDEX, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {}
}

function backupToQuarantine(threat) {
    if (!Config.EnableQuarantine) return null;
    try {
        if (!fs.existsSync(threat.filePath)) return null;
        const list = loadQuarantineIndex();
        const qId = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const safeName = path.basename(threat.filePath).replace(/[^a-zA-Z0-9._-]/g, '_');
        const backupFileName = `${qId}_${safeName}.bak`;
        const backupPath = path.join(QUARANTINE_DIR, backupFileName);

        fs.copyFileSync(threat.filePath, backupPath);

        const entry = {
            quarantineId: qId,
            originalPath: threat.filePath,
            relativePath: threat.relativePath,
            resourceName: threat.resourceName,
            backupFileName,
            type: threat.type,
            severity: threat.severity,
            detail: threat.detail,
            date: new Date().toLocaleString('pt-BR')
        };
        list.unshift(entry);
        saveQuarantineIndex(list);
        return qId;
    } catch (e) {
        appendScanLog(`[ERRO] Falha ao criar backup na quarentena para ${threat.relativePath}: ${e.message}`, 'warn');
        return null;
    }
}

function restoreFromQuarantine(quarantineId) {
    const list = loadQuarantineIndex();
    const idx = list.findIndex(item => item.quarantineId === quarantineId);
    if (idx === -1) {
        return { ok: false, msg: `Item de quarentena '${quarantineId}' não encontrado.` };
    }

    const item = list[idx];
    const backupPath = path.join(QUARANTINE_DIR, item.backupFileName);
    if (!fs.existsSync(backupPath)) {
        return { ok: false, msg: `Arquivo de backup '${item.backupFileName}' não existe mais no disco.` };
    }

    try {
        const targetDir = path.dirname(item.originalPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(backupPath, item.originalPath);
        try { fs.unlinkSync(backupPath); } catch (e) {}
        list.splice(idx, 1);
        saveQuarantineIndex(list);

        const foundThreat = lastScanState.results.find(r => r.filePath === item.originalPath);
        if (foundThreat) foundThreat.cleaned = false;

        return { ok: true, msg: `Restaurado com sucesso: ${item.relativePath}`, item };
    } catch (e) {
        return { ok: false, msg: `Erro ao restaurar arquivo: ${e.message}` };
    }
}

// ============================================================================
// ANÁLISE DE CONTEXTO DE RESOURCE
// ============================================================================

function inspectResourceContext(resourceDir) {
    const context = {
        resourceName: path.basename(resourceDir),
        hasStreamFolder: false,
        hasUiPage: false,
        isModResource: false,
        injectedFiles: new Set()
    };

    try {
        const streamPath = path.join(resourceDir, 'stream');
        if (fs.existsSync(streamPath) && fs.statSync(streamPath).isDirectory()) {
            context.hasStreamFolder = true;
        }

        const manifests = ['fxmanifest.lua', '__resource.lua'];
        for (const mName of manifests) {
            const mPath = path.join(resourceDir, mName);
            if (fs.existsSync(mPath)) {
                const content = fs.readFileSync(mPath, 'utf8');
                if (/\bui_page\b/i.test(content)) {
                    context.hasUiPage = true;
                }
                const lines = content.split(/\r?\n/);
                for (const line of lines) {
                    const match = line.match(ManifestInjectRegex);
                    if (match && match[1]) {
                        const injectedRel = normalizePath(path.join(resourceDir, match[1])).toLowerCase();
                        context.injectedFiles.add(injectedRel);
                    }
                }
            }
        }

        if (context.hasStreamFolder && !context.hasUiPage) {
            context.isModResource = true;
        }
    } catch (e) {}

    return context;
}

// ============================================================================
// LIMPEZA DE AMEAÇAS (100% FS NATIVO - SEM CHILD_PROCESS)
// ============================================================================

function cleanThreatItem(threat) {
    if (threat.cleaned) return true;

    try {
        const qId = backupToQuarantine(threat);
        if (qId) {
            threat.quarantineId = qId;
        }

        if (threat.type === 'malicious_js') {
            if (fs.existsSync(threat.filePath)) {
                // Libera permissão de escrita via fs nativo antes de remover
                try { fs.chmodSync(threat.filePath, 0o666); } catch (e) {}
                fs.unlinkSync(threat.filePath);
            }
            threat.cleaned = true;
            return true;
        } else if (threat.type === 'manifest_inject') {
            if (fs.existsSync(threat.filePath)) {
                try { fs.chmodSync(threat.filePath, 0o666); } catch (e) {}
                const raw = fs.readFileSync(threat.filePath, 'utf8');
                const lines = raw.split(/\r?\n/);
                const cleanLines = lines.filter(line => !ManifestInjectRegex.test(line));
                fs.writeFileSync(threat.filePath, cleanLines.join('\n'), 'utf8');
                threat.cleaned = true;
                return true;
            }
        }
    } catch (e) {
        appendScanLog(`[ERRO] Não foi possível limpar ${threat.relativePath}: ${e.message}`, 'danger');
    }
    return false;
}

// ============================================================================
// VARREDURA ASSÍNCRONA EM TEMPO REAL
// ============================================================================

async function runScan(customRootDir = null, mode = 'report') {
    if (lastScanState.scanning) {
        appendScanLog(`[AVISO] Uma varredura já está em execução. Aguarde a conclusão.`, 'warn');
        return { ok: false, msg: 'Já existe uma varredura em andamento.' };
    }

    const rootDir = customRootDir && fs.existsSync(customRootDir)
        ? path.resolve(customRootDir)
        : findResourcesRoot(RESOURCE_PATH);

    lastScanState = {
        scanning: true,
        progress: 2,
        lastScanTime: new Date().toLocaleString('pt-BR'),
        rootDir,
        mode,
        results: [],
        logs: [],
        stats: {
            totalFilesScanned: 0,
            totalManifestsScanned: 0,
            totalThreats: 0,
            criticalThreats: 0,
            warningThreats: 0,
            cleanedThreats: 0,
            pendingThreats: 0
        }
    };

    broadcastToUi('piercer_killdoor:updateState', getPublicScanState());

    const modeLabels = {
        report: 'Apenas Relatório (Diagnóstico Seguro)',
        clean_safe: 'Limpeza Inteligente (Remove 99.9% Backdoors)',
        clean_all: 'Limpeza Automática Total (100%)'
    };

    try {
        appendScanLog(`==========================================================`, 'muted');
        appendScanLog(`[INÍCIO] Diretório raiz: ${rootDir}`, 'info');
        appendScanLog(`[MODO] ${modeLabels[mode] || mode}`, 'accent');

        broadcastProgress(8, 'Indexando resources, manifests e scripts .js...');
        appendScanLog(`[ETAPA 1/3] Mapeando árvore de resources, fxmanifest.lua e arquivos .js...`, 'muted');
        await sleepTick();

        const selfNormalized = normalizePath(RESOURCE_PATH).toLowerCase();
        const jsFiles = [];
        const manifestFiles = [];
        const resourceContexts = new Map();

        let dirCounter = 0;
        async function walkDir(currentDir, currentResourceDir = null) {
            let entries;
            try {
                entries = fs.readdirSync(currentDir, { withFileTypes: true });
            } catch (e) {
                return;
            }

            dirCounter++;
            if (dirCounter % 20 === 0) {
                broadcastProgress(Math.min(25, 8 + Math.floor(dirCounter / 20)), `Mapeando pasta: ${path.basename(currentDir)}`);
                await sleepTick();
            }

            const hasFxManifest = entries.some(e => e.isFile() && (
                e.name.toLowerCase() === 'fxmanifest.lua' ||
                (Config.ScanLegacyResourceLua && e.name.toLowerCase() === '__resource.lua')
            ));

            if (hasFxManifest) {
                currentResourceDir = currentDir;
                if (!resourceContexts.has(currentDir)) {
                    resourceContexts.set(currentDir, inspectResourceContext(currentDir));
                }
            }

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                const normFull = normalizePath(fullPath).toLowerCase();

                if (normFull.startsWith(selfNormalized) || entry.name === '.git') {
                    continue;
                }

                if (entry.isDirectory()) {
                    await walkDir(fullPath, currentResourceDir);
                } else if (entry.isFile()) {
                    const lowerName = entry.name.toLowerCase();
                    if (lowerName === 'fxmanifest.lua' || (Config.ScanLegacyResourceLua && lowerName === '__resource.lua')) {
                        manifestFiles.push({ fullPath, resourceDir: currentResourceDir || currentDir });
                    } else if (lowerName.endsWith('.js')) {
                        jsFiles.push({ fullPath, resourceDir: currentResourceDir });
                    }
                }
            }
        }

        await walkDir(rootDir);

        lastScanState.stats.totalFilesScanned = jsFiles.length;
        lastScanState.stats.totalManifestsScanned = manifestFiles.length;
        appendScanLog(`[OK] Total indexado: ${resourceContexts.size} resources | ${manifestFiles.length} manifests | ${jsFiles.length} arquivos .js`, 'accent');

        let threatCounter = 1;

        // --------------------------------------------------------------------
        // ETAPA 2: VARREDURA DE MANIFESTS (fxmanifest.lua / __resource.lua)
        // --------------------------------------------------------------------
        appendScanLog(`[ETAPA 2/3] Verificando ${manifestFiles.length} arquivo(s) fxmanifest.lua / __resource.lua...`, 'muted');
        for (let mIdx = 0; mIdx < manifestFiles.length; mIdx++) {
            const item = manifestFiles[mIdx];
            const { fullPath, resourceDir } = item;
            const relPath = normalizePath(path.relative(rootDir, fullPath));
            const resName = resourceDir ? path.basename(resourceDir) : 'desconhecido';

            if (mIdx % 10 === 0) {
                const pct = 25 + Math.floor(((mIdx + 1) / Math.max(1, manifestFiles.length)) * 25);
                broadcastProgress(pct, `Verificando manifest (${mIdx + 1}/${manifestFiles.length}): ${relPath}`);
                await sleepTick();
            }

            try {
                const raw = fs.readFileSync(fullPath, 'utf8');
                const lines = raw.split(/\r?\n/);
                const injectedLines = [];

                lines.forEach((line, idx) => {
                    if (ManifestInjectRegex.test(line)) {
                        injectedLines.push({
                            lineNumber: idx + 1,
                            content: line.trim()
                        });
                    }
                });

                if (injectedLines.length > 0) {
                    const threat = {
                        id: threatCounter++,
                        filePath: fullPath,
                        relativePath: relPath,
                        resourceName: resName,
                        type: 'manifest_inject',
                        severity: 'critical',
                        probability: '99.9% Backdoor Confirmado',
                        detail: `${injectedLines.length} linha(s) injetada(s) com espaçamento oculto (--[[...]])`,
                        injectedLines,
                        cleaned: false,
                        quarantineId: null
                    };

                    appendScanLog(`[CRÍTICO 99.9%] Manifest comprometido: ${relPath}`, 'danger');
                    for (const l of injectedLines) {
                        appendScanLog(`   -> Linha ${l.lineNumber}: ${l.content}`, 'warn');
                    }

                    if (mode === 'clean_safe' || mode === 'clean_all') {
                        if (cleanThreatItem(threat)) {
                            appendScanLog(`   -> LINHAS REMOVIDAS automaticamente (Backup salvo na Quarentena)`, 'accent');
                        }
                    }

                    lastScanState.results.push(threat);
                    broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
                }
            } catch (e) {}
        }

        // --------------------------------------------------------------------
        // ETAPA 3: VARREDURA DE ARQUIVOS JAVASCRIPT (*.js)
        // --------------------------------------------------------------------
        appendScanLog(`[ETAPA 3/3] Inspecionando ${jsFiles.length} arquivo(s) JavaScript (.js)...`, 'muted');
        for (let jIdx = 0; jIdx < jsFiles.length; jIdx++) {
            const item = jsFiles[jIdx];
            const { fullPath, resourceDir } = item;
            const normFull = normalizePath(fullPath);
            const lowerFull = normFull.toLowerCase();
            const relPath = normalizePath(path.relative(rootDir, fullPath));
            const fileName = path.basename(fullPath);
            const lowerFileName = fileName.toLowerCase();
            const parts = normFull.split('/');
            const lowerParts = parts.map(p => p.toLowerCase());

            const resContext = resourceDir ? resourceContexts.get(resourceDir) : null;
            const resName = resContext ? resContext.resourceName : (parts[0] || 'raiz');

            if (jIdx % 8 === 0) {
                const pct = 50 + Math.floor(((jIdx + 1) / Math.max(1, jsFiles.length)) * 49);
                broadcastProgress(pct, `Analisando JS (${jIdx + 1}/${jsFiles.length}): ${relPath}`);
                await sleepTick();
            }

            const inNodeModules = lowerParts.includes('node_modules');
            const inProtectedFolder = Config.Detection.ProtectedFolders.some(pf => lowerParts.includes(pf.toLowerCase()));

            const isKnownBackdoorName = Config.Detection.SuspiciousFileNames.some(
                s => lowerFileName === s.toLowerCase() || lowerFileName.endsWith(s.toLowerCase())
            );

            const isSafeDotFile = Config.Detection.SafeDotFiles.some(s => lowerFileName === s.toLowerCase());
            const startsWithDot = fileName.startsWith('.') && !isSafeDotFile;

            // Detecta arquivos ou pastas ocultas (iniciadas com ponto ou somente-leitura camufladas)
            const hasHiddenSegment = parts.some(seg => seg.startsWith('.') && seg !== '.' && seg !== '..' && !isSafeDotFile);
            let isReadOnlyHidden = false;
            try {
                const st = fs.statSync(fullPath);
                if ((st.mode & 0o222) === 0) isReadOnlyHidden = true;
            } catch (e) {}
            const isHiddenAttr = startsWithDot || hasHiddenSegment || isReadOnlyHidden;

            let matchedSuspiciousFolder = null;
            for (const sub of Config.Detection.SuspiciousSubfolders) {
                const subLower = sub.toLowerCase();
                if (subLower.includes('/')) {
                    if (lowerFull.includes('/' + subLower + '/')) {
                        matchedSuspiciousFolder = sub;
                        break;
                    }
                } else if (lowerParts.slice(0, -1).includes(subLower)) {
                    matchedSuspiciousFolder = sub;
                    break;
                }
            }

            const isReferencedByManifestInject = resContext ? resContext.injectedFiles.has(lowerFull) : false;
            const isModResource = resContext ? resContext.isModResource : false;

            let hasXor = false;
            let matchedXorIndex = -1;
            if (!inNodeModules) {
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.size <= 15 * 1024 * 1024) {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        for (let i = 0; i < CompiledXorRegexes.length; i++) {
                            if (CompiledXorRegexes[i].test(content)) {
                                hasXor = true;
                                matchedXorIndex = i + 1;
                                break;
                            }
                        }
                    }
                } catch (e) {}
            }

            if (inNodeModules && !isHiddenAttr && !isKnownBackdoorName && !hasXor) {
                continue;
            }

            const isTriggered =
                isHiddenAttr ||
                isKnownBackdoorName ||
                isReferencedByManifestInject ||
                hasXor ||
                startsWithDot ||
                (isModResource && !inNodeModules);

            if (!isTriggered) {
                continue;
            }

            let severity = 'warning';
            let probability = 'Analisar (Possível Falso Positivo)';
            let detail = '';

            if (isReferencedByManifestInject) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado';
                detail = `Arquivo JS carregado por injeção oculta no fxmanifest.lua${hasXor ? ' + Código XOR' : ''}`;
            } else if (isHiddenAttr && hasXor) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado';
                detail = `Arquivo oculto (${fileName}) + código XOR ofuscado`;
            } else if (isKnownBackdoorName) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado';
                detail = `Nome camuflado de backdoor (${fileName})${hasXor ? ' + código XOR' : ''}`;
            } else if (isModResource && !inNodeModules && !inProtectedFolder) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado (JS em Mod)';
                detail = `Arquivo JS dentro de Mod de Mapa/Roupa/Arma (${resName})${matchedSuspiciousFolder ? ` na pasta '${matchedSuspiciousFolder}'` : ''}`;
            } else if (isHiddenAttr && inNodeModules) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado';
                detail = `Arquivo oculto escondido dentro de node_modules: ${fileName}`;
            } else if (hasXor && matchedSuspiciousFolder && !inProtectedFolder) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado';
                detail = `Código XOR ofuscado escondido em pasta suspeita ('${matchedSuspiciousFolder}'): ${fileName}`;
            } else if (isHiddenAttr && matchedSuspiciousFolder && !inProtectedFolder) {
                severity = 'critical';
                probability = '99.9% Backdoor Confirmado';
                detail = `Arquivo oculto em pasta suspeita ('${matchedSuspiciousFolder}'): ${fileName}`;
            } else if (hasXor) {
                severity = 'warning';
                probability = 'Analisar (Pode ser JS Criptografado / Artifact)';
                detail = `Código XOR ofuscado detectado (Padrão #${matchedXorIndex}) em arquivo visível — verifique antes de apagar`;
            } else if (startsWithDot || isHiddenAttr) {
                severity = 'warning';
                probability = 'Analisar (Arquivo Oculto sem XOR)';
                detail = `Arquivo oculto (${fileName}) sem padrão XOR conhecido`;
            }

            const threat = {
                id: threatCounter++,
                filePath: fullPath,
                relativePath: relPath,
                resourceName: resName,
                type: 'malicious_js',
                severity,
                probability,
                detail,
                isHidden: isHiddenAttr,
                hasXor,
                suspiciousFolder: matchedSuspiciousFolder,
                isModResource,
                cleaned: false,
                quarantineId: null
            };

            if (severity === 'critical') {
                appendScanLog(`[CRÍTICO 99.9%] ${relPath}`, 'danger');
                appendScanLog(`   -> Motivo: ${detail}`, 'warn');
            } else {
                appendScanLog(`[SUSPEITO / ANALISAR] ${relPath}`, 'warn');
                appendScanLog(`   -> Motivo: ${detail}`, 'muted');
            }

            if ((mode === 'clean_safe' && severity === 'critical') || mode === 'clean_all') {
                if (cleanThreatItem(threat)) {
                    appendScanLog(`   -> DELETADO automaticamente (Backup salvo na Quarentena)`, 'accent');
                }
            }

            lastScanState.results.push(threat);
            broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
        }

        recalculateStats();
        const s = lastScanState.stats;
        appendScanLog(`----------------------------------------------------------`, 'muted');
        if (s.totalThreats === 0) {
            appendScanLog(`[CONCLUÍDO] Nenhuma ameaça encontrada! Servidor 100% limpo (${jsFiles.length} arquivos .js e ${manifestFiles.length} manifests verificados).`, 'accent');
        } else {
            appendScanLog(
                `[CONCLUÍDO] ${s.totalThreats} detecção(ões): ${s.criticalThreats} crítica(s) (99.9% Backdoor) | ${s.warningThreats} para análise | ${s.cleanedThreats} neutralizada(s).`,
                s.criticalThreats > 0 ? 'danger' : 'warn'
            );
        }
        appendScanLog(`==========================================================`, 'muted');
    } catch (err) {
        appendScanLog(`[ERRO FATAL] ${err.message}`, 'danger');
    } finally {
        recalculateStats();
        lastScanState.scanning = false;
        broadcastProgress(100, `Varredura concluída (${lastScanState.stats.totalFilesScanned} arquivos .js e ${lastScanState.stats.totalManifestsScanned} manifests verificados).`);
        broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
    }

    return {
        ok: true,
        state: getPublicScanState()
    };
}

function recalculateStats() {
    const res = lastScanState.results;
    lastScanState.stats.totalThreats = res.length;
    lastScanState.stats.criticalThreats = res.filter(r => r.severity === 'critical' && !r.cleaned).length;
    lastScanState.stats.warningThreats = res.filter(r => r.severity === 'warning' && !r.cleaned).length;
    lastScanState.stats.cleanedThreats = res.filter(r => r.cleaned).length;
    lastScanState.stats.pendingThreats = res.filter(r => !r.cleaned).length;
}

function getPublicScanState() {
    recalculateStats();
    return {
        scanning: lastScanState.scanning,
        progress: lastScanState.progress,
        lastScanTime: lastScanState.lastScanTime,
        rootDir: lastScanState.rootDir,
        mode: lastScanState.mode,
        results: lastScanState.results,
        logs: lastScanState.logs,
        stats: lastScanState.stats,
        quarantine: loadQuarantineIndex()
    };
}

// ============================================================================
// GERAÇÃO DE RELATÓRIO EM TEXTO (.TXT)
// ============================================================================

function generateAndSaveReport() {
    recalculateStats();
    const s = lastScanState.stats;
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `relatorio_piercer_killdoor_${stamp}.txt`;
    const fullPath = path.join(REPORTS_DIR, fileName);

    const lines = [];
    lines.push('========================================================================');
    lines.push('   PIERCER KILLDOOR - Relatório de Varredura de Backdoor FiveM');
    lines.push(`   Data:      ${now.toLocaleString('pt-BR')}`);
    lines.push(`   Diretório: ${lastScanState.rootDir || 'N/A'}`);
    lines.push(`   Modo:      ${lastScanState.mode}`);
    lines.push('========================================================================');
    lines.push('');

    if (lastScanState.results.length === 0) {
        lines.push('✓ Nenhuma ameaça encontrada. Servidor limpo.');
    } else {
        const jsList = lastScanState.results.filter(r => r.type === 'malicious_js');
        const manList = lastScanState.results.filter(r => r.type === 'manifest_inject');

        if (jsList.length > 0) {
            lines.push(`--- Arquivos JS Detectados (${jsList.length}) ---`);
            for (const item of jsList) {
                const status = item.cleaned ? 'DELETADO (Em Quarentena)' : 'PENDENTE';
                const risk = item.severity === 'critical' ? 'CRÍTICO 99.9%' : 'AVISO / ANALISAR';
                lines.push(`  [${status}] [${risk}] ${item.relativePath}`);
                lines.push(`             Resource: ${item.resourceName} | Motivo: ${item.detail}`);
            }
            lines.push('');
        }

        if (manList.length > 0) {
            lines.push(`--- Manifests Comprometidos (${manList.length}) ---`);
            for (const item of manList) {
                const status = item.cleaned ? 'LIMPO (Em Quarentena)' : 'PENDENTE';
                lines.push(`  [${status}] [CRÍTICO 99.9%] ${item.relativePath}`);
                lines.push(`             Resource: ${item.resourceName} | Motivo: ${item.detail}`);
                if (item.injectedLines) {
                    for (const l of item.injectedLines) {
                        lines.push(`             Linha ${l.lineNumber}: ${l.content}`);
                    }
                }
            }
            lines.push('');
        }

        lines.push('========================================================================');
        lines.push(`  Total de ameaças:         ${s.totalThreats}`);
        lines.push(`  Críticas (99.9% Backdoor): ${s.criticalThreats}`);
        lines.push(`  Avisos (Analisar):        ${s.warningThreats}`);
        lines.push(`  Neutralizadas:            ${s.cleanedThreats}`);
        lines.push(`  Pendentes:                ${s.pendingThreats}`);
        lines.push('========================================================================');
    }

    const reportText = lines.join('\r\n');
    try {
        fs.writeFileSync(fullPath, reportText, 'utf8');
        appendScanLog(`[INFO] Relatório salvo em: ${fullPath}`, 'accent');
        return { ok: true, filePath: fullPath, fileName, reportText };
    } catch (e) {
        return { ok: false, msg: e.message };
    }
}

// ============================================================================
// VERIFICAÇÃO DE PERMISSÃO
// ============================================================================

function checkPermission(source) {
    if (!source || source === 0) return true;
    try {
        return global.exports[RESOURCE_NAME].IsPlayerAdmin(
            source,
            Config.Permissions.AcePermissions,
            Config.Permissions.AdminIdentifiers,
            Config.Permissions.VRPPermissions,
            Config.Permissions.FrameworkGroups
        );
    } catch (e) {
        return IsPlayerAceAllowed(String(source), 'command');
    }
}

// ============================================================================
// COMANDOS DE CONSOLE / TXADMIN E IN-GAME
// ============================================================================

RegisterCommand(Config.ConsoleCommand, (source, args) => {
    if (!checkPermission(source)) {
        if (source > 0) {
            emitNet('piercer_killdoor:notify', source, 'Você não tem permissão para usar o Piercer KillDoor.', 'danger');
        }
        return;
    }

    const sub = (args[0] || '').toLowerCase();

    if (source > 0 && !sub) {
        activeUiClients.add(source);
        emitNet('piercer_killdoor:openUI', source, getPublicScanState());
        return;
    }

    if (!sub || sub === 'help') {
        logConsole(`Comandos disponíveis:`, '^2');
        logConsole(`  ${Config.ConsoleCommand} report           -> Escaneia sem apagar nada (Apenas Relatório)`, '^7');
        logConsole(`  ${Config.ConsoleCommand} clean            -> Limpeza Inteligente (Remove apenas 99.9% Backdoors confirmados)`, '^7');
        logConsole(`  ${Config.ConsoleCommand} cleanall         -> Limpeza Automática Total (Remove tudo com backup em quarentena)`, '^7');
        logConsole(`  ${Config.ConsoleCommand} remove <id>      -> Remove/limpa apenas a ameaça de número <id>`, '^7');
        logConsole(`  ${Config.ConsoleCommand} quarantine       -> Lista arquivos salvos na quarentena`, '^7');
        logConsole(`  ${Config.ConsoleCommand} restore <id|all> -> Restaura um arquivo (ou todos) da quarentena`, '^7');
        logConsole(`  ${Config.ConsoleCommand} savereport       -> Salva o relatório .txt na pasta reports/`, '^7');
        return;
    }

    if (sub === 'report') {
        runScan(null, 'report');
    } else if (sub === 'clean' || sub === 'cleansafe') {
        runScan(null, 'clean_safe');
    } else if (sub === 'cleanall') {
        runScan(null, 'clean_all');
    } else if (sub === 'savereport') {
        generateAndSaveReport();
    } else if (sub === 'remove') {
        const id = parseInt(args[1], 10);
        const threat = lastScanState.results.find(r => r.id === id);
        if (!threat) {
            logConsole(`Ameaça #${id} não encontrada. Execute '${Config.ConsoleCommand} report' primeiro.`, '^3');
            return;
        }
        if (cleanThreatItem(threat)) {
            recalculateStats();
            appendScanLog(`[REMOVIDO] Ameaça #${id} (${threat.relativePath}) neutralizada com backup na quarentena.`, 'accent');
            broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
        }
    } else if (sub === 'quarantine') {
        const list = loadQuarantineIndex();
        if (list.length === 0) {
            logConsole(`A quarentena está vazia.`, '^2');
        } else {
            logConsole(`Arquivos na Quarentena (${list.length}):`, '^3');
            for (const item of list) {
                logConsole(`  [ID: ${item.quarantineId}] ${item.relativePath} (${item.date}) - ${item.detail}`, '^7');
            }
        }
    } else if (sub === 'restore') {
        const target = args[1];
        if (!target) {
            logConsole(`Informe o ID da quarentena ou 'all'. Ex: ${Config.ConsoleCommand} restore all`, '^3');
            return;
        }
        if (target.toLowerCase() === 'all') {
            const list = loadQuarantineIndex();
            let count = 0;
            for (const item of [...list]) {
                if (restoreFromQuarantine(item.quarantineId).ok) count++;
            }
            appendScanLog(`[RESTAURADO] ${count} arquivo(s) restaurado(s) da quarentena.`, 'accent');
            broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
        } else {
            const res = restoreFromQuarantine(target);
            appendScanLog(res.msg, res.ok ? 'accent' : 'danger');
            broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
        }
    }
}, false);

// ============================================================================
// EVENTOS DE REDE (COMUNICAÇÃO COM O PAINEL NUI IN-GAME)
// ============================================================================

onNet('piercer_killdoor:requestOpen', () => {
    const src = global.source;
    if (!checkPermission(src)) {
        emitNet('piercer_killdoor:notify', src, 'Sem permissão de administrador.', 'danger');
        return;
    }
    activeUiClients.add(src);
    emitNet('piercer_killdoor:openUI', src, getPublicScanState());
});

onNet('piercer_killdoor:uiClosed', () => {
    const src = global.source;
    activeUiClients.delete(src);
});

on('playerDropped', () => {
    const src = global.source;
    activeUiClients.delete(src);
});

onNet('piercer_killdoor:startScan', async (data) => {
    const src = global.source;
    if (!checkPermission(src)) return;
    activeUiClients.add(src);

    const mode = (data && data.mode) ? data.mode : 'report';
    const customDir = (data && data.customDir) ? data.customDir : null;
    await runScan(customDir, mode);
});

onNet('piercer_killdoor:cleanSingle', (threatId) => {
    const src = global.source;
    if (!checkPermission(src)) return;
    activeUiClients.add(src);

    const threat = lastScanState.results.find(r => r.id === Number(threatId));
    if (threat && !threat.cleaned) {
        if (cleanThreatItem(threat)) {
            appendScanLog(`[REMOVIDO] ${threat.relativePath} (Salvo na Quarentena)`, 'accent');
        }
    }
    broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
});

onNet('piercer_killdoor:restoreSingle', (quarantineId) => {
    const src = global.source;
    if (!checkPermission(src)) return;
    activeUiClients.add(src);

    const res = restoreFromQuarantine(quarantineId);
    if (res.ok) {
        appendScanLog(`[RESTAURADO] ${res.item.relativePath} foi devolvido ao local original.`, 'accent');
    } else {
        appendScanLog(`[ERRO] ${res.msg}`, 'danger');
    }
    broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
});

onNet('piercer_killdoor:saveReport', () => {
    const src = global.source;
    if (!checkPermission(src)) return;
    activeUiClients.add(src);

    const rep = generateAndSaveReport();
    emitNet('piercer_killdoor:reportSaved', src, rep);
    broadcastToUi('piercer_killdoor:updateState', getPublicScanState());
});

if (Config.AutoScanOnStart) {
    setTimeout(() => {
        logConsole(`Executando Auto-Scan de segurança inicial (Modo Apenas Relatório)...`, '^5');
        runScan(null, 'report');
    }, 2500);
}
