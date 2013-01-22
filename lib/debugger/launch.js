// Listens for the app launching then creates the tab
chrome.app.runtime.onLaunched.addListener(function() {
  window.open("lib/debugger/debugger.html");
});
