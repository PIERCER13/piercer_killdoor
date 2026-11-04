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

    // ========================================================================
    // PERMISSÕES E FRAMEWORKS (vRP, vRPex, Creative, TNet, QBCore, QBox, ESX)
    // ========================================================================
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

    // ========================================================================
    // REGRAS DE DETECÇÃO E PROTEÇÃO CONTRA FALSOS POSITIVOS
    // ========================================================================
    Detection: {
        // Pastas que NUNCA devem ter arquivos apagados automaticamente por XOR isolado
        // (evita quebrar artifacts do FXServer ou pacotes legítimos do node_modules)
        ProtectedFolders: [
            'artifacts',
            'citizen',
            'system_resources',
            'monitor' // txAdmin
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

        // As 8 Expressões Regulares de XOR e Ofuscação
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

        // Regex de injeção no fxmanifest.lua / __resource.lua (comentário --[[...]] seguido de 5+ espaços e um arquivo .js)
        ManifestInjectPattern: String.raw`--\[\[.*?\]\]\s{5,}['"](.*?\.(?:js|lua))['"]`
    }
};

if (typeof global !== 'undefined') {
    global.KillDoorConfig = KillDoorConfig;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KillDoorConfig;
}
