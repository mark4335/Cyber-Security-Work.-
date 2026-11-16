/**
 * rootcheck-androgoat.js
 * ----------------------
 * Targets the AndroGoat / DigitalBank application.
 * Three modes — comment/uncomment the block you need:
 *
 *   MODE 1  List RootCheck methods (read-only, run first)
 *   MODE 2  Monitor isRooted() return value (read-only)
 *   MODE 3  Instrument isRooted() without patching its return value
 *
 * Usage:
 *   frida -U -n <package> -l rootcheck-androgoat.js
 *
 * Call chain in the target app:
 *   DigitalHome.onCreate()
 *     → RootCheck.isRooted()
 *       → RootCheck.canExecuteCommand()
 *         → Runtime.exec("which su")
 *           → returns boolean
 */

Java.perform(function () {
  var RootCheck = Java.use("com.appifie.digitalbank.RootCheck");

  // ── MODE 1: list declared methods ──────────────────────────────────
  console.log("[+] RootCheck methods:");
  RootCheck.class.getDeclaredMethods().forEach(function (method) {
    console.log("  " + method.toString());
  });

  // ── MODE 2: monitor return value (uncomment to use) ────────────────
  /*
  var isRooted = RootCheck.isRooted;
  isRooted.implementation = function () {
    var result = isRooted.call(this);
    console.log("\n[RootCheck.isRooted] returned: " + result);
    return result;
  };
  console.log("[+] RootCheck return-value monitoring enabled");
  */

  // ── MODE 3: full instrumentation without patching ──────────────────
  /*
  var original = RootCheck.isRooted;
  original.implementation = function () {
    console.log("[+] RootCheck.isRooted called");
    var result = original.call(this);
    console.log("[+] Original return value: " + result);
    return result;
  };
  console.log("[+] RootCheck instrumentation attached");
  */
});
