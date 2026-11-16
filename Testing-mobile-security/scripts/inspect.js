/**
 * inspect.js
 * ----------
 * Enumerates all loaded Java classes and prints any whose name contains
 * "login" or "auth". Works against any target — swap the filter strings
 * to focus on other class families.
 *
 * Usage:
 *   frida -U -n com.android.insecurebankv2 -l inspect.js
 *   frida -U -p <PID> -l inspect.js
 *   objection -n $(adb shell pidof <pkg> | tr -d '\r') start -s inspect.js
 */

Java.perform(function () {
  console.log("[+] Frida attached");
  console.log("[+] Inspecting loaded classes...");

  Java.enumerateLoadedClasses({
    onMatch: function (className) {
      if (
        className.toLowerCase().includes("login") ||
        className.toLowerCase().includes("auth")
      ) {
        console.log("[CLASS] " + className);
      }
    },
    onComplete: function () {
      console.log("[+] Class enumeration completed");
    },
  });
});
