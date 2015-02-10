/**
 * Handles requests sent by the content script (savetoken.js).  Save the accessToken from FB
 */
function onRequest(request, sender, sendResponse) {
	var tabId = sender.tab.id; //might be useful to close the tab from the extension
	var accessToken = request.accessToken;
	var JSESSIONID = request.JSESSIONID;
	
	//save the accessToken in extension localStorage (useful for adding data on facebook)
	localStorage.accessToken = accessToken;
	//save the JSESSIONID in the localStorage (useful for adding data on goot)
	localStorage.JESSSIONID = JSESSIONID;
	//save the JSESSIONID in the cookie
	document.cookie="JSESSIONID=" + JSESSIONID;
	
  // Return nothing to let the connection be cleaned up.
  sendResponse({});
};

// Listen for the content script (savetoken.js) to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);



// getLocalStorage into content scripts (injected ones)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage"){
      sendResponse({data: localStorage[request.key]});
    } else { 
      sendResponse({});
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        // Execute some script when the page is fully (DOM) ready
    	chrome.tabs.executeScript(null, {file: "goot_commons.js"});
    }
});

//CONTEXTUAL MENUS
chrome.contextMenus.create({
    id: "gootPageContextMenu",  
    title: "Add a GooT comment to whole page",
    contexts: ["all"]
});

//chrome.contextMenus.create({
//    id: "gootSelectionContextMenu",  
//    title: "Add a GooT comment to selected element",
//    contexts:["selection"],
//    onclick: addContextualComment
//});

/* Register a listener for the `onClicked` event */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (tab) {
    	if(info.menuItemId == "gootPageContextMenu"){
	        /* Inject the code into the current tab */
	    	chrome.tabs.executeScript(null, {file: "record-comments/record.js"});
    	}
    }
});