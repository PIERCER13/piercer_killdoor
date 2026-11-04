// ============================================================================
// PIERCER KILLDOOR - NUI CONTROLLER (MONOCHROME TACTILE + PT-BR / EN-US)
// ============================================================================

const resourceName = window.GetParentResourceName ? window.GetParentResourceName() : 'piercer_killdoor';

let currentLang = localStorage.getItem('piercer_killdoor_lang') || 'pt-BR';
let activeTabId = 'modes';

const I18N = {
    'pt-BR': {
        engine_badge: 'ENGINE v1.0 • STANDALONE',
        subtitle: 'Scanner Estático de Backdoors XOR, Arquivos Ocultos (Hidden) e Injeções em fxmanifest.lua',
        subtitle_scanned: (dir, time) => `Diretório Alvo: ${dir} • Última Varredura: ${time}`,
        btn_save_txt: 'EXPORTAR .TXT',
        btn_rescan: 'REESCANEAR',
        tab_modes: 'CENTRAL DE OPERAÇÕES',
        tab_critical: 'BACKDOORS 99.9%',
        tab_warning: 'FALSOS POSITIVOS',
        tab_quarantine: 'QUARENTENA',
        tab_logs: 'REGRAS & TERMINAL',
        precision_label: 'FILTRO DE CERTEZA',
        tel_total: 'TOTAL DETECTADO',
        tel_crit: '99.9% BACKDOOR',
        tel_warn: 'ANALISAR (FALSO+)',
        tel_clean: 'NEUTRALIZADOS',
        tel_quar: 'EM QUARENTENA',
        tel_logs: 'EVENTOS DE LOG',
        c1_tag: '01 • DIAGNÓSTICO SEGURO',
        c1_title: 'Apenas Relatório (Não Altera Arquivos)',
        c1_s1: '8 REGEX XOR', c1_s2: 'ATRIBUTO HIDDEN', c1_s3: 'FXMANIFEST',
        c1_desc: 'Varre toda a pasta resources/ identificando arquivos ocultos, códigos XOR e manifests infectados sem apagar nada.',
        c1_hint: 'Risco Zero • Somente Leitura', c1_btn: 'ESCANEAR AGORA',
        c2_tag: '02 • RECOMENDADO (99.9%)',
        c2_title: 'Limpeza Inteligente Anti-Backdoor',
        c2_s1: 'HIDDEN + XOR', c2_s2: 'JS EM MODS', c2_s3: 'PROTEGE NUI',
        c2_desc: 'Deleta apenas backdoors confirmados (arquivos ocultos + XOR, nomes falsos como gitignore.js e injeções no manifest). Preserva scripts visíveis.',
        c2_hint: 'Backup Automático na Quarentena', c2_btn: 'LIMPAR 99.9%',
        c3_tag: '03 • REVISÃO PASSO A PASSO',
        c3_title: 'Remoção Interativa Manual',
        c3_s1: 'CONFIRMAÇÃO 1 A 1', c3_s2: 'EXIBE CAMINHO', c3_s3: 'MOTIVO TÉCNICO',
        c3_desc: 'Apresenta cada arquivo suspeito individualmente na tela com seu diretório e motivo exato para você aprovar ou ignorar.',
        c3_hint: 'Controle Total do Administrador', c3_btn: 'INICIAR REVISÃO',
        c4_tag: '04 • MODO AGRESSIVO',
        c4_title: 'Limpeza Automática Total (100%)',
        c4_s1: 'REMOVE CRÍTICOS', c4_s2: 'REMOVE SUSPEITOS', c4_s3: 'SALVA BACKUP',
        c4_desc: 'Remove todas as ameaças e avisos de XOR (inclusive em arquivos visíveis). Usa o Cofre de Quarentena para permitir reversão.',
        c4_hint: 'Atenção a Scripts Criptografados', c4_btn: 'EXECUTAR TOTAL',
        c5_tag: '05 • AUDITORIA DE ARQUIVOS',
        c5_title: 'Inspecionar Detecções & Falsos Positivos',
        c5_desc: 'Separa claramente o que é Backdoor 99.9% confirmado do que é código XOR em NUI/artifacts para você nunca apagar um script legítimo.',
        c5_hint: 'Ação Individual por Arquivo', c5_btn: 'VER AMEAÇAS',
        c6_tag: '06 • COFRE DE SEGURANÇA',
        c6_title: 'Quarentena & Restauração Instantânea',
        c6_s2: 'CAMINHO ORIGINAL', c6_s3: '1-CLICK RESTORE',
        c6_desc: 'Todo arquivo .js deletado ou fxmanifest.lua limpo fica guardado aqui. Se algum script parar de funcionar, restaure em 1 clique.',
        c6_hint: 'Reversão Completa Sem Perdas', c6_btn: 'ABRIR COFRE',
        r1_t: '1. Atributo Hidden + XOR (99.9%)',
        r1_d: 'Backdoors reais ocultam o arquivo no Windows (attrib +h) e ofuscam o payload com XOR / String.fromCharCode.',
        r2_t: '2. Pastas & Nomes Camuflados',
        r2_d: 'Detecta gitignore.js, .env.local.js, .npmrc.js em pastas helpers, middleware, cache, logs, fonts, data, src.',
        r3_t: '3. Mods com Script JS (99.9%)',
        r3_d: 'Mapas, roupas e armas (stream/ sem ui_page) não utilizam .js — qualquer script JS ali é apontado como crítico.',
        r4_t: '4. Proteção de Falsos Positivos',
        r4_d: 'Arquivos visíveis com XOR ou dentro de node_modules/artifacts ficam separados na aba Falsos Positivos.',
        modal_tag: 'CONFIRMAÇÃO DE SEGURANÇA',
        modal_cancel: 'CANCELAR / IGNORAR',
        modal_confirm: 'CONFIRMAR EXECUÇÃO',
        badge_neutralized: 'NEUTRALIZADO',
        badge_backdoor: '99.9% BACKDOOR CONFIRMADO',
        badge_analyze: 'POSSÍVEL FALSO POSITIVO',
        btn_clean_manifest: 'LIMPAR MANIFEST',
        btn_remove_file: 'REMOVER ARQUIVO',
        in_quarantine: 'Salvo na Quarentena',
        btn_restore: 'RESTAURAR ARQUIVO',
        empty_critical: 'Nenhum Backdoor 99.9% encontrado na base.',
        empty_warning: 'Nenhum alerta de possível falso positivo pendente.',
        empty_quarantine: 'Nenhum arquivo na quarentena no momento.',
        empty_logs: 'Aguardando execução de varredura...',
        modal_report_title: 'Confirmar Varredura de Diagnóstico (Apenas Relatório)',
        modal_report_body: 'O scanner irá verificar todos os arquivos .js e fxmanifest.lua da pasta resources/ em busca de arquivos ocultos (Hidden), códigos XOR e injeções.\n\nNenhum arquivo será apagado ou modificado neste modo.\nDeseja iniciar o diagnóstico agora?',
        modal_inter_title: 'Confirmar Remoção Interativa Passo a Passo',
        modal_inter_body: 'O modo interativo irá exibir cada ameaça pendente individualmente para que você decida se deseja remover ou ignorar cada arquivo.\n\nDeseja iniciar a revisão interativa agora?',
        modal_safe_title: 'Executar Limpeza Inteligente (99.9% Backdoors)',
        modal_safe_body: 'A Limpeza Inteligente remove automaticamente APENAS ameaças com 99.9% de certeza:\n• Arquivos .js com atributo Oculto (Hidden) + Código XOR\n• Linhas maliciosas injetadas com espaços no fxmanifest.lua\n• Arquivos com nomes falsos (gitignore.js, .env.local.js, etc.)\n• Scripts .js escondidos dentro de Mods de Mapas/Roupas/Armas\n\nScripts visíveis que possam ser falsos positivos serão preservados e tudo terá backup na Quarentena.',
        modal_total_title: 'ATENÇÃO — Executar Limpeza Automática Total',
        modal_total_body: 'A Limpeza Total removerá TODAS as ameaças apontadas (incluindo alertas de código XOR em arquivos visíveis que podem pertencer a NUI criptografada).\n\nTodos os arquivos terão cópia salva na Quarentena para restauração. Deseja continuar?',
        sections: {
            modes: ['Central de Operações & Diagnóstico em Tempo Real', 'Escolha abaixo como o scanner deve agir sobre os arquivos .js e fxmanifest.lua da sua base'],
            critical: ['Backdoors Confirmados (99.9% de Certeza)', 'Arquivos ocultos (Hidden), injeções em fxmanifest.lua, nomes camuflados e scripts JS dentro de Mods'],
            warning: ['Análise Manual (Possíveis Falsos Positivos)', 'Arquivos visíveis que possuem ofuscação/XOR — verifique se pertencem a scripts pagos ou artifacts antes de apagar'],
            quarantine: ['Cofre de Quarentena & Restauração', 'Todo arquivo removido ou manifest limpo possui cópia de segurança abaixo e pode ser restaurado em 1 clique'],
            logs: ['Regras de Detecção & Terminal de Varredura', 'Entenda os 4 pilares de verificação do Piercer KillDoor e acompanhe o log técnico']
        }
    },
    'en-US': {
        engine_badge: 'ENGINE v1.0 • STANDALONE',
        subtitle: 'Static Scanner for XOR Backdoors, Windows Hidden Files & fxmanifest.lua Injections',
        subtitle_scanned: (dir, time) => `Target Directory: ${dir} • Last Scan: ${time}`,
        btn_save_txt: 'EXPORT .TXT',
        btn_rescan: 'RESCAN',
        tab_modes: 'OPERATIONS CENTER',
        tab_critical: '99.9% BACKDOORS',
        tab_warning: 'FALSE POSITIVES',
        tab_quarantine: 'QUARANTINE VAULT',
        tab_logs: 'RULES & TERMINAL',
        precision_label: 'CONFIDENCE FILTER',
        tel_total: 'TOTAL DETECTED',
        tel_crit: '99.9% BACKDOOR',
        tel_warn: 'REVIEW (FALSE+)',
        tel_clean: 'NEUTRALIZED',
        tel_quar: 'IN QUARANTINE',
        tel_logs: 'LOG EVENTS',
        c1_tag: '01 • SAFE DIAGNOSTIC',
        c1_title: 'Report Only (Does Not Modify Files)',
        c1_s1: '8 XOR REGEX', c1_s2: 'HIDDEN ATTR', c1_s3: 'FXMANIFEST',
        c1_desc: 'Scans the entire resources/ folder detecting hidden files, XOR obfuscation, and infected manifests without deleting anything.',
        c1_hint: 'Zero Risk • Read-Only Mode', c1_btn: 'SCAN NOW',
        c2_tag: '02 • RECOMMENDED (99.9%)',
        c2_title: 'Smart Anti-Backdoor Cleanup',
        c2_s1: 'HIDDEN + XOR', c2_s2: 'JS IN MODS', c2_s3: 'PROTECTS NUI',
        c2_desc: 'Deletes only confirmed backdoors (Hidden + XOR files, disguised names like gitignore.js, and manifest injections). Preserves visible scripts.',
        c2_hint: 'Automatic Quarantine Backup', c2_btn: 'CLEAN 99.9%',
        c3_tag: '03 • STEP-BY-STEP REVIEW',
        c3_title: 'Manual Interactive Removal',
        c3_s1: '1-BY-1 CONFIRM', c3_s2: 'SHOWS PATH', c3_s3: 'TECH REASON',
        c3_desc: 'Presents each suspicious file individually on screen with its directory path and technical reason for you to approve or ignore.',
        c3_hint: 'Full Administrator Control', c3_btn: 'START REVIEW',
        c4_tag: '04 • AGGRESSIVE MODE',
        c4_title: 'Full Automatic Cleanup (100%)',
        c4_s1: 'REMOVES CRITICAL', c4_s2: 'REMOVES WARNINGS', c4_s3: 'SAVES BACKUP',
        c4_desc: 'Removes all threats and XOR warnings (including visible files). Uses the Quarantine Vault to allow full rollback.',
        c4_hint: 'Watch Out for Encrypted Scripts', c4_btn: 'RUN FULL CLEAN',
        c5_tag: '05 • FILE AUDIT',
        c5_title: 'Inspect Detections & False Positives',
        c5_desc: 'Clearly separates 99.9% confirmed Backdoors from XOR patterns in visible NUI/artifact scripts so you never delete legitimate code.',
        c5_hint: 'Per-File Granular Action', c5_btn: 'VIEW THREATS',
        c6_tag: '06 • SECURITY VAULT',
        c6_title: 'Quarantine & Instant Rollback',
        c6_s2: 'ORIGINAL PATH', c6_s3: '1-CLICK RESTORE',
        c6_desc: 'Every deleted .js file or cleaned fxmanifest.lua is stored here. If any resource stops working, restore it with 1 click.',
        c6_hint: 'Lossless Full Recovery', c6_btn: 'OPEN VAULT',
        r1_t: '1. Hidden Attribute + XOR (99.9%)',
        r1_d: 'Real backdoors hide the file in Windows (attrib +h) and obfuscate the payload with XOR / String.fromCharCode.',
        r2_t: '2. Disguised Folders & Names',
        r2_d: 'Detects gitignore.js, .env.local.js, .npmrc.js inside helpers, middleware, cache, logs, fonts, data, src.',
        r3_t: '3. Mods Containing JS (99.9%)',
        r3_d: 'Maps, clothes, and weapons (stream/ without ui_page) do not use .js — any JS script inside them is flagged critical.',
        r4_t: '4. False-Positive Protection',
        r4_d: 'Visible files with XOR or inside node_modules/artifacts are isolated under the False Positives tab.',
        modal_tag: 'SECURITY CONFIRMATION',
        modal_cancel: 'CANCEL / IGNORE',
        modal_confirm: 'CONFIRM EXECUTION',
        badge_neutralized: 'NEUTRALIZED',
        badge_backdoor: '99.9% CONFIRMED BACKDOOR',
        badge_analyze: 'POSSIBLE FALSE POSITIVE',
        btn_clean_manifest: 'CLEAN MANIFEST',
        btn_remove_file: 'REMOVE FILE',
        in_quarantine: 'Saved in Quarantine',
        btn_restore: 'RESTORE FILE',
        empty_critical: 'No 99.9% Backdoors found in the server.',
        empty_warning: 'No pending false-positive warnings.',
        empty_quarantine: 'No files in quarantine right now.',
        empty_logs: 'Waiting for scan execution...',
        modal_report_title: 'Confirm Diagnostic Scan (Report Only)',
        modal_report_body: 'The scanner will inspect all .js and fxmanifest.lua files in your resources/ folder for Windows Hidden attributes, XOR obfuscation, and manifest injections.\n\nNo files will be deleted or modified in this mode.\nDo you want to start the diagnostic scan now?',
        modal_inter_title: 'Confirm Step-by-Step Interactive Review',
        modal_inter_body: 'Interactive mode will present each pending detection one by one so you can decide whether to remove or ignore each file.\n\nDo you want to start the interactive review now?',
        modal_safe_title: 'Run Smart Cleanup (99.9% Backdoors)',
        modal_safe_body: 'Smart Cleanup automatically removes ONLY 99.9% confirmed threats:\n• .js files with Windows Hidden attribute + XOR code\n• Malicious spaced lines injected in fxmanifest.lua\n• Disguised backdoor filenames (gitignore.js, .env.local.js, etc.)\n• .js scripts hidden inside Map/Clothing/Weapon Mods\n\nVisible scripts that might be false positives are preserved, and everything is backed up in Quarantine.',
        modal_total_title: 'WARNING — Run Full Automatic Cleanup',
        modal_total_body: 'Full Cleanup will remove ALL flagged items (including XOR alerts on visible files that may belong to encrypted NUI scripts).\n\nAll files will be backed up in Quarantine for restoration. Proceed?',
        sections: {
            modes: ['Operations Center & Real-Time Diagnostics', 'Choose below how the scanner should handle .js and fxmanifest.lua files in your server'],
            critical: ['Confirmed Backdoors (99.9% Confidence)', 'Hidden files, fxmanifest.lua spaced injections, disguised filenames, and JS scripts inside Mods'],
            warning: ['Manual Review (Possible False Positives)', 'Visible files containing XOR/obfuscation — verify if they belong to encrypted NUI scripts before removing'],
            quarantine: ['Quarantine Vault & Instant Rollback', 'Every removed file or cleaned manifest has a backup below and can be restored to its original path in 1 click'],
            logs: ['Detection Rules & Scan Terminal', 'Understand the 4 verification pillars of Piercer KillDoor and monitor the real-time technical log']
        }
    }
};

