$(document).ready(function(){
	$('#add-goot-btn').click(function(){
		addCurrentTabToFav();
	});
});


function getCurrentTabUrl(){
	var url = null;
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
	   url = tabs[0].url;
	});
	return url;
	
}

function addCurrentTabToFav(){

	var currentTabUrl= getCurrentTabUrl();
	var JSESSIONID = localStorage.JSESSIONID;

	console.log("current tab url : " + currentPageUrl);

	$.ajax({
			url: "http://goot.outsidethecircle.eu/plugin/link/add",
			dataType: 'json',
			type:"POST",
			contentType: 'application/json',
			crossDomain: true,
			xhrFields: {
			    withCredentials: true
			},
			data: { JSESSIONID : JSESSIONID, url : currentTabUrl},
			error: function(data) {
				console.log("error in ajax call");
			}, 
			success:function(data){
				console.log("successful ajax call");
				if(data.responseText != "error"){
					//localStorage.JSESSIONID = data.responseText;
					
					alert('Url successfully added to favorites');
				} else {
					//connection failed
				}
			}
		});
}