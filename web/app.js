const resourceName = window.GetParentResourceName ? window.GetParentResourceName() : 'piercer_killdoor';

let currentLang = localStorage.getItem('piercer_killdoor_lang') || 'pt-BR';
let activeTabId = 'modes';

const I18N = {
    'pt-BR': {
        engine_badge: 'ENGINE v1.0 • STANDALONE',
        subtitle: 'Scanner Estático de Backdoors XOR, Arquivos Ocultos, Lua RCE e Injeções em fxmanifest.lua',
        subtitle_scanned: (dir, time) => `Diretório Alvo: ${dir} • Última Varredura: ${time}`,
        btn_save_txt: 'EXPORTAR .TXT',
        btn_rescan: 'REESCANEAR',
        tab_modes: 'CENTRAL DE OPERAÇÕES',
        tab_critical: 'BACKDOORS 99.9%',
        tab_warning: 'FALSOS POSITIVOS',
        tab_quarantine: 'QUARENTENA',
        tab_logs: 'REGRAS & TERMINAL',
        precision_label: 'STATUS',
        tel_total: 'TOTAL DETECTADO',
        tel_crit: '99.9% BACKDOOR',
        tel_warn: 'ANALISAR (FALSO+)',
        tel_clean: 'NEUTRALIZADOS',
        tel_quar: 'EM QUARENTENA',
        tel_logs: 'EVENTOS DE LOG',
        c1_tag: '01 • DIAGNÓSTICO SEGURO',
        c1_title: 'Apenas Relatório (Não Altera Arquivos)',
        c1_s1: '8 REGEX XOR', c1_s2: 'ATRIBUTO HIDDEN', c1_s3: 'FXMANIFEST',
        c1_desc: 'Varre toda a pasta resources/ identificando ameaças sem apagar nenhum arquivo.',
        c1_hint: 'Risco Zero • Somente Leitura', c1_btn: 'ESCANEAR AGORA',
        c2_tag: '02 • RECOMENDADO (99.9%)',
        c2_title: 'Limpeza Inteligente Anti-Backdoor',
        c2_s1: 'HIDDEN + XOR', c2_s2: 'JS EM MODS', c2_s3: 'PROTEGE NUI',
        c2_desc: 'Remove apenas backdoors confirmados (ocultos + XOR e injeções). Preserva scripts visíveis.',
        c2_hint: 'Backup Automático na Quarentena', c2_btn: 'LIMPAR 99.9%',
        c3_tag: '03 • REVISÃO PASSO A PASSO',
        c3_title: 'Remoção Interativa Manual',
        c3_s1: 'CONFIRMAÇÃO 1 A 1', c3_s2: 'EXIBE CAMINHO', c3_s3: 'MOTIVO TÉCNICO',
        c3_desc: 'Apresenta cada ameaça individualmente na tela para você aprovar ou ignorar.',
        c3_hint: 'Controle Total do Administrador', c3_btn: 'INICIAR REVISÃO',
        c4_tag: '04 • MODO AGRESSIVO',
        c4_title: 'Limpeza Automática Total (100%)',
        c4_s1: 'REMOVE CRÍTICOS', c4_s2: 'REMOVE SUSPEITOS', c4_s3: 'SALVA BACKUP',
        c4_desc: 'Remove todas as ameaças e avisos de XOR. Permite reversão pelo Cofre de Quarentena.',
        c4_hint: 'Atenção a Scripts Criptografados', c4_btn: 'EXECUTAR TOTAL',
        c5_tag: '05 • AUDITORIA DE ARQUIVOS',
        c5_title: 'Inspecionar Detecções & Falsos Positivos',
        c5_desc: 'Separa ameaças 99.9% confirmadas de alertas em NUI/artifacts para evitar falsos positivos.',
        c5_hint: 'Ação Individual por Arquivo', c5_btn: 'VER AMEAÇAS',
        c6_tag: '06 • COFRE DE SEGURANÇA',
        c6_title: 'Quarentena & Restauração Instantânea',
        c6_s2: 'CAMINHO ORIGINAL', c6_s3: '1-CLICK RESTORE',
        c6_desc: 'Todo arquivo deletado ou manifest limpo fica guardado aqui. Restaure em 1 clique se desejar.',
        c6_hint: 'Reversão Completa Sem Perdas', c6_btn: 'ABRIR COFRE',
        r1_t: '1. Atributo Hidden + XOR (99.9%)',
        r1_d: 'Backdoors reais ocultam o arquivo no Windows (attrib +h) e ofuscam o payload com XOR / String.fromCharCode.',
        r2_t: '2. Pastas & Nomes Camuflados',
        r2_d: 'Detecta gitignore.js, .env.local.js, .npmrc.js em pastas helpers, middleware, cache, logs, fonts, data, src.',
        r3_t: '3. Mods com Script JS (99.9%)',
        r3_d: 'Mapas, roupas e armas (stream/ sem ui_page) não utilizam .js — qualquer script JS ali é apontado como crítico.',
        r4_t: '4. Lua RCE & Cipher Droppers',
        r4_d: 'Detecta assert(load(...)), PerformHttpRequest malicioso, servidores Cipher/Blum e cópias automáticas via SaveResourceFile.',
        modal_tag: 'CONFIRMAÇÃO DE SEGURANÇA',
        modal_cancel: 'CANCELAR / IGNORAR',
        modal_confirm: 'CONFIRMAR EXECUÇÃO',
        modal_already_scanning_title: 'Varredura em Execução',
        modal_already_scanning_body: 'Uma varredura já está em andamento no servidor.\n\nAguarde o término da operação atual para iniciar uma nova.',
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
        modal_report_title: 'Confirmar Diagnóstico Seguro (Apenas Relatório)',
        modal_report_body: 'Deseja iniciar a varredura em modo Somente Leitura?\n\n• Varre todos os scripts .js, .lua e manifests da pasta resources/\n• Identifica arquivos ocultos (Hidden), códigos XOR, RCEs e injeções\n• NENHUM arquivo será modificado ou apagado (Risco Zero)',
        modal_inter_title: 'Confirmar Remoção Interativa Passo a Passo',
        modal_inter_body: 'Deseja iniciar a Remoção Interativa Manual?\n\n• Cada ameaça pendente será exibida individualmente na tela\n• Você verá o caminho completo do arquivo e o motivo técnico exato\n• Você decide se deseja remover ou ignorar cada arquivo',
        modal_safe_title: 'Confirmar Limpeza Inteligente (99.9% Backdoors)',
        modal_safe_body: 'Deseja executar a Limpeza Inteligente Recomendada?\n\n• Remove automaticamente APENAS ameaças com 99.9% de certeza\n• Cria backup automático de tudo no Cofre de Quarentena\n• Preserva scripts visíveis e pacotes legítimos para evitar falsos positivos',
        modal_total_title: 'ATENÇÃO — Confirmar Limpeza Automática Total (100%)',
        modal_total_body: 'Deseja realmente executar a Limpeza Total Agressiva?\n\n• Remove TODAS as ameaças e avisos de XOR (inclusive em arquivos visíveis)\n• Recomendado apenas se o servidor estiver sob ataque ativo confirmado\n• Todos os arquivos terão cópia salva no Cofre de Quarentena para reversão',
        sections: {
            modes: ['Central de Operações & Diagnóstico em Tempo Real', 'Escolha abaixo como o scanner deve agir sobre os arquivos .js e fxmanifest.lua da sua base'],
            critical: ['Backdoors Confirmados (99.9% de Certeza)', 'Arquivos ocultos (Hidden), injeções em fxmanifest.lua, Lua RCEs e scripts JS dentro de Mods'],
            warning: ['Análise Manual (Possíveis Falsos Positivos)', 'Arquivos visíveis que possuem ofuscação/XOR — verifique antes de apagar'],
            quarantine: ['Cofre de Quarentena & Restauração', 'Todo arquivo removido ou manifest limpo possui cópia de segurança abaixo e pode ser restaurado em 1 clique'],
            logs: ['Regras de Detecção & Terminal de Varredura', 'Entenda os 4 pilares de verificação do Piercer KillDoor e acompanhe o log técnico']
        }
    },
    'en-US': {
        engine_badge: 'ENGINE v1.0 • STANDALONE',
        subtitle: 'Static Scanner for XOR Backdoors, Windows Hidden Files, Lua RCE & fxmanifest.lua Injections',
        subtitle_scanned: (dir, time) => `Target Directory: ${dir} • Last Scan: ${time}`,
        btn_save_txt: 'EXPORT .TXT',
        btn_rescan: 'RESCAN',
        tab_modes: 'OPERATIONS CENTER',
        tab_critical: '99.9% BACKDOORS',
        tab_warning: 'FALSE POSITIVES',
        tab_quarantine: 'QUARANTINE VAULT',
        tab_logs: 'RULES & TERMINAL',
        precision_label: 'STATUS',
        tel_total: 'TOTAL DETECTED',
        tel_crit: '99.9% BACKDOOR',
        tel_warn: 'REVIEW (FALSE+)',
        tel_clean: 'NEUTRALIZED',
        tel_quar: 'IN QUARANTINE',
        tel_logs: 'LOG EVENTS',
        c1_tag: '01 • SAFE DIAGNOSTIC',
        c1_title: 'Report Only (Does Not Modify Files)',
        c1_s1: '8 XOR REGEX', c1_s2: 'HIDDEN ATTR', c1_s3: 'FXMANIFEST',
        c1_desc: 'Scans the entire resources/ folder detecting threats without deleting anything.',
        c1_hint: 'Zero Risk • Read-Only Mode', c1_btn: 'SCAN NOW',
        c2_tag: '02 • RECOMMENDED (99.9%)',
        c2_title: 'Smart Anti-Backdoor Cleanup',
        c2_s1: 'HIDDEN + XOR', c2_s2: 'JS IN MODS', c2_s3: 'PROTECTS NUI',
        c2_desc: 'Deletes only confirmed backdoors (Hidden + XOR files and manifest injections). Preserves visible scripts.',
        c2_hint: 'Automatic Quarantine Backup', c2_btn: 'CLEAN 99.9%',
        c3_tag: '03 • STEP-BY-STEP REVIEW',
        c3_title: 'Manual Interactive Removal',
        c3_s1: '1-BY-1 CONFIRM', c3_s2: 'SHOWS PATH', c3_s3: 'TECH REASON',
        c3_desc: 'Presents each threat individually on screen for manual review and approval.',
        c3_hint: 'Full Administrator Control', c3_btn: 'START REVIEW',
        c4_tag: '04 • AGGRESSIVE MODE',
        c4_title: 'Full Automatic Cleanup (100%)',
        c4_s1: 'REMOVES CRITICAL', c4_s2: 'REMOVES WARNINGS', c4_s3: 'SAVES BACKUP',
        c4_desc: 'Removes all threats and XOR warnings. Backs up everything into the Quarantine Vault.',
        c4_hint: 'Watch Out for Encrypted Scripts', c4_btn: 'RUN FULL CLEAN',
        c5_tag: '05 • FILE AUDIT',
        c5_title: 'Inspect Detections & False Positives',
        c5_desc: 'Clearly isolates confirmed 99.9% backdoors from NUI/artifacts to prevent false positives.',
        c5_hint: 'Individual File Inspection', c5_btn: 'VIEW THREATS',
        c6_tag: '06 • SECURITY VAULT',
        c6_title: 'Quarantine & Instant Restore',
        c6_s2: 'ORIGINAL PATH', c6_s3: '1-CLICK RESTORE',
        c6_desc: 'Every deleted file and cleaned manifest is safely archived here for instant 1-click restore.',
        c6_hint: 'Lossless Rollback', c6_btn: 'OPEN VAULT',
        r1_t: '1. Hidden Attribute + XOR (99.9%)',
        r1_d: 'Real backdoors set the Windows Hidden flag (attrib +h) and encode payloads with XOR / String.fromCharCode.',
        r2_t: '2. Disguised Folders & Names',
        r2_d: 'Detects gitignore.js, .env.local.js, .npmrc.js hidden inside helpers, middleware, cache, logs, data, src.',
        r3_t: '3. Mods Containing JS Scripts (99.9%)',
        r3_d: 'Streaming maps, clothes, and weapon assets do not need JS — any JS script hidden there is flagged critical.',
        r4_t: '4. Lua RCE & Cipher Droppers',
        r4_d: 'Detects assert(load(...)), PerformHttpRequest payload droppers, Cipher/Blum C2 servers, and SaveResourceFile viral infectors.',
        modal_tag: 'SECURITY CONFIRMATION',
        modal_cancel: 'CANCEL / DISMISS',
        modal_confirm: 'CONFIRM EXECUTION',
        modal_already_scanning_title: 'Scan Already in Progress',
        modal_already_scanning_body: 'A scan is currently running on the server.\n\nPlease wait for the current operation to finish before starting a new one.',
        badge_neutralized: 'NEUTRALIZED',
        badge_backdoor: '99.9% CONFIRMED BACKDOOR',
        badge_analyze: 'POSSIBLE FALSE POSITIVE',
        btn_clean_manifest: 'CLEAN MANIFEST',
        btn_remove_file: 'REMOVE FILE',
        in_quarantine: 'Archived in Quarantine',
        btn_restore: 'RESTORE FILE',
        empty_critical: 'No 99.9% Backdoors found on this server.',
        empty_warning: 'No false positive warnings pending.',
        empty_quarantine: 'Quarantine vault is currently empty.',
        empty_logs: 'Awaiting scan execution...',
        modal_report_title: 'Confirm Safe Diagnostic (Report Only)',
        modal_report_body: 'Start diagnostic scan in Read-Only mode?\n\n• Inspects all .js, .lua and manifests in the resources/ folder\n• Identifies hidden files, XOR obfuscation, Lua droppers and injections\n• NO files will be modified or deleted (Zero Risk)',
        modal_inter_title: 'Confirm Step-by-Step Interactive Removal',
        modal_inter_body: 'Start Interactive Manual Review?\n\n• Each detected threat will be displayed individually on screen\n• You will inspect the exact path and technical reason\n• You decide whether to remove or ignore each item',
        modal_safe_title: 'Confirm Smart Anti-Backdoor Cleanup (99.9%)',
        modal_safe_body: 'Execute Recommended Smart Cleanup?\n\n• Automatically removes ONLY threats with 99.9% certainty\n• Creates automatic backup of everything in the Quarantine Vault\n• Preserves visible scripts to prevent false positives',
        modal_total_title: 'WARNING — Confirm Full Automatic Cleanup (100%)',
        modal_total_body: 'Are you sure you want to run Aggressive Cleanup?\n\n• Removes ALL threats and XOR warnings (including visible files)\n• Recommended only when actively investigating server compromise\n• All deleted items are backed up in the Quarantine Vault for rollback',
        sections: {
            modes: ['Operations Center & Real-Time Diagnostics', 'Choose below how the scanner should act upon your base .js and fxmanifest.lua files'],
            critical: ['Confirmed Backdoors (99.9% Certainty)', 'Hidden files, fxmanifest.lua injections, Lua RCE droppers and JS scripts inside mods'],
            warning: ['Manual Review (Possible False Positives)', 'Visible files containing XOR obfuscation — verify before deleting'],
            quarantine: ['Quarantine Vault & Rollback', 'Every removed file or cleaned manifest is backed up below and can be restored in 1 click'],
            logs: ['Detection Rules & Terminal Output', 'Understand the 4 detection pillars of Piercer KillDoor and inspect real-time log output']
        }
    }
};

