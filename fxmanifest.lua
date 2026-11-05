fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'piercer_killdoor'
author '@piercer'
description 'Scanner e Removedor Inteligente de Backdoors com Quarentena integrado ao framezero_bridge'
version '1.1.0'

dependency 'framezero_bridge'

ui_page 'web/index.html'

files {
    'web/index.html',
    'web/style.css',
    'web/app.js'
}

client_scripts {
    'client/client.lua'
}

server_scripts {
    '@framezero_bridge/import.lua',
    'config.js',
    'server/framework_auth.lua',
    'server/scanner.js'
}
