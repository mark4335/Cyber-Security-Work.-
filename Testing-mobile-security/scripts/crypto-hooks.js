/**
 * crypto-hooks.js
 * ---------------
 * Hooks Java Cryptography Extension (JCE) classes to surface encryption
 * keys and cipher operations at runtime — useful for recovering secrets
 * that are invisible in static analysis.
 *
 * Hooks:
 *   - SecretKeySpec.<init>  → logs algorithm and raw key bytes
 *   - Cipher.getInstance    → logs the requested algorithm string
 *   - Cipher.doFinal        → logs plaintext input and ciphertext output
 *
 * Usage:
 *   frida -U -n <package> -l crypto-hooks.js
 */

Java.perform(function () {
  function bytesToString(bytes) {
    if (!bytes) return "null";
    var result = "";
    for (var i = 0; i < bytes.length; i++) {
      var b = bytes[i] & 0xff;
      result += b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
    }
    return result;
  }

  // ── Probe JCE availability ──────────────────────────────────────────
  [
    "javax.crypto.Cipher",
    "javax.crypto.Mac",
    "javax.crypto.KeyGenerator",
    "java.security.MessageDigest",
    "javax.crypto.spec.SecretKeySpec",
  ].forEach(function (name) {
    try {
      Java.use(name);
      console.log("[+] Available: " + name);
    } catch (e) {
      console.log("[-] Not available: " + name);
    }
  });

  // ── SecretKeySpec — log key bytes and algorithm ─────────────────────
  try {
    var SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
    SecretKeySpec.$init
      .overload("[B", "java.lang.String")
      .implementation = function (keyBytes, algo) {
        console.log(
          "\n[Crypto Key] Algorithm: " +
            algo +
            " | Key: " +
            bytesToString(keyBytes)
        );
        return this.$init(keyBytes, algo);
      };
  } catch (e) {
    console.log("[-] SecretKeySpec hook failed: " + e);
  }

  // ── Cipher.getInstance — log algorithm string ───────────────────────
  try {
    var Cipher = Java.use("javax.crypto.Cipher");
    Cipher.getInstance.overloads.forEach(function (overload) {
      overload.implementation = function () {
        console.log("\n[Cipher.getInstance] Algorithm: " + arguments[0]);
        return overload.apply(this, arguments);
      };
    });
  } catch (e) {
    console.log("[-] Cipher.getInstance hook failed: " + e);
  }

  // ── Cipher.doFinal — log plaintext in / ciphertext out ─────────────
  try {
    Cipher.doFinal.overload("[B").implementation = function (input) {
      var output = this.doFinal(input);
      console.log("[Cipher.doFinal]");
      console.log("  In : " + bytesToString(input));
      console.log("  Out: " + bytesToString(output));
      return output;
    };
  } catch (e) {
    console.log("[-] Cipher.doFinal hook failed: " + e);
  }

  console.log("[+] crypto-hooks.js armed");
});
