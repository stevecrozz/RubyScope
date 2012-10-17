/**
 * Listens for the app launching then creates the tab
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.tab.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("debugger.html");
});
