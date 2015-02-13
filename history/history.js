var currentTabUrl;

gootAlias(document).ready(function(){
	gootAlias('#add-goot-btn').click(function(){
		addCurrentTabToFav();
	});
	

	
	getUserCommentsFromUrl();
	
	getFriendsCommentsFromUrl();

	
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


function getUserCommentsFromUrl(){
	console.log("getUserCommentsFromUrl");
	if(currentTabUrl != null){
		var currentTabUrl= getCurrentTabUrl();
		var JSESSIONID = localStorage.JSESSIONID;
		
		var url = "http://goot.outsidethecircle.eu/plugin/comment/getFromUrl";
		var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
		
		gootAjaxCall(url, data, updateCommentsCallbackForUser);
	} else {
		setTimeout(getUserCommentsFromUrl(), 200);
	}
}


function getFriendsCommentsFromUrl(){
	if(currentTabUrl != null){
		var currentTabUrl= getCurrentTabUrl();
		var JSESSIONID = localStorage.JSESSIONID;
		
		var url = "http://goot.outsidethecircle.eu/plugin/comment/getFromUrlAndFriends";
		var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
		
		gootAjaxCall(url, data, updateCommentsCallbackForFriends);
	} else {
		setTimeout(getFriendsCommentsFromUrl(), 200);
	}
}



function updateCommentsCallbackForFriends(data){
	updateCommentsCallback(data, "friends");
}

function updateCommentsCallbackForUser(data){
	updateCommentsCallback(data, "user");
}

function updateCommentsCallback(data, scope){
    console.log("callback data for comments :", JSON.stringify(data));

	var result = gootAlias.parseJSON(JSON.stringify(data));
		
	var comments = null;
	if(result.status == "success"){
		
		console.log("updateCommentsCallback result success");
		
		comments = result.content.comments;
		var table = gootAlias('<table></table>').addClass('goot-' + scope + '-comments');
		var l = comments.length;
		if(l==0){
			console.log("no comments found");
			gootAlias("#goot-" + scope + "-no-comments").show();
		}
		for(var i = 0; i < l; i++){
			var comment = comments[i];
			var row = null;
			console.log("comment : " + comment);
			if(comment.type == 0){ //image
				row = gootAlias('<tr></tr>').text("image comment with id " + comment.id);
			}else if(comment.type == 1){ //text
				row = gootAlias('<tr></tr>').text("text comment with id " + comment.id);
			}else if(comment.type == 2){ //sound
				row = gootAlias('<tr></tr>').text("sound comment with id " + comment.id);
			}
			table.append(row);
		}
		gootAlias("#goot-" + scope + "-comments-table").append(table);
	} else { 
		console.log("error while getting comment history");
	}
}