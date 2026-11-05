<div align="center">

# 🛡️ piercer_killdoor

**Scanner estático inteligente e removedor de backdoors para servidores FiveM com sistema de quarentena e interface NUI.**

Detecta códigos ofuscados (XOR), scripts JavaScript camuflados em mods/assets, arquivos com atributo oculto (`Hidden`), injeções furtivas no `fxmanifest.lua` / `__resource.lua` e backdoors em Lua (RCEs com `assert(load(...))`, droppers HTTP e painéis Cipher/Blum). Funciona em **qualquer base e framework**.

![FiveM](https://img.shields.io/badge/FiveM-resource-F40552?style=for-the-badge)
![Frameworks](https://img.shields.io/badge/vRP%20%C2%B7%20Creative%20%C2%B7%20ESX%20%C2%B7%20QBCore%20%C2%B7%20Qbox%20%C2%B7%20TNet%20%C2%B7%20standalone-2b2b2b?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-100%25%20FS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![UI](https://img.shields.io/badge/NUI-PT--BR%20%2F%20EN--US-black?style=for-the-badge)
[![Discord](https://img.shields.io/badge/Discord-entrar-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/jZ3vTmdjU7)

[![Read in English](https://img.shields.io/badge/Read%20in%20English-5865F2?style=for-the-badge&logo=googletranslate&logoColor=white)](README.md)

</div>

---

## 🎯 Para que serve

Muitos scripts vazados, mods maliciosos ou bases comprometidas possuem backdoors embutidos que dão acesso administrativo indevido, executam comandos remotos ou roubam dados do servidor.

Os invasores costumam esconder esses backdoors utilizando técnicas bem conhecidas:
- **Injeções Furtivas em Manifests:** Comentários `--[[...]]` seguidos de múltiplos espaços para esconder o script malicioso fora da visão do editor de código em arquivos `fxmanifest.lua` e `__resource.lua`.
- **Scripts JavaScript com Código XOR:** Decodificadores dinâmicos (`String.fromCharCode`, arrays numéricos e `eval`).
- **Arquivos Ocultos e Nomes Camuflados:** Arquivos `.js` com atributo oculto do Windows (`attrib +h`), arquivos iniciados por ponto (ex: `.env.local.js`) ou nomes falsos (`gitignore.js`, `gitattributes.js`, `.npmrc.js`, `.htaccess.js`).
- **Scripts JS em Mods de Assets:** Arquivos `.js` escondidos dentro de pastas de mapas/stream, roupas, veículos e armas que sequer utilizam JavaScript.
- **Backdoors e RCEs em Lua (Cipher / Blum / Droppers):** Execução de código remoto via `assert(load(...))`, `PerformHttpRequest` com execução direta do corpo da resposta, comunicação com servidores C2 conhecidos (painéis Cipher/Blum) e scripts replicadores usando `SaveResourceFile`.

O **piercer_killdoor** analisa todo o diretório de resources do servidor em busca desses padrões, isolando arquivos suspeitos de falsos positivos e permitindo remoção e restauração rápida via cofre de **Quarentena**.

- 🧩 **100% Standalone & Multi-Framework**: Compatível automaticamente com vRP, vRPex, Creative (todas as versões), TNet, QBCore, Qbox, ESX e permissões ACE nativas.
- ⚡ **Varredura em Tempo Real**: Streaming assíncrono linha a linha sem travar o servidor e 100% integrado ao sandbox nativo do FXServer (sem dependência de `child_process`).
- 🛡️ **Proteção contra Falsos Positivos**: Não sai apagando scripts criptografados ou assets de NUI legítimos; separa alertas de 99.9% de certeza dos avisos para análise manual.
- 📦 **Cofre de Quarentena**: Todo arquivo deletado ou linha de manifest limpa possui backup automático e pode ser revertido em 1 clique.
- 🖥️ **Interface NUI Moderna & Terminal**: Painel limpo, tátil, em alta nitidez com proporção fixa (sem barras de rolagem no menu de operações), confirmação por prompt em todas as ações e seletor de idioma (PT-BR e EN-US com bandeiras).

---

## 🚀 Instalação

1. Coloque a pasta `piercer_killdoor` dentro do seu diretório `resources/`:
   ```
   resources/[framezero-dev-scripts]/piercer_killdoor
   ```
2. Adicione ao seu `server.cfg`:
   ```cfg
   ensure piercer_killdoor
   ```
3. Ao iniciar o servidor, o script executará automaticamente um diagnóstico seguro inicial (Apenas Relatório) no console.

---

## ⌨️ Comandos

Todos os comandos podem ser executados pelo **Console do Servidor / Live Console do txAdmin** ou dentro do jogo por administradores autorizados.

| Comando | Descrição |
|---|---|
| `/killdoor` | Abre o Painel NUI Interativo no jogo. |
| `killdoor report` | Executa diagnóstico no console e lista ameaças sem alterar nada. |
| `killdoor clean` | Executa a Limpeza Inteligente (remove 99.9% dos backdoors com backup). |
| `killdoor cleanall` | Limpeza Total (remove críticos e suspeitos com backup). |
| `killdoor quarantine` | Lista todos os backups armazenados no Cofre de Quarentena. |
| `killdoor restore <id>` | Restaura um arquivo específico da quarentena para o caminho original. |
| `killdoor restore all` | Restaura todos os backups armazenados na quarentena. |

---

## ⚙️ Configuração

O arquivo `config.js` permite personalizar totalmente o comportamento do scanner:

- `Permissions`: Grupos de permissão para vRP (`admin.permissao`), QBCore (`admin`), ACE (`killdoor.admin`) ou identificadores diretos (`license:...`, `discord:...`).
- `Detection.ProtectedFolders`: Pastas onde códigos XOR isolados não serão apagados automaticamente (ex: `artifacts`, `citizen`, `monitor`, `screenshot-basic`).
- `Detection.SafeDotFiles`: Arquivos legítimos de desenvolvimento que iniciam com ponto (`.eslintrc.js`, `.prettierrc.js`, etc.).
- `Detection.SuspiciousFileNames`: Nomes conhecidos de backdoors (`.env.local.js`, `gitignore.js`, etc.).
- `Detection.LuaPatterns`: Padrões regex para detecção de RCEs, Cipher, Blum e droppers em Lua.

---

## 📋 Licença e Suporte

Desenvolvido para máxima segurança e integridade de servidores FiveM. Dúvidas ou sugestões? Junte-se ao nosso Discord: https://discord.gg/jZ3vTmdjU7
