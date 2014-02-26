/**
 * Handles requests sent by the content script (savetoken.js).  Save the accessToken from FB
 */
function onRequest(request, sender, sendResponse) {
	var tabId = sender.tab.id; //might be useful to close the tab from the extension
	var accessToken = request.accessToken;
	
	//save the accessToken in extension localStorage
	localStorage.accessToken = accessToken;

  // Return nothing to let the connection be cleaned up.
  sendResponse({});
};

// Listen for the content script (savetoken.js) to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);