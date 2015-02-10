var currentTabUrl;

gootAlias(document).ready(function(){
	gootAlias('#add-goot-btn').click(function(){
		addCurrentTabToFav();
	});
});

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    console.log("tab url : " + tabs[0].url);
    currentTabUrl = tabs[0].url;
});


function getCurrentTabUrl(){
	return currentTabUrl;
}

function addCurrentTabToFav(){

	var currentTabUrl= getCurrentTabUrl();
	var JSESSIONID = localStorage.JSESSIONID;

	console.log("current tab url : " + currentTabUrl);
	var url = "http://goot.outsidethecircle.eu/plugin/link/add";
	var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
	
	gootAjaxCall(url, data, historyCallback);
}

function historyCallback(data){
	if(data.responseText == "success"){
		alert('Url successfully added to favorites');
	} else {
		alert('Adding url to favorites failed');
	}
}