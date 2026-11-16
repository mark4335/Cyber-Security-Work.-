# Day 1 — Environment Setup & UnCrackable Level 1

## 1. Install Android Platform Tools (ADB)

```bash
sudo apt update
sudo apt install -y adb
sudo apt install -y google-android-platform-tools-installer

adb version
adb devices
```

---

## 2. Install Frida and Objection (Kali)

```bash
sudo apt update
sudo apt install -y pipx
pipx ensurepath

# Install tools
pipx install frida-tools
pipx install objection

# Verify
frida --version
objection version
adb version
```

---

## 3. Connect to Android VM

```bash
adb connect 192.168.60.129:5555
adb devices

# Device properties
adb shell getprop ro.product.cpu.abi      # architecture
adb shell getprop ro.build.version.release # Android version
adb shell getprop ro.product.model         # device model

adb shell   # open interactive shell
```

---

## 4. Frida Server Setup

Download from: https://github.com/frida/frida/releases  
Match the architecture reported by `ro.product.cpu.abi` (e.g. `x86_64`).

```bash
cd ~/Downloads
ls -lh

# Extract
xz -d frida-server-17.26.3-android-x86_64.xz
ls -lh frida-server-17.26.3-android-x86_64

# Push to device
adb push frida-server-17.26.3-android-x86_64 /data/local/tmp/frida-server
adb shell "su -c 'chmod 755 /data/local/tmp/frida-server'"

# Start as root (background, silent)
adb shell "su -c 'nohup /data/local/tmp/frida-server >/dev/null 2>&1 &'"
frida-ps -U | head

# Verify
adb shell pidof frida-server
frida-ls-devices
frida-ps -U
```

---

## 5. UnCrackable Level 1 — Bypass Root Detection

### Check the target package
```bash
adb shell pm list packages -3
adb shell pm list packages | grep -E "chrome|browser|webview"
adb shell pidof owasp.mstg.uncrackable1
```

### Attach with bypass.js
```bash
frida -U -p <PID> -l scripts/bypass.js
# or
objection -n $(adb shell pidof owasp.mstg.uncrackable1 | tr -d '\r') start -s scripts/bypass.js
```

Tap **OK** on the "Root detected!" dialog — Frida reloads the script live.

### Enumerate the app
Inside Objection:
```
android hooking list classes
android hooking search classes okhttp
android hooking search methods pin
android hooking search methods login
android clipboard monitor
android keystore list
```

---

## 6. Install Burp CA as a System Certificate

```bash
# On Kali — convert DER to PEM and get hash filename
openssl x509 -inform DER -in cacert.der -out cacert.pem
openssl x509 -inform PEM -subject_hash_old -in cacert.pem | head -1
# → e.g. 9a5ba575
mv cacert.pem 9a5ba575.0

# Push to device
adb push 9a5ba575.0 /sdcard/Download/

# On device (root shell)
adb shell
su
cp /sdcard/Download/9a5ba575.0 /system/etc/security/cacerts/
chmod 644 /system/etc/security/cacerts/9a5ba575.0
chown root:root /system/etc/security/cacerts/9a5ba575.0
ls -l /system/etc/security/cacerts/9a5ba575.0
# Reboot
reboot
```

Verify after reboot:
```
Settings → Security → Encryption & credentials → Trusted credentials → System tab
```

Terminal check:
```bash
adb shell ls -l /system/etc/security/cacerts/9a5ba575.0
openssl x509 -in /system/etc/security/cacerts/9a5ba575.0 -noout -subject
```

---

## 7. InsecureBankV2 — Initial Check & Proxy

```bash
adb shell pm list packages -3
adb shell pm list packages | grep insecurebank
adb shell pidof com.android.insecurebankv2

# Route traffic through Burp Suite (port 8080)
adb reverse tcp:8080 tcp:8080
adb shell settings put global http_proxy 127.0.0.1:8080
```

### Frida inspection script
```bash
frida -U -n com.android.insecurebankv2 -l scripts/inspect.js
# or by PID
frida -U -p <PID> -l scripts/inspect.js
```
