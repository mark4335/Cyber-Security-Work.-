/**
 * all_labs_monitor.js
 * -------------------
 * Comprehensive two-part monitor that arms Java-layer and native-layer
 * hooks in a single attach. Covers every target used in Lab 4.
 *
 * Part 1 — Java Layer
 *   1. Insecure Logging      (android.util.Log d/i/v/w/e)
 *   2. Crypto monitor        (SecretKeySpec key bytes, Cipher.doFinal I/O)
 *   3. SharedPreferences     (getString reads, putString writes)
 *   4. SQLite                (rawQuery logging)
 *   5. File creation         (FileOutputStream path logging)
 *   6. HTTP/HTTPS URLs       (java.net.URL and OkHttp3)
 *
 * Part 2 — Native Layer  (UnCrackable Level 2 & 3)
 *   - strncmp  → catches native secret-string comparisons
 *   - strstr   → catches Frida/Xposed detection; patches return to NULL
 *
 * Usage:
 *   frida -U -n <package> -l all_labs_monitor.js
 */

// =====================================================================
// PART 1: JAVA LAYER MONITOR
// =====================================================================
Java.perform(function () {
  console.log("[+] Part 1: Java Framework & Network Hooks Armed...");

  function bytesToString(bytes) {
    if (!bytes) return "null";
    var result = "";
    for (var i = 0; i < bytes.length; i++) {
      var b = bytes[i] & 0xff;
      result += b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
    }
    return result;
  }

  // 1. Insecure Logging Monitor
  try {
    var Log = Java.use("android.util.Log");
    ["d", "i", "v", "w", "e"].forEach(function (level) {
      Log[level]
        .overload("java.lang.String", "java.lang.String")
        .implementation = function (tag, msg) {
          console.log("[Log." + level + "] [" + tag + "] " + msg);
          return this[level](tag, msg);
        };
    });
    console.log("  [✓] Log hooks armed");
  } catch (e) {
    console.log("  [✗] Log hook failed: " + e);
  }

  // 2. Java Cryptography Monitor
  try {
    var SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
    SecretKeySpec.$init
      .overload("[B", "java.lang.String")
      .implementation = function (keyBytes, algo) {
        console.log(
          "[Crypto Key] Algo: " + algo + " | Key: " + bytesToString(keyBytes)
        );
        return this.$init(keyBytes, algo);
      };

    var Cipher = Java.use("javax.crypto.Cipher");
    Cipher.doFinal.overload("[B").implementation = function (input) {
      var output = this.doFinal(input);
      console.log("[Cipher.doFinal]");
      console.log("  In : " + bytesToString(input));
      console.log("  Out: " + bytesToString(output));
      return output;
    };
    console.log("  [✓] Crypto hooks armed");
  } catch (e) {
    console.log("  [✗] Crypto hook failed: " + e);
  }

  // 3. SharedPreferences Monitor
  try {
    var SharedPrefs = Java.use("android.app.SharedPreferencesImpl");
    SharedPrefs.getString.implementation = function (key, defVal) {
      var val = this.getString(key, defVal);
      console.log("[Prefs READ ] " + key + " = " + val);
      return val;
    };

    var Editor = Java.use(
      "android.app.SharedPreferencesImpl$EditorImpl"
    );
    Editor.putString.implementation = function (key, val) {
      console.log("[Prefs WRITE] " + key + " = " + val);
      return this.putString(key, val);
    };
    console.log("  [✓] SharedPreferences hooks armed");
  } catch (e) {
    console.log("  [✗] SharedPreferences hook failed: " + e);
  }

  // 4. SQLite Query Monitor
  try {
    var SQLite = Java.use("android.database.sqlite.SQLiteDatabase");
    SQLite.rawQuery
      .overload("java.lang.String", "[Ljava.lang.String;")
      .implementation = function (sql, args) {
        console.log(
          "[SQL Query] " +
            sql +
            (args ? " | Args: " + JSON.stringify(args) : "")
        );
        return this.rawQuery(sql, args);
      };
    console.log("  [✓] SQLite hooks armed");
  } catch (e) {
    console.log("  [✗] SQLite hook failed: " + e);
  }

  // 5. File Creation Monitor
  try {
    var FileOutputStream = Java.use("java.io.FileOutputStream");
    FileOutputStream.$init
      .overload("java.io.File", "boolean")
      .implementation = function (file, append) {
        console.log("[File Write] " + file.getAbsolutePath());
        return this.$init(file, append);
      };
    console.log("  [✓] File hooks armed");
  } catch (e) {
    console.log("  [✗] File hook failed: " + e);
  }

  // 6. HTTP/HTTPS URL Monitor
  try {
    var URL = Java.use("java.net.URL");
    URL.$init.overload("java.lang.String").implementation = function (
      urlStr
    ) {
      console.log("[HTTP URL] " + urlStr);
      return this.$init(urlStr);
    };
    console.log("  [✓] java.net.URL hook armed");
  } catch (e) {
    console.log("  [✗] java.net.URL hook failed: " + e);
  }

  try {
    var OkHttp = Java.use("okhttp3.Request$Builder");
    OkHttp.url.overload("java.lang.String").implementation = function (
      urlStr
    ) {
      console.log("[OkHttp URL] " + urlStr);
      return this.url(urlStr);
    };
    console.log("  [✓] OkHttp3 hook armed");
  } catch (e) {
    console.log("  [✗] OkHttp3 hook failed: " + e);
  }
});

// =====================================================================
// PART 2: NATIVE C/C++ LAYER MONITOR
// =====================================================================
setImmediate(function () {
  console.log("[+] Part 2: Native C/C++ Hooks Armed...");

  // Hook strncmp — catches native secret-string comparisons
  var strncmpPtr = Module.findExportByName("libc.so", "strncmp");
  if (strncmpPtr) {
    Interceptor.attach(strncmpPtr, {
      onEnter: function (args) {
        var len = args[2].toInt32();
        // Filter: ignore tiny system comparisons, focus on likely secrets (8–64 bytes)
        if (len >= 8 && len <= 64) {
          var s1 = args[0].readUtf8String(len);
          var s2 = args[1].readUtf8String(len);
          if (
            s1 &&
            s2 &&
            (s1.indexOf("Thanks") !== -1 ||
              s2.indexOf("Thanks") !== -1 ||
              len === 23 ||
              len === 24)
          ) {
            console.log(
              "[Native strncmp] ('" + s1 + "' vs '" + s2 + "', len=" + len + ")"
            );
          }
        }
      },
    });
    console.log("  [✓] strncmp hook armed");
  } else {
    console.log("  [✗] strncmp not found in libc.so");
  }

  // Hook strstr — catches Frida/Xposed anti-tamper detection, patches to NULL
  var strstrPtr = Module.findExportByName("libc.so", "strstr");
  if (strstrPtr) {
    Interceptor.attach(strstrPtr, {
      onEnter: function (args) {
        var needle = args[1].readCString();
        if (
          needle &&
          (needle.indexOf("frida") !== -1 ||
            needle.indexOf("gum-js") !== -1 ||
            needle.indexOf("xposed") !== -1)
        ) {
          console.log(
            "[Anti-Tamper strstr] App scanning for: '" + needle + "'"
          );
          this.isDetection = true;
        }
      },
      onLeave: function (retval) {
        // Return NULL so the app believes Frida was not found
        if (this.isDetection) {
          retval.replace(ptr(0));
          this.isDetection = false;
        }
      },
    });
    console.log("  [✓] strstr hook armed (anti-tamper bypass active)");
  } else {
    console.log("  [✗] strstr not found in libc.so");
  }
});
