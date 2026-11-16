/**
 * bypass.js
 * ---------
 * Blocks System.exit() calls so the app cannot terminate itself when
 * root or tampering is detected (e.g. OWASP UnCrackable Level 1).
 *
 * Usage:
 *   frida -U -p <PID> -l bypass.js
 *   frida -U -n <package> -l bypass.js
 */

Java.perform(function () {
  var System = Java.use("java.lang.System");

  System.exit.implementation = function (var0) {
    console.log("[*] Blocked System.exit() call with code: " + var0);
  };

  console.log("[+] bypass.js loaded — System.exit() is now a no-op");
});
