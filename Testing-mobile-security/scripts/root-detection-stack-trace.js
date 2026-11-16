/**
 * root-detection-stack-trace.js
 * -----------------------------
 * Like root-detection-observer.js but also prints a full Java stack
 * trace on every Runtime.exec() call, so you can pinpoint exactly which
 * class/method in the app triggers each root check.
 *
 * Usage:
 *   frida -U -n <package> -l root-detection-stack-trace.js
 */

Java.perform(function () {
  var Runtime = Java.use("java.lang.Runtime");

  Runtime.exec.overloads.forEach(function (overload) {
    overload.implementation = function () {
      console.log("\n[+] Runtime.exec called");
      console.log("    Command: " + arguments[0]);
      console.log(
        Java.use("android.util.Log").getStackTraceString(
          Java.use("java.lang.Exception").$new()
        )
      );
      return overload.apply(this, arguments);
    };
  });

  console.log("[+] Root detection stack tracing enabled");
});
