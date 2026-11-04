<div align="center">

# 🛡️ piercer_killdoor

**Smart static backdoor scanner and remover for FiveM servers with quarantine vault and NUI interface.**

Detects obfuscated code (XOR), JavaScript files disguised in asset mods, hidden files (`Hidden` attribute), and stealthy injections in `fxmanifest.lua` and `__resource.lua`. Works on **any base and framework**.

![FiveM](https://img.shields.io/badge/FiveM-resource-F40552?style=for-the-badge)
![Frameworks](https://img.shields.io/badge/vRP%20%C2%B7%20Creative%20%C2%B7%20ESX%20%C2%B7%20QBCore%20%C2%B7%20Qbox%20%C2%B7%20TNet%20%C2%B7%20standalone-2b2b2b?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-100%25%20FS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![UI](https://img.shields.io/badge/NUI-PT--BR%20%2F%20EN--US-black?style=for-the-badge)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/jZ3vTmdjU7)

[![Ler em Português](https://img.shields.io/badge/Ler%20em%20Portugu%C3%AAs-5865F2?style=for-the-badge&logo=googletranslate&logoColor=white)](README.pt-BR.md)

</div>

---

## 🎯 What it's for

Many leaked scripts, malicious mods, or compromised server bases contain embedded backdoors that grant unauthorized admin access, run remote commands, or exfiltrate private server data.

Attackers typically hide these backdoors using known concealment techniques:
- Stealthy injections in `fxmanifest.lua` or `__resource.lua` using spaced comments (`--[[...]]`) to push the malicious script declaration far to the right, hidden from text editors.
- Scripts with dynamic XOR routines (`String.fromCharCode`, decoders, and `eval`).
- `.js` files with the Windows `Hidden` attribute, dot-prefixed filenames (e.g., `.env.local.js`), or disguised names (`gitignore.js`, `gitattributes.js`, `.npmrc.js`, `.htaccess.js`).
- `.js` scripts placed inside pure asset/mod folders (map stream assets, clothing, vehicles, weapons) that should never contain executable code.

**piercer_killdoor** scans your entire server resources tree for these patterns, separates critical threats from potential false positives, and provides instant rollback via a **Quarantine Vault**.

- 🧩 **100% Standalone & Multi-Framework**: Works out of the box with vRP, vRPex, Creative (all versions), TNet, QBCore, Qbox, ESX, and native ACE permissions.
- ⚡ **Real-Time Streaming**: Line-by-line asynchronous scan without freezing server threads and 100% compliant with the FXServer Node.js sandbox (no `child_process` dependency).
- 🛡️ **False-Positive Protection**: Does not blindly delete encrypted commercial scripts or legitimate NUI assets; separates 99.9% confirmed backdoors from manual review warnings.
- 📦 **Quarantine Vault**: Every removed file or cleaned manifest line is backed up automatically with 1-click restore.
- 🖥️ **Modern NUI & Terminal**: High-contrast, tactile interface with live telemetry, language switcher (PT-BR and EN-US), and full console/txAdmin CLI support.

---

## 🚀 Installation

1. Place the `piercer_killdoor` folder into your `resources/` directory:
   ```
   resources/[framezero-dev-scripts]/piercer_killdoor
   ```
2. Add it to your `server.cfg`:
   ```cfg
   ensure piercer_killdoor
   ```
3. When the server boots up, it will automatically run an initial safe diagnostic scan (Report Only) in the console.

---

## ⌨️ Commands

All commands can be executed via the **Server Console / txAdmin Live Console** or in-game by authorized administrators.

| Command | Description |
|---|---|
| `/killdoor` | Opens the interactive in-game Graphical Interface (NUI). |
| `killdoor report` | Runs a full scan in **Report Only** mode (does not modify or delete any file). |
| `killdoor clean` | Runs **Safe Cleanup (99.9%)**, removing only confirmed backdoors with quarantine backup. |
| `killdoor cleanall` | **Full Cleanup**: Removes all detections and XOR alerts with prior quarantine backup. |
| `killdoor remove <id>` | Removes or cleans a specific threat by its numerical `#ID`. |
| `killdoor quarantine` | Lists all files currently stored in the quarantine vault. |
| `killdoor restore <id>` | Restores the specified file back to its original directory. |
| `killdoor restore all` | Restores all quarantined files back to their original locations. |
| `killdoor savereport` | Saves a detailed technical report as a `.txt` file inside `reports/`. |

---

## ⚙️ Configuration

General settings, protected paths, regex patterns, and permissions are configured in `config.js`:

```javascript
const KillDoorConfig = {
    InGameCommand: 'killdoor',       // In-game command to open NUI
    ConsoleCommand: 'killdoor',      // Server console/txAdmin command
    AutoScanOnStart: true,           // Automatic diagnostic on server startup
    EnableQuarantine: true,          // Automatic backup before any deletion
    ScanLegacyResourceLua: true,     // Checks both fxmanifest.lua and legacy __resource.lua
    // ...
};
```

### Permissions

Permission resolution is universal and handled automatically by `server/framework_auth.lua`:

- **Native ACE**: `killdoor.admin`, `admin`, `command`
- **vRP / vRPex / Creative / TNet**: Groups like `admin.permissao`, `owner.permissao`, `developer.permissao`, `Admin`, `Owner`, etc.
- **QBCore / Qbox / ESX**: Groups `god`, `admin`, `superadmin`, `owner`, `dev`
- **Direct Identifiers**: Add specific licenses or Discord IDs under `Config.Permissions.AdminIdentifiers`

---

## 🔍 Detection Rules & Classification

The scanner categorizes findings by confidence level to avoid breaking valid server scripts:

### 🔴 Critical (99.9% Confirmed Backdoor)
- **Hidden File Attribute + XOR**: Hidden `.js` files containing dynamic decoding routines.
- **Manifest Injections**: Lines with whitespace-padded comments (`--[[ ... ]]       'script.js'`).
- **Disguised Backdoor Names**: Known deceptive names (`gitignore.js`, `gitattributes.js`, `.env.local.js`, `.npmrc.js`, `.htaccess.js`).
- **Scripts in Asset Mods**: `.js` files located inside map stream, clothing, or weapon resources lacking a `ui_page`.

### 🟡 Warning / Review (Possible False Positive)
- **XOR in Visible Files**: Valid obfuscated commercial scripts (e.g., protected NUI bundles).
- **NPM Packages**: Configuration files inside `node_modules` (flagged only if disguised or matching direct backdoor signatures).

---

## 📦 Quarantine System

No file is permanently destroyed without a rollback option. When a threat is neutralized:
1. An intact copy is stored in `piercer_killdoor/quarantine/` with a unique ID.
2. The original file path and detection metadata are indexed.
3. You can restore any file instantly from the NUI panel or via `killdoor restore <id>`.

---

<div align="center">
Built for security, stability, and full transparency for FiveM server owners and developers.
</div>
