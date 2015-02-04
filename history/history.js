var currentTabUrl;

$(document).ready(function(){
	$('#add-goot-btn').click(function(){
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

	$.ajax({
			url: "http://goot.outsidethecircle.eu/plugin/link/add",
			dataType: 'json',
			type:"POST",
			contentType: 'application/json',
			crossDomain: true,
			xhrFields: {
			    withCredentials: true
			},
			data: JSON.stringify({ JSESSIONID : JSESSIONID, tabUrl : currentTabUrl}),
			error: function(data) {
				console.log("going in ajax error treatment");
				if(data.responseText == "success"){
					alert('Url successfully added to favorites');
				} else {
					alert('Adding url to favorites failed');
				}
			}, 
			success:function(data){
				console.log("successful ajax call");
				if(data.responseText == "success"){
					alert('Url successfully added to favorites');
				} else {
					alert('Adding url to favorites failed');
				}
			}
		});
}