/**
 * root-detection-observer.js
 * --------------------------
 * Passively observes root-detection behaviour by hooking:
 *   - Runtime.exec()   — logs every shell command the app executes
 *   - File.exists()    — logs every filesystem path the app probes
 *
 * Does NOT modify return values; purely observational.
 *
 * Usage:
 *   frida -U -n <package> -l root-detection-observer.js
 *
 * Typical output:
 *   [File.exists] /system/app/Superuser.apk => false
 *   [Runtime.exec] /system/xbin/which su
 *   [Runtime.exec] /system/bin/which su
 *   [Runtime.exec] which su
 */

Java.perform(function () {
  // --- Runtime.exec hook ---
  var Runtime = Java.use("java.lang.Runtime");

  Runtime.exec.overloads.forEach(function (overload) {
    overload.implementation = function () {
      console.log("[Runtime.exec] " + arguments[0]);
      return overload.apply(this, arguments);
    };
  });

  // --- File.exists hook ---
  var File = Java.use("java.io.File");

  File.exists.implementation = function () {
    var result = this.exists();
    console.log(
      "[File.exists] " + this.getAbsolutePath() + " => " + result
    );
    return result;
  };

  console.log("[+] Root-detection observation enabled");
});