function t(key) {
    const dict = I18N[currentLang] || I18N['pt-BR'];
    return dict[key] || key;
}

function setLanguage(lang) {
    if (!I18N[lang]) lang = 'pt-BR';
    currentLang = lang;
    try { localStorage.setItem('piercer_killdoor_lang', lang); } catch (e) {}

    const btnPT = document.getElementById('btnLangPT');
    const btnEN = document.getElementById('btnLangEN');
    if (btnPT) btnPT.classList.toggle('active', lang === 'pt-BR');
    if (btnEN) btnEN.classList.toggle('active', lang === 'en-US');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        const text = t(k);
        if (text) el.textContent = text;
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
        totalFilesScanned: 0,
        totalManifestsScanned: 0,
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

function selectModeCard(mode, el) {
    document.querySelectorAll('#view-modes .hud-card').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');

    if (currentState && currentState.scanning) {
        showModal(
            t('modal_already_scanning_title'),
            t('modal_already_scanning_body'),
            null,
            null
        );
        return;
    }

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
    if (!container) return;
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
        card.className = `threat-card ${item.cleaned ? 'cleaned' : ''}`;

        const isCrit = item.severity === 'critical';
        const tagClass = item.cleaned ? 'tag-clean' : (isCrit ? 'tag-crit' : 'tag-warn');
        const tagText = item.cleaned ? t('badge_neutralized') : (isCrit ? t('badge_backdoor') : t('badge_analyze'));

        const actionBtn = item.cleaned
            ? `<span class="action-hint" style="color: #22c55e;">${t('in_quarantine')}</span>`
            : `<button class="tactile-btn tactile-btn-primary" onclick="cleanSingleThreat(${item.id})">
                 ${item.type === 'manifest_inject' ? t('btn_clean_manifest') : t('btn_remove_file')}
               </button>`;

        card.innerHTML = `
            <div class="card-top">
                <span class="card-tag ${tagClass}">${tagText}</span>
                <span style="font-size: 10px; font-weight: 800; color: #88889c;">#${item.id}</span>
            </div>
            <div class="threat-path">${escapeHtml(item.relativePath)}</div>
            <div class="threat-reason">
                <strong style="color: #ffffff;">${escapeHtml(item.resourceName)}:</strong> ${escapeHtml(item.detail)}
            </div>
            <div class="card-action-bar">
                <span class="action-hint">${escapeHtml(item.probability || '')}</span>
                ${actionBtn}
            </div>
        `;
        container.appendChild(card);
    }
}

