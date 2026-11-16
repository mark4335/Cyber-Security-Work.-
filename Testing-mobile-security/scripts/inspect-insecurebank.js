/**
 * inspect-insecurebank.js
 * -----------------------
 * Deeper inspection of InsecureBankv2: iterates every class in the
 * com.android.insecurebankv2 namespace, prints its declared methods,
 * and highlights any method whose name matches a root/security pattern.
 *
 * Usage:
 *   frida -U -N com.android.insecurebankv2 -l inspect-insecurebank.js
 */

Java.perform(function () {
  console.log("[+] Inspecting InsecureBankv2 classes");

  Java.enumerateLoadedClasses({
    onMatch: function (name) {
      // Only inspect classes belonging to InsecureBankv2
      if (name.indexOf("com.android.insecurebankv2.") === 0) {
        console.log("\n[CLASS] " + name);
        try {
          var C = Java.use(name);

          C.class.getDeclaredMethods().forEach(function (method) {
            var methodName = method.getName();

            // Highlight methods with potentially sensitive names
            if (/root|check|security|device|integrity/i.test(methodName)) {
              console.log("  [POTENTIAL CHECK] " + method);
            } else {
              console.log("  [METHOD] " + methodName);
            }
          });
        } catch (e) {
          console.log("  [ERROR] " + e);
        }
      }
    },
    onComplete: function () {
      console.log("\n[+] Application class inspection completed");
    },
  });
});