function t(key) {
    const dict = I18N[currentLang] || I18N['pt-BR'];
    return dict[key] || key;
}

function setLanguage(lang) {
    currentLang = I18N[lang] ? lang : 'pt-BR';
    localStorage.setItem('piercer_killdoor_lang', currentLang);

    document.getElementById('btnLangPT').classList.toggle('active', currentLang === 'pt-BR');
    document.getElementById('btnLangEN').classList.toggle('active', currentLang === 'en-US');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = t(key);
    });

    switchTab(activeTabId);
    renderState(currentState);
}

let currentState = {
    scanning: false,
    rootDir: 'resources/',
    mode: 'report',
    results: [],
    logs: [],
    quarantine: [],
    stats: {
        totalThreats: 0,
        criticalThreats: 0,
        warningThreats: 0,
        cleanedThreats: 0,
        pendingThreats: 0
    }
};

let interactiveQueue = [];

function postNUI(endpoint, data = {}) {
    return fetch(`https://${resourceName}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data)
    }).catch(() => {});
}

// ============================================================================
// NAVEGAÇÃO ENTRE ABAS E CARDS
// ============================================================================

function switchTab(tabId) {
    activeTabId = tabId;
    document.querySelectorAll('.hud-tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.hud-viewport').forEach(view => {
        view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    const sec = (I18N[currentLang] || I18N['pt-BR']).sections[tabId];
    if (sec) {
        document.getElementById('sectionTitle').textContent = sec[0];
        document.getElementById('sectionDesc').textContent = sec[1];
    }
}

document.querySelectorAll('.hud-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
});

document.querySelectorAll('.telemetry-box').forEach(box => {
    box.addEventListener('click', () => {
        document.querySelectorAll('.telemetry-box').forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        const target = box.getAttribute('data-goto');
        if (target) switchTab(target);
    });
});

function selectModeCard(mode, el) {
    document.querySelectorAll('#view-modes .hud-card').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');

    if (mode === 'report') {
        showModal(
            t('modal_report_title'),
            t('modal_report_body'),
            () => postNUI('startScan', { mode: 'report' })
        );
    } else if (mode === 'clean_safe') {
        showModal(
            t('modal_safe_title'),
            t('modal_safe_body'),
            () => postNUI('startScan', { mode: 'clean_safe' })
        );
    } else if (mode === 'interactive') {
        showModal(
            t('modal_inter_title'),
            t('modal_inter_body'),
            () => {
                const pending = (currentState.results || []).filter(r => !r.cleaned);
                if (pending.length === 0) {
                    postNUI('startScan', { mode: 'report' });
                    return;
                }
                interactiveQueue = [...pending];
                runNextInteractiveStep();
            }
        );
    } else if (mode === 'clean_all') {
        showModal(
            t('modal_total_title'),
            t('modal_total_body'),
            () => postNUI('startScan', { mode: 'clean_all' })
        );
    }
}

// ============================================================================
// RENDERIZAÇÃO DE DADOS
// ============================================================================

function renderState(state) {
    if (!state) return;
    currentState = state;

    const s = state.stats || {};
    const qLen = state.quarantine ? state.quarantine.length : 0;
    const lLen = state.logs ? state.logs.length : 0;

    const dict = I18N[currentLang] || I18N['pt-BR'];
    document.getElementById('lblSubtitle').textContent = state.lastScanTime
        ? dict.subtitle_scanned(state.rootDir || 'resources/', state.lastScanTime)
        : dict.subtitle;

    document.getElementById('tabBadgeCrit').textContent = s.criticalThreats || 0;
    document.getElementById('tabBadgeWarn').textContent = s.warningThreats || 0;
    document.getElementById('tabBadgeQuar').textContent = qLen;

    document.getElementById('cardCritCount').textContent = s.criticalThreats || 0;
    document.getElementById('cardWarnCount').textContent = s.warningThreats || 0;
    document.getElementById('cardCleanCount').textContent = s.cleanedThreats || 0;
    document.getElementById('cardQuarCount').textContent = qLen;

    renderThreatGrid('critical', 'criticalGrid');
    renderThreatGrid('warning', 'warningGrid');
    renderQuarantineGrid();
    renderTerminalLogs();
}

function renderThreatGrid(severityFilter, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const list = (currentState.results || []).filter(r => r.severity === severityFilter);
    if (list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-box';
        empty.innerHTML = severityFilter === 'critical' ? t('empty_critical') : t('empty_warning');
        container.appendChild(empty);
        return;
    }

    for (const item of list) {
        const card = document.createElement('div');
        card.className = `hud-card ${!item.cleaned && item.severity === 'critical' ? 'selected' : ''}`;

        const tagClass = item.cleaned ? 'tag-clean' : (item.severity === 'critical' ? 'tag-crit' : 'tag-warn');
        const tagLabel = item.cleaned
            ? t('badge_neutralized')
            : (item.severity === 'critical' ? t('badge_backdoor') : t('badge_analyze'));

        card.innerHTML = `
            <div class="card-top">
                <span class="card-tag ${tagClass}">${tagLabel}</span>
                <span class="card-radio"></span>
            </div>
            <div class="threat-path-box">#${item.id} — ${item.relativePath}</div>
            <div class="threat-reason">${item.detail}</div>
            <div class="threat-footer">
                <span class="res-label">${item.resourceName}</span>
                ${!item.cleaned
                    ? `<button class="tactile-btn tactile-btn-primary btn-clean-item">${item.type === 'manifest_inject' ? t('btn_clean_manifest') : t('btn_remove_file')}</button>`
                    : `<span class="res-label">${t('in_quarantine')}</span>`
                }
            </div>
        `;

        const btn = card.querySelector('.btn-clean-item');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                postNUI('cleanSingle', { id: item.id });
            });
        }

        container.appendChild(card);
    }
}

function renderQuarantineGrid() {
    const container = document.getElementById('quarantineGrid');
    container.innerHTML = '';

    const list = currentState.quarantine || [];
    if (list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-box';
        empty.textContent = t('empty_quarantine');
        container.appendChild(empty);
        return;
    }

    for (const item of list) {
        const card = document.createElement('div');
        card.className = 'hud-card';
        card.innerHTML = `
            <div class="card-top">
                <span class="card-tag tag-clean">BACKUP #${item.quarantineId}</span>
                <span class="card-radio"></span>
            </div>
            <div class="threat-path-box">${item.relativePath}</div>
            <div class="threat-reason">${item.detail}</div>
            <div class="threat-footer">
                <span class="res-label">${item.resourceName} • ${item.date}</span>
                <button class="tactile-btn tactile-btn-primary btn-restore-item">${t('btn_restore')}</button>
            </div>
        `;

        card.querySelector('.btn-restore-item').addEventListener('click', (e) => {
            e.stopPropagation();
            postNUI('restoreSingle', { quarantineId: item.quarantineId });
        });

        container.appendChild(card);
    }
}

function renderTerminalLogs() {
    const logBox = document.getElementById('logBox');
    logBox.innerHTML = '';

    const logs = currentState.logs || [];
    if (logs.length === 0) {
        logBox.innerHTML = `<div class="log-muted">${t('empty_logs')}</div>`;
        return;
    }

    for (const entry of logs) {
        const div = document.createElement('div');
        div.className = `log-${entry.level || 'info'}`;
        div.textContent = `[${entry.time}] ${entry.text}`;
        logBox.appendChild(div);
    }
    logBox.scrollTop = logBox.scrollHeight;
}

// ============================================================================
// MODAL E MODO INTERATIVO
// ============================================================================

function showModal(title, body, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').textContent = body;
    modal.classList.remove('hidden');

    document.getElementById('modalBtnConfirm').onclick = () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    };

    document.getElementById('modalBtnCancel').onclick = () => {
        modal.classList.add('hidden');
        if (onCancel) onCancel();
    };
}

function runNextInteractiveStep() {
    if (interactiveQueue.length === 0) return;
    const item = interactiveQueue.shift();
    const actionWord = item.type === 'manifest_inject' ? t('btn_clean_manifest') : t('btn_remove_file');

    showModal(
        `#${item.id} (${item.probability})`,
        `${actionWord}:\n${item.relativePath}\n\nResource: ${item.resourceName}\n${item.detail}`,
        () => {
            postNUI('cleanSingle', { id: item.id });
            setTimeout(runNextInteractiveStep, 200);
        },
        () => {
            setTimeout(runNextInteractiveStep, 150);
        }
    );
}

