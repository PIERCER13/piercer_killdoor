const KillDoorConfig = {
    // Comando no jogo para abrir o Painel NUI (Ex: /killdoor)
    InGameCommand: 'killdoor',

    // Comando no Console do Servidor / txAdmin (Ex: killdoor report | killdoor clean)
    ConsoleCommand: 'killdoor',

    // Executar varredura automática (Modo Apenas Relatório) assim que a resource iniciar
    AutoScanOnStart: true,

    // Ativar backup automático em quarentena antes de deletar ou limpar qualquer arquivo
    EnableQuarantine: true,

    // Escanear também __resource.lua antigos além de fxmanifest.lua
    ScanLegacyResourceLua: true,

    // Escanear arquivos Lua (.lua) do servidor além de scripts JavaScript (.js)
    ScanLuaFiles: true,

    Permissions: {
        // Permissão ACE nativa do FiveM (ex: add_ace group.admin killdoor.admin allow)
        AcePermissions: [
            'killdoor.admin',
            'command',
            'admin'
        ],

        // Identificadores liberados diretamente (funciona em 100% das bases mesmo sem grupo)
        // Exemplo: 'license:123456789abcdef', 'discord:123456789', 'fivem:12345'
        AdminIdentifiers: [],

        // Grupos/Permissões verificados automaticamente em vRP / vRPex / Creative / TNet
        VRPPermissions: [
            'admin.permissao',
            'owner.permissao',
            'developer.permissao',
            'diretor.permissao',
            'god.permissao',
            'Admin',
            'Owner',
            'Developer',
            'God',
            'CEO'
        ],

        // Grupos verificados automaticamente em QBCore / QBox / ESX
        FrameworkGroups: [
            'god',
            'admin',
            'superadmin',
            'owner',
            'dev',
            'developer'
        ]
    },

    Detection: {
        // Pastas que NUNCA devem ter arquivos apagados automaticamente por XOR isolado
        // (evita quebrar artifacts do FXServer ou pacotes legítimos do node_modules)
        ProtectedFolders: [
            'artifacts',
            'citizen',
            'system_resources',
            'monitor', // txAdmin
            'screenshot-basic',
            'yarn',
            'webpack'
        ],

        // Arquivos de configuração legítimos do ecossistema JS/Node que começam com ponto (.)
        // Ignorados na regra "começa com ponto" SE não tiverem XOR nem atributo Hidden do Windows
        SafeDotFiles: [
            '.eslintrc.js',
            '.prettierrc.js',
            '.babelrc.js',
            '.rollup.config.js',
            '.vite.config.js',
            '.webpack.config.js',
            '.stylelintrc.js',
            '.postcssrc.js',
            '.commitlintrc.js',
            '.jest.config.js'
        ],

        // Nomes falsos clássicos usados por backdoors no FiveM (99.9% de certeza de backdoor)
        SuspiciousFileNames: [
            '.env.local.js',
            'gitignore.js',
            'gitattributes.js',
            '.npmrc.js',
            '.htaccess.js'
        ],

        // Pastas comumente criadas por invasores dentro de scripts/mods para esconder o .js
        SuspiciousSubfolders: [
            'helpers',
            'middleware',
            'cache',
            'logs',
            'public',
            'src',
            'fonts',
            'data',
            'html/lib',
            'html/js'
        ],

        // As 8 Expressões Regulares de XOR e Ofuscação em JavaScript (SprintScanner original)
        XorPatterns: [
            String.raw`x=\(e,k=3\)=>\[\.\.\.e\]\.map\(c=>String\.fromCharCode\(c\.charCodeAt\(\).*\^.*k\)\)`,
            String.raw`x=s=>eval\(s\.replace\(/\\\\u\(\[0-9a-f\]\{4\}\)/g`,
            String.raw`globalThis\[x\(`,
            String.raw`/\*\s*\[.*?\]\s*\*/\s*[\r\n]+.*?(eval|fromCharCode|charCodeAt)`,
            String.raw`for\s*\(.*\)\s*\{[^}]*String\.fromCharCode\([^)]*\^[^)]*\)`,
            String.raw`const\s+\w+\s*=\s*\[\s*\d{2,3}\s*,\s*\d{2,3}[\s\S]{40,}String\.fromCharCode`,
            String.raw`function\s+\w{6,}\s*\(\s*\w+\s*,\s*\w+\s*\)\s*\{[^}]*String\.fromCharCode\([^)]*\^\s*\w+\s*\)`,
            String.raw`eval\s*\(\s*\w+\s*\(\s*\w+\s*,\s*\d+\s*\)\s*\)`
        ],

        // Regex de injeção no fxmanifest.lua / __resource.lua (comentário --[[...]] seguido de 5+ espaços e um arquivo .js ou .lua)
        ManifestInjectPattern: String.raw`--\[\[.*?\]\]\s{5,}['"](.*?\.(?:js|lua))['"]`,

        LuaPatterns: [
            // 1. RCE Dropper: assert(load(...)) ou assert(loadstring(...))
            {
                name: 'Lua RCE Dropper (assert + load/loadstring)',
                regex: String.raw`assert\s*\(\s*(?:load|loadstring)\s*\(`,
                severity: 'critical',
                description: 'Execução de código remoto via assert(load/loadstring)'
            },
            // 2. PerformHttpRequest baixando e executando código diretamente
            {
                name: 'PerformHttpRequest Payload Exec Sink',
                regex: String.raw`PerformHttpRequest\s*\([^,]+,\s*(?:function\s*\([^)]*\))?[\s\S]{0,120}?(?:assert|load|loadstring)\s*\(`,
                severity: 'critical',
                description: 'Download HTTP com execução direta do corpo da resposta'
            },
            // 3. Cipher Panel / Blum Panel / Endpoints Maliciosos Conhecidos
            {
                name: 'Painel C2 Conhecido (Cipher / Blum / Webhook Dropper)',
                regex: String.raw`(?:cipher-panel|blumpanel|kekhack|antibackdoor\.(?:cc|xyz|net)|api\.ipify\.org.*?webhook)`,
                severity: 'critical',
                description: 'Comunicação com servidores de comando e controle conhecidos (Cipher/Blum)'
            },
            // 4. Injeção Viral em Manifests via SaveResourceFile
            {
                name: 'Infector de Manifest (SaveResourceFile infector)',
                regex: String.raw`SaveResourceFile\s*\([^,]+,\s*['"][^'"]*(?:fxmanifest|__resource)\.lua['"]`,
                severity: 'critical',
                description: 'Script tentando sobrescrever manifests de outras resources'
            },
            // 5. Sequência Longa de Bytes Hexadecimal (\x00\x00\x00...)
            {
                name: 'Ofuscação Hexadecimal Contínua',
                regex: String.raw`(?:\\x[0-9a-fA-F]{2}){8,}`,
                severity: 'warning',
                description: 'Cadeia extensa de bytes hexadecimais ofuscados'
            },
            // 6. Construtor Ofuscado string.char com múltiplos códigos
            {
                name: 'Cadeia Longa de string.char ofuscada',
                regex: String.raw`string\.char\s*\(\s*\d+\s*(?:,\s*\d+\s*){8,}`,
                severity: 'warning',
                description: 'Construção dinâmica de payload através de dezenas de números ASCII'
            },
            // 7. Chamada de Shell do Sistema Operacional (os.execute / io.popen)
            {
                name: 'Acesso a Shell do SO (os.execute / io.popen)',
                regex: String.raw`\b(?:os\.execute|io\.popen)\s*\(`,
                severity: 'warning',
                description: 'Chamada direta ao terminal do sistema operacional via script Lua'
            }
        ]
    }
};

if (typeof global !== 'undefined') {
    global.KillDoorConfig = KillDoorConfig;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KillDoorConfig;
}
