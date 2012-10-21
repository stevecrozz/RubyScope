/**
 * Listens for the app launching then creates the tab
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.tab.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  window.open("lib/debugger/debugger.html");
});
