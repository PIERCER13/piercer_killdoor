<div align="center">

# 🛡️ piercer_killdoor

**Scanner estático inteligente e removedor de backdoors para servidores FiveM com sistema de quarentena e interface NUI.**

Detecta códigos ofuscados (XOR), scripts JavaScript camuflados em mods/assets, arquivos com atributo oculto (`Hidden`) e injeções furtivas no `fxmanifest.lua` e `__resource.lua`. Funciona em **qualquer base e framework**.

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
- Injeções furtivas em arquivos `fxmanifest.lua` ou `__resource.lua` através de comentários `--[[...]]` seguidos de múltiplos espaços para esconder o script malicioso fora da visão do editor.
- Scripts com código XOR (`String.fromCharCode`, decodificadores dinâmicos e `eval`).
- Arquivos `.js` com atributo oculto do Windows (`Hidden`), arquivos iniciados por ponto (ex: `.env.local.js`) ou nomes falsos (`gitignore.js`, `gitattributes.js`, `.npmrc.js`, `.htaccess.js`).
- Scripts `.js` escondidos dentro de pastas de mods (mapas/stream, roupas, veículos, armas) que sequer deveriam conter scripts.

O **piercer_killdoor** analisa todo o diretório de resources do servidor em busca desses padrões, isolando arquivos suspeitos de falsos positivos e permitindo remoção e restauração rápida via cofre de **Quarentena**.

- 🧩 **100% Standalone & Multi-Framework**: Compatível automaticamente com vRP, vRPex, Creative (todas as versões), TNet, QBCore, Qbox, ESX e permissões ACE nativas.
- ⚡ **Varredura em Tempo Real**: Streaming assíncrono linha a linha sem travar o servidor e 100% integrado ao sandbox nativo do FXServer (sem dependência de `child_process`).
- 🛡️ **Proteção contra Falsos Positivos**: Não sai apagando scripts criptografados ou assets de NUI legítimos; separa alertas de 99.9% de certeza dos avisos para análise manual.
- 📦 **Cofre de Quarentena**: Todo arquivo deletado ou linha de manifest limpa possui backup automático e pode ser revertido em 1 clique.
- 🖥️ **Interface NUI Moderna & Terminal**: Painel limpo, tátil, em alta nitidez, com seletor de idioma (PT-BR e EN-US) e comandos diretos pelo console/txAdmin.

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
| `/killdoor` | Abre a Interface Gráfica (NUI) interativa dentro do jogo. |
| `killdoor report` | Executa a varredura completa em modo **Apenas Relatório** (não altera nem deleta nada). |
| `killdoor clean` | Executa a **Limpeza Segura (99.9%)**, removendo apenas backdoors confirmados com backup em quarentena. |
| `killdoor cleanall` | **Limpeza Total**: Remove todas as detecções e avisos de XOR com backup prévio em quarentena. |
| `killdoor remove <id>` | Remove/limpa uma ameaça específica identificada pelo número `#ID`. |
| `killdoor quarantine` | Lista todos os arquivos que estão armazenados no cofre de quarentena. |
| `killdoor restore <id>` | Restaura o arquivo especificado de volta ao diretório original. |
| `killdoor restore all` | Restaura todos os arquivos da quarentena para os locais de origem. |
| `killdoor savereport` | Salva um relatório técnico detalhado em formato `.txt` na pasta `reports/`. |

---

## ⚙️ Configuração

As configurações gerais, pastas protegidas, padrões de expressões regulares e permissões ficam em `config.js`:

```javascript
const KillDoorConfig = {
    InGameCommand: 'killdoor',       // Comando para abrir o painel NUI
    ConsoleCommand: 'killdoor',      // Comando do console/txAdmin
    AutoScanOnStart: true,           // Diagnóstico automático ao ligar o servidor
    EnableQuarantine: true,          // Criação automática de backup antes de qualquer remoção
    ScanLegacyResourceLua: true,     // Analisa tanto fxmanifest.lua quanto __resource.lua antigos
    // ...
};
```

### Permissões

A verificação é universal e automática através de `server/framework_auth.lua`:

- **ACE Nativas**: `killdoor.admin`, `admin`, `command`
- **vRP / vRPex / Creative / TNet**: Grupos como `admin.permissao`, `owner.permissao`, `developer.permissao`, `Admin`, `Owner`, etc.
- **QBCore / Qbox / ESX**: Grupos `god`, `admin`, `superadmin`, `owner`, `dev`
- **Identificadores Diretos**: Adicione licenças ou discords específicos em `Config.Permissions.AdminIdentifiers`

---

## 🔍 Regras de Detecção & Classificação

O sistema separa as ameaças por níveis de probabilidade para evitar quebrar seu servidor:

### 🔴 Crítico (99.9% de Certeza de Backdoor)
- **Arquivo Oculto (`Hidden`) + XOR**: Arquivos `.js` ocultos com funções de decodificação dinâmica.
- **Injeções em Manifests**: Linhas com comentários espaçados (`--[[ ... ]]       'script.js'`).
- **Nomes Falsos de Backdoor**: Nomes conhecidos (`gitignore.js`, `gitattributes.js`, `.env.local.js`, `.npmrc.js`, `.htaccess.js`).
- **Scripts em Mods**: Arquivos `.js` dentro de resources de mapas/stream, roupas ou armas sem interface NUI (`ui_page`).

### 🟡 Aviso / Análise (Possível Falso Positivo)
- **XOR em arquivos visíveis**: Scripts legítimos com ofuscação (ex: bundles de NUI protegidos).
- **Pacotes NPM**: Arquivos de configuração dentro de `node_modules` (só são sinalizados se possuírem atributo oculto ou assinatura direta de backdoor).

---

## 📦 Sistema de Quarentena

Nenhum arquivo é destruído sem volta. Quando uma ameaça é neutralizada:
1. Uma cópia íntegra é armazenada em `piercer_killdoor/quarantine/` com ID único.
2. O caminho original e metadados ficam indexados.
3. Você pode restaurar qualquer arquivo instantaneamente pelo painel NUI ou com `killdoor restore <id>`.

---

<div align="center">
Desenvolvido com foco em segurança, estabilidade e transparência para administradores e desenvolvedores FiveM.
</div>
