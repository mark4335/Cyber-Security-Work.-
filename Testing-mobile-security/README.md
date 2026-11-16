# Lab 4 — Mobile Application Security Testing

**Course:** Mobile Application Security  
**Institution:** Seneca Polytechnic  
**Date:** November 2026

---

## Overview

Three-day lab covering dynamic analysis of Android applications using Frida, Objection, ADB, and Burp Suite. Targets include:

| Target | Focus |
|---|---|
| OWASP UnCrackable Level 1 | Root detection bypass, `System.exit()` hook |
| InsecureBankV2 | Class enumeration, TLS pinning bypass, Burp intercept, keystore recovery |
| AndroGoat / DigitalBank | Root detection analysis, crypto key extraction, native-layer hooks |

---

## Repository Structure

```
lab4-mobile-security/
├── README.md
├── .gitignore
│
├── scripts/                        # Frida JavaScript instrumentation scripts
│   ├── bypass.js                   # Block System.exit() (UnCrackable L1)
│   ├── inspect.js                  # Enumerate login/auth classes (any target)
│   ├── inspect-insecurebank.js     # Deep inspection of InsecureBankV2 namespace
│   ├── hook.js                     # Patch isRooted() → false (InsecureBankV2)
│   ├── root-detection-observer.js  # Passively log Runtime.exec / File.exists
│   ├── root-detection-stack-trace.js # Same + full Java stack trace per exec
│   ├── rootcheck-androgoat.js      # RootCheck analysis for AndroGoat
│   ├── crypto-hooks.js             # Hook JCE to surface keys and cipher I/O
│   └── all_labs_monitor.js         # Comprehensive Java + native monitor
│
├── notes/                          # Day-by-day commands and notes
│   ├── day1-setup.md               # ADB, Frida, UnCrackable L1, Burp CA
│   ├── day2-insecurebankv2.md      # InsecureBankV2 full walkthrough
│   └── day3-androgoat.md           # AndroGoat root bypass & crypto recovery
│
└── report/
    └── Lab4_Mobile_Report.docx     # Full formatted lab report (79 figures)
```

---

## Tools & Versions

| Tool | Version used |
|---|---|
| Frida | 17.26.3 |
| Objection | latest via pipx |
| ADB | bundled with Android Platform Tools |
| Burp Suite Community | latest |
| Android VM | Android 9 — x86_64 |
| Kali Linux | 2026.1 |

---

## Quick Start

### 1 — Connect to Android VM
```bash
adb connect 192.168.60.129:5555
adb devices
adb shell getprop ro.product.cpu.abi   # confirm architecture
```

### 2 — Start Frida server on device
```bash
adb push frida-server /data/local/tmp/frida-server
adb shell "su -c 'chmod 755 /data/local/tmp/frida-server'"
adb shell "su -c 'nohup /data/local/tmp/frida-server >/dev/null 2>&1 &'"
frida-ps -U | head
```

### 3 — Attach a script
```bash
# By package name
frida -U -n <package.name> -l scripts/<script>.js

# By PID
frida -U -p $(adb shell pidof <package.name> | tr -d '\r') -l scripts/<script>.js

# Via Objection
objection -n $(adb shell pidof <package.name> | tr -d '\r') start -s scripts/<script>.js
```

---

## Script Quick Reference

| Script | Target | What it does |
|---|---|---|
| `bypass.js` | UnCrackable L1 | Prevents `System.exit()` on root detection |
| `inspect.js` | Any | Lists loaded classes containing "login" or "auth" |
| `inspect-insecurebank.js` | InsecureBankV2 | Full namespace scan + method listing |
| `hook.js` | InsecureBankV2 | Patches `isRooted()` to return `false` |
| `root-detection-observer.js` | Any | Logs `Runtime.exec` and `File.exists` calls |
| `root-detection-stack-trace.js` | Any | Same + Java stack trace per exec |
| `rootcheck-androgoat.js` | AndroGoat | Inspect / monitor / instrument `RootCheck` |
| `crypto-hooks.js` | Any | Logs crypto keys, algorithm, and cipher I/O |
| `all_labs_monitor.js` | Any | Full Java + native monitor for all targets |

---

## References

- [OWASP MASTG App Catalogue](https://mas.owasp.org/MASTG/apps/)
- [Frida releases](https://github.com/frida/frida/releases)
- [Android InsecureBankV2](https://github.com/dineshshetty/Android-InsecureBankv2)
- [InsecureBankV2 Walkthrough Part 1](https://infosecwriteups.com/android-insecurebankv2-walkthrough-part-1-9e0788ba5552)

---

> **For educational use only.** All testing was performed in an isolated lab environment against intentionally vulnerable applications.
