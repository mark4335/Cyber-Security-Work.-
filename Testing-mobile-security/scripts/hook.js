/**
 * hook.js
 * -------
 * Overrides RootCheck.isRooted() in InsecureBankv2 to always return
 * false, bypassing root detection and allowing the app to run normally
 * on a rooted device.
 *
 * Usage:
 *   frida -U -n com.android.insecurebankv2 -l hook.js
 */

Java.perform(function () {
  var RootCheck = Java.use("com.android.insecurebankv2.RootCheck");

  RootCheck.isRooted.implementation = function () {
    console.log("[hook] isRooted() called — returning false");
    return false;
  };

  console.log("[+] hook.js loaded — RootCheck.isRooted() patched to false");
});
