# Day 3 — AndroGoat Root Detection & Crypto Recovery

App reference: https://mas.owasp.org/MASTG/apps/#

---

## 1. Start Frida Server

```bash
# Kill any existing instance
adb shell "su -c 'killall frida-server'"

# Start (rooted device)
adb shell su -c "/data/local/tmp/frida-server >/dev/null 2>&1 &"

# Legacy / older firmware fallback
adb shell "/data/local/tmp/frida-server >/dev/null 2>&1 &"

frida-ps -U | head
```

---

## 2. Identify the Target Package

```bash
adb shell pm list packages -3
adb shell pm list packages | grep -E "chrome|browser|webview"
adb shell pidof <package>

# Explore with Objection
objection -n explore

# Or attach directly
frida -U -N <package>
```

---

## 3. InsecureBankV2 Proxy (port 8888 variant)

```bash
adb reverse tcp:8888 tcp:8888
adb shell settings put global http_proxy 127.0.0.1:8888
```

Inside Objection:
```
android hooking list activities
android sslpinning disable
```

---

## 4. Observe Root Detection (passive)

```bash
frida -U -n <package> -l scripts/root-detection-observer.js
```

Expected output:
```
[File.exists] /system/app/Superuser.apk => false
[Runtime.exec] /system/xbin/which su
[Runtime.exec] /system/bin/which su
[Runtime.exec] which su
```

Interpretation:
| Check | Result | Meaning |
|---|---|---|
| `/system/app/Superuser.apk` | false | Superuser APK not present |
| `/system/xbin/which su` | Executed | Checks for su binary |
| `/system/bin/which su` | Executed | Alternate path check |
| `which su` | Executed | PATH-based su search |

---

## 5. Stack-Trace Root Detection

Identify the exact call site:

```bash
frida -U -n <package> -l scripts/root-detection-stack-trace.js
```

---

## 6. AndroGoat / DigitalBank — RootCheck Analysis

```bash
frida -U -n <package> -l scripts/rootcheck-androgoat.js
```

### Call chain
```
DigitalHome.onCreate()
  → RootCheck.isRooted()
    → RootCheck.canExecuteCommand()
      → Runtime.exec("which su")
        → returns boolean
```

### Three modes in rootcheck-androgoat.js:
1. **Mode 1** — list RootCheck methods (default, read-only)
2. **Mode 2** — monitor `isRooted()` return value
3. **Mode 3** — full instrumentation without patching

---

## 7. Recover Crypto Secrets

```bash
frida -U -n <package> -l scripts/crypto-hooks.js
```

Surfaces:
- Encryption algorithm and raw key bytes at the moment a `SecretKeySpec` is constructed
- Cipher algorithm string on `Cipher.getInstance()`
- Plaintext input and ciphertext output on `Cipher.doFinal()`

---

## 8. Full Lab Monitor (all targets)

```bash
frida -U -n <package> -l scripts/all_labs_monitor.js
```

Covers: logging, crypto keys, SharedPreferences, SQLite, file I/O, HTTP URLs,
and native `strncmp`/`strstr` calls for anti-tamper bypass.

---

## Quick Reference — Common Objection Commands

| Command | Purpose |
|---|---|
| `android hooking list classes` | Enumerate all loaded classes |
| `android hooking search classes <term>` | Filter classes by keyword |
| `android hooking search methods <term>` | Filter methods by keyword |
| `android hooking list activities` | List exported activities |
| `android hooking watch class_method <m> --dump-args --dump-return` | Watch a specific method |
| `android sslpinning disable` | Disable TLS certificate pinning |
| `android root disable` | Neutralise root/emulator detection |
| `android keystore list` | List Android Keystore entries |
| `android clipboard monitor` | Monitor clipboard reads/writes |
| `android intent launch_activity <activity>` | Launch an activity directly |
