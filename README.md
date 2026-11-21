<div align="center">

# 🛡️ piercer_killdoor

**Smart static scanner and backdoor remover for FiveM servers featuring a quarantine rollback vault and tactile NUI.**

Detects obfuscated code (XOR), JavaScript scripts disguised inside mods/assets, Windows Hidden attribute files, stealth injections inside `fxmanifest.lua` / `__resource.lua`, and Lua backdoors (remote RCE droppers with `assert(load(...))`, HTTP payload droppers, and Cipher/Blum C2 panels). Works with **any server framework**.

![FiveM](https://img.shields.io/badge/FiveM-resource-F40552?style=for-the-badge)
![Frameworks](https://img.shields.io/badge/vRP%20%C2%B7%20Creative%20%C2%B7%20ESX%20%C2%B7%20QBCore%20%C2%B7%20Qbox%20%C2%B7%20TNet%20%C2%B7%20standalone-2b2b2b?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-100%25%20FS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![UI](https://img.shields.io/badge/NUI-PT--BR%20%2F%20EN--US-black?style=for-the-badge)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/jZ3vTmdjU7)

[![Ler em Português](https://img.shields.io/badge/Ler%20em%20Portugu%C3%AAs-009B3A?style=for-the-badge&logo=googletranslate&logoColor=white)](README.pt-BR.md)

</div>

---

## 🎯 Purpose & Features

Leaked scripts, malicious mods, or compromised server bases frequently contain hidden backdoors designed to grant unauthorized administrative privileges, execute remote shell/Lua code, or steal sensitive server convars.

Attackers commonly hide backdoors using well-known techniques:
- **Stealth Manifest Injections:** Comments `--[[...]]` padded with multiple spaces to hide malicious script inclusions outside editor viewports in `fxmanifest.lua` and `__resource.lua`.
- **JavaScript XOR Payloads:** Dynamic decoders (`String.fromCharCode`, integer arrays, and `eval`).
- **Hidden Files & Disguised Names:** `.js` files marked with the Windows Hidden attribute (`attrib +h`), dot-prefixed filenames (e.g., `.env.local.js`), or decoy names (`gitignore.js`, `gitattributes.js`, `.npmrc.js`, `.htaccess.js`).
- **JS in Asset Mods:** `.js` files hidden inside streaming maps, clothing packs, and weapons that do not legitimately use JavaScript.
- **Lua RCE Droppers & Cipher Panels:** Remote code execution via `assert(load(...))`, `PerformHttpRequest` payload droppers, communication with known C2 servers (Cipher/Blum panels), and viral replication routines via `SaveResourceFile`.

**piercer_killdoor** scans your entire server resources directory for these signatures, isolates false positives from genuine backdoors, and enables rapid deletion with safe rollback through the **Quarantine Vault**.

- 🧩 **Auto-Adaptation via framezero_bridge**: Automatically detects and adapts to any server framework (vRP traditional, vRPex, Creative v3/v5/Network, TNet, QBCore, Qbox, ESX, OxCore, or Standalone ACE) for unified permissions and notifications.
- ⚡ **Real-Time Streaming**: Asynchronous line-by-line scanning without freezing the server, fully compliant with the FXServer Node.js sandbox (zero `child_process` dependency).
- 🛡️ **False Positive Guard**: Never deletes encrypted paid scripts or legitimate NUI assets blindly; separates 99.9% confirmed backdoors from manual inspection warnings.
- 📦 **Quarantine Vault**: Every deleted file or cleaned manifest line is automatically backed up and can be restored in 1 click.
- 🖥️ **Sharp Monochrome NUI & Live Terminal**: Clean tactile design with fixed proportions (strictly no scrollbars in the operations menu), security confirmation prompts on all actions, and bilingual support (PT-BR and EN-US with flag toggles).

---

## 🚀 Installation

1. Ensure the **`framezero_bridge`** resource is installed on your server:
   ```
   resources/[framezero-dev-scripts]/framezero_bridge
   ```
2. Place the `piercer_killdoor` folder in your `resources/` directory:
   ```
   resources/[framezero-dev-scripts]/piercer_killdoor
   ```
3. Add to your `server.cfg` (ensuring the bridge starts first):
   ```cfg
   ensure framezero_bridge
   ensure piercer_killdoor
   ```
4. Upon server startup, the script will auto-adapt to your framework and run an initial safe diagnostic scan (Report Only) directly in the console.

---

## ⌨️ Commands

All commands can be executed via the **Server Console / txAdmin Live Console** or in-game by authorized administrators.

| Command | Description |
|---|---|
| `/killdoor` | Opens the Interactive NUI Dashboard in-game. |
| `killdoor report` | Runs a console diagnostic listing all threats without modifying any files. |
| `killdoor clean` | Runs Smart Cleanup (removes 99.9% confirmed backdoors with quarantine backup). |
| `killdoor cleanall` | Full Cleanup (removes all critical and warning files with quarantine backup). |
| `killdoor quarantine` | Lists all backups stored in the Quarantine Vault. |
| `killdoor restore <id>` | Restores a specific quarantined file back to its original location. |
| `killdoor restore all` | Restores all files currently in quarantine. |

---

## ⚙️ Configuration

The `config.js` file allows complete customization of the scanner:

- `Permissions`: Admin groups for vRP (`admin.permissao`), QBCore (`admin`), ACE (`killdoor.admin`), or direct identifiers (`license:...`, `discord:...`).
- `Detection.ProtectedFolders`: Directories where isolated XOR codes will not be touched (e.g., `artifacts`, `citizen`, `monitor`, `screenshot-basic`).
- `Detection.SafeDotFiles`: Legitimate development dotfiles (`.eslintrc.js`, `.prettierrc.js`, etc.).
- `Detection.SuspiciousFileNames`: Known decoy backdoor names (`.env.local.js`, `gitignore.js`, etc.).
- `Detection.LuaPatterns`: Regex patterns for detecting Lua RCE droppers, Cipher, Blum, and infectors.

---

## 📋 License & Support

Engineered for maximum FiveM server security and integrity. Questions or suggestions? Join our Discord: https://discord.gg/jZ3vTmdjU7