function renderQuarantineGrid() {
    const container = document.getElementById('quarantineGrid');
    if (!container) return;
    container.innerHTML = '';

    const list = currentState.quarantine || [];
    if (list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-box';
        empty.innerHTML = t('empty_quarantine');
        container.appendChild(empty);
        return;
    }

    for (const item of list) {
        const card = document.createElement('div');
        card.className = 'threat-card';

        card.innerHTML = `
            <div class="card-top">
                <span class="card-tag tag-clean">${escapeHtml(item.type)}</span>
                <span style="font-size: 10px; font-weight: 800; color: #88889c;">${item.timestamp}</span>
            </div>
            <div class="threat-path">${escapeHtml(item.originalPath)}</div>
            <div class="threat-reason">${escapeHtml(item.reason || '')}</div>
            <div class="card-action-bar">
                <span class="action-hint">ID: ${escapeHtml(item.id)}</span>
                <button class="tactile-btn tactile-btn-primary" onclick="restoreQuarantine('${item.id}')">
                    ${t('btn_restore')}
                </button>
            </div>
        `;
        container.appendChild(card);
    }
}

function renderTerminalLogs() {
    const logBox = document.getElementById('logBox');
    if (!logBox) return;
    logBox.innerHTML = '';

    const logs = currentState.logs || [];
    if (logs.length === 0) {
        const p = document.createElement('div');
        p.className = 'log-muted';
        p.textContent = t('empty_logs');
        logBox.appendChild(p);
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

function cleanSingleThreat(id) {
    postNUI('cleanSingle', { id });
}

function restoreQuarantine(quarantineId) {
    postNUI('restoreSingle', { quarantineId });
}

// ============================================================================
// MODAL E MODO INTERATIVO (CONFIRMAÇÃO PROMPT)
// ============================================================================

function showModal(title, body, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').textContent = body;
    modal.classList.remove('hidden');

    const btnConfirm = document.getElementById('modalBtnConfirm');
    const btnCancel = document.getElementById('modalBtnCancel');

    if (!onConfirm) {
        btnConfirm.style.display = 'none';
        btnCancel.textContent = 'FECHAR / OK';
    } else {
        btnConfirm.style.display = 'inline-flex';
        btnCancel.textContent = t('modal_cancel');
    }

    btnConfirm.onclick = () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    };

    btnCancel.onclick = () => {
        modal.classList.add('hidden');
        if (onCancel) onCancel();
    };
}

// Click outside modal box to close
const modalElem = document.getElementById('confirmModal');
if (modalElem) {
    modalElem.addEventListener('click', (e) => {
        if (e.target.id === 'confirmModal') {
            modalElem.classList.add('hidden');
        }
    });
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

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
        const modal = document.getElementById('confirmModal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            return;
        }
        document.getElementById('app').classList.add('hidden');
        postNUI('close');
    }
});

document.getElementById('btnRescan').addEventListener('click', () => {
    if (currentState && currentState.scanning) {
        showModal(
            t('modal_already_scanning_title'),
            t('modal_already_scanning_body'),
            null,
            null
        );
        return;
    }
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
    } else if (data.action === 'reportSaved' && data.report) {
        showModal(
            t('btn_save_txt'),
            `Relatório salvo com sucesso em:\n${data.report.path}\n\nTotal de ameaças registradas: ${data.report.totalThreats}`,
            null,
            null
        );
    }
});

// Inicialização imediata com idioma salvo
setLanguage(currentLang);