// ============================================================================
// BOTÕES GERAIS E EVENTOS NUI
// ============================================================================

document.getElementById('btnClose').addEventListener('click', () => {
    document.getElementById('app').classList.add('hidden');
    postNUI('close');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('app').classList.add('hidden');
        postNUI('close');
    }
});

document.getElementById('btnRescan').addEventListener('click', () => {
    showModal(
        t('modal_report_title'),
        t('modal_report_body'),
        () => postNUI('startScan', { mode: 'report' })
    );
});

document.getElementById('btnSaveReport').addEventListener('click', () => {
    postNUI('saveReport');
});

window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;

    if (data.action === 'open') {
        document.getElementById('app').classList.remove('hidden');
        setLanguage(currentLang);
        renderState(data.state);
    } else if (data.action === 'updateState') {
        renderState(data.state);
    } else if (data.action === 'liveLog' && data.entry) {
        if (!currentState.logs) currentState.logs = [];
        currentState.logs.push(data.entry);
        if (currentState.logs.length > 600) currentState.logs.shift();

        // Append line in real time to terminal
        const logBox = document.getElementById('logBox');
        if (logBox) {
            const mutedPlaceholder = logBox.querySelector('.log-muted');
            if (mutedPlaceholder && currentState.logs.length === 1) {
                logBox.innerHTML = '';
            }
            const div = document.createElement('div');
            div.className = `log-${data.entry.level || 'info'}`;
            div.textContent = `[${data.entry.time}] ${data.entry.text}`;
            logBox.appendChild(div);
            logBox.scrollTop = logBox.scrollHeight;
        }

        // Update live stream bar at bottom
        const liveText = document.getElementById('liveStreamText');
        if (liveText) {
            liveText.textContent = `[${data.entry.time}] ${data.entry.text}`;
        }
    } else if (data.action === 'liveProgress' && data.data) {
        const pct = Math.max(0, Math.min(100, Number(data.data.progress) || 0));
        const fill = document.getElementById('progressFill');
        const thumb = document.getElementById('progressThumb');
        const valText = document.getElementById('simValText');
        const dot = document.getElementById('streamDot');
        const liveText = document.getElementById('liveStreamText');

        if (fill) fill.style.width = `${pct}%`;
        if (thumb) thumb.style.left = `${pct}%`;
        if (valText) valText.textContent = `${pct}%`;
        if (dot) dot.classList.toggle('scanning', pct < 100);
        if (liveText && data.data.currentFile) {
            liveText.textContent = data.data.currentFile;
        }

        if (data.data.stats) {
            currentState.stats = data.data.stats;
            document.getElementById('tabBadgeCrit').textContent = data.data.stats.criticalThreats || 0;
            document.getElementById('tabBadgeWarn').textContent = data.data.stats.warningThreats || 0;
            document.getElementById('cardCritCount').textContent = data.data.stats.criticalThreats || 0;
            document.getElementById('cardWarnCount').textContent = data.data.stats.warningThreats || 0;
            document.getElementById('cardCleanCount').textContent = data.data.stats.cleanedThreats || 0;
        }
    } else if (data.action === 'reportSaved' && data.report && data.report.ok) {
        document.getElementById('lblSubtitle').textContent = `${data.report.filePath}`;
    }
});

setLanguage(currentLang);
