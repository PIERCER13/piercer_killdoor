fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'piercer_killdoor'
author '@piercer'
description 'Scanner e Removedor Inteligente de Backdoors (JS XOR, Hidden Files, Manifest Injections) com Quarentena - Standalone (vRP, vRPex, Creative, TNet, QBCore, QBox, ESX)'
version '1.0.0'

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
    'config.js',
    'server/framework_auth.lua',
    'server/scanner.js'
}
