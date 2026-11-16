# Day 2 — InsecureBankV2 Deep Dive

## 1. Restart Frida Server

```bash
adb shell "su -c 'killall frida-server'"
adb shell su -c "/data/local/tmp/frida-server >/dev/null 2>&1 &"
adb shell pidof frida-server
frida-ls-devices
frida-ps -U
```

---

## 2. Install InsecureBankV2 APK

```bash
# Download from: https://github.com/dineshshetty/Android-InsecureBankv2
ls
adb push app-release.apk /sdcard/Download/
# Install from the device file manager or via:
adb install app-release.apk
```

---

## 3. Identify the Target Process

```bash
adb shell pm list packages -3
adb shell pm list packages | grep insecurebank
# → com.android.insecurebankv2

adb shell pidof com.android.insecurebankv2
```

---

## 4. Attach Frida

```bash
# By package name (preferred)
frida -U -n com.android.insecurebankv2 -l scripts/inspect.js

# By PID
frida -U -p <PID> -l scripts/inspect.js
```

---

## 5. Attach Objection

```bash
objection -n $(adb shell pidof com.android.insecurebankv2 | tr -d '\r') start -s scripts/inspect.js
```

### Enumerate inside Objection
```
android hooking list classes
android hooking search classes okhttp
android hooking search methods pin
android hooking search methods login
android clipboard monitor
android keystore list
android hooking list activities
```

### Enumerate exported activities
```
android intent launch_activity com.android.insecurebankv2.PostLogin
```

---

## 6. Burp Suite — Intercept Traffic

```bash
# Forward ADB port to Burp listener
adb reverse tcp:8080 tcp:8080
adb shell settings put global http_proxy 127.0.0.1:8080
```

Configure Burp Suite proxy listener on `0.0.0.0:8080`.

---

## 7. Disable TLS Pinning

Inside Objection:
```
android sslpinning disable
```

---

## 8. Bypass Root Detection

Inside Objection:
```
android root disable
android hooking watch class_method <pkg>.RootCheck.isRooted --dump-args --dump-return
```

Or use the dedicated hook script:
```bash
frida -U -n com.android.insecurebankv2 -l scripts/hook.js
```

Reference: https://infosecwriteups.com/android-insecurebankv2-walkthrough-part-1-9e0788ba5552

---

## 9. Deep Inspection with inspect-insecurebank.js

```bash
frida -U -N com.android.insecurebankv2 -l scripts/inspect-insecurebank.js
```

Looks for every class in the `com.android.insecurebankv2` namespace and
flags methods matching: `root | check | security | device | integrity`.

---

## 10. Recover the Keystore Secret

Inside Objection:
```
android keystore list
```

Or via Frida — use `scripts/all_labs_monitor.js` to catch SharedPreferences
and crypto operations as the app runs.
