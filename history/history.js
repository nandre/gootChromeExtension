var currentTabUrl = null;
var currentSharedLinkId = null;

gootAlias(document).ready(function(){
	gootAlias('#add-goot-btn').click(function(){
		addCurrentTabToFav();
	});
	
	gootAlias('#goot-friend-add').click(function(){
		addFriend();
	});
	
	
	getMyLinks();
	
	getMyFriends();
	
});


chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    console.log("tab url : " + tabs[0].url);
    
    triggerUpdates(tabs[0].url);
});

function triggerUpdates(tabUrl){
    this.currentTabUrl = tabUrl;
    
    getUserCommentsFromUrl(tabUrl);
	getFriendsCommentsFromUrl(tabUrl);
}

function getCurrentTabUrl(){
	return currentTabUrl;
}

function getCurrentSharedLinkId(){
	return currentSharedLinkId;
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

function getMyLinks(){
	var url = "http://goot.outsidethecircle.eu/plugin/link/getMyFavorites";
	var JSESSIONID = localStorage.JSESSIONID;
	
	var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
	
	gootAjaxCall(url, data, getMyLinksCallback);
	
}

function getMyLinksCallback(data){

	var result = gootAlias.parseJSON(JSON.stringify(data));
	
	console.log("links : " + JSON.stringify(data));
	
	scope = "user";
	var links = null;
	if(result.status == "success"){
		
		console.log("getMyLinksCallback result success");
		
		links = result.content.links;
		var table = gootAlias('<ul></ul>').addClass('goot-' + scope + '-links'); 
		var l = 0;
		try { 
			var l = links.length;
		}catch(e){}
		if(l==0){
			console.log("no links found");
			gootAlias("#goot-" + scope + "-no-links").show();
			gootAlias("#goot-" + scope + "-links-txt").hide();
		}
		console.log("links found : " + l);
		for(var i = 0; i < l; i++){
			var link = links[i];
			var row = null;
			console.log("link : " + JSON.stringify(link));

			row = gootAlias('<li class="goot-link-row"></li>').append("<a href='#' id='goot-link-parent-" + link.id + "'>" + link.url.substring(0, Math.min(30, link.url.length)) +"...<a>");
			row.append("<div class='goot-link-subtree' style='display:none;' id='goot-link-subtree-" + link.id + "'>" +
						"<a class='goot-btn-link' target='_blank' href='" + link.url + "'>Open" +
						"</a>" +  
						"<button class='goot-standard-btn' id='goot-share-btn-" + link.id + "'>" + 
							"Share" + 
							"</button>" + 
						"</div>");
			//save link url in the view to avoid having to ajax call the server
			row.append("<input type='hidden' id='goot-link-url-" + link.id + "' name='goot-link-url-" + link.id + "' value=" + link.url + "'></input>");
			table.append(row);			
		}
		gootAlias("#goot-" + scope + "-links-table").append(table);
		
		for(var j=0; j < l;j++){
			var link = links[j];
			console.log('link.id : ' + link.id);
			
			gootAlias("#goot-link-parent-" + link.id).click(function(){
				expandLink(this.id);
			});
			
			gootAlias("#goot-share-btn-" + link.id).click(function(){
				shareThisLink(this.id);
			});
		}
	} else { 
		console.log("error while getting comment history");
	}
}

function addFriend(){
	var url = "http://goot.outsidethecircle.eu/plugin/friend/add";
	var JSESSIONID = localStorage.JSESSIONID;
	var email = gootAlias("#goot-friend-email").val();
	
	console.log("addFriend email : " + email)
	
	if(email == null || (email !=null && email.length < 1)){
		alert("Please enter an email");
		return;
	}
	
	var data = { JSESSIONID : JSESSIONID, email : email};
	
	gootAjaxCall(url, data, addFriendCallback);
}

function addFriendCallback(data){
	if(data.responseText == "success"){
		alert('Friend successfully added');
	} else {
		alert('Your friend does not have a Gliim account yet :-(');
	}
}


function getMyFriends(){
	var url = "http://goot.outsidethecircle.eu/plugin/friend/getAll";
	var JSESSIONID = localStorage.JSESSIONID;
	
	var data = { JSESSIONID : JSESSIONID };
	
	gootAjaxCall(url, data, getMyFriendsCallback);
	
}

function getMyFriendsCallback(data){

	var result = gootAlias.parseJSON(JSON.stringify(data));
	
	console.log("friends : " + JSON.stringify(data));
	
	scope = "user";
	var links = null;
	if(result.status == "success"){
		
		console.log("getMyFriendsCallback result success");
		
		links = result.content.friends;
		var table = gootAlias('<table></table>').addClass('goot-' + scope + '-friends'); 
		var l = 0;
		try { 
			var l = friends.length;
		}catch(e){}
		if(l==0){
			console.log("no friends found");
			gootAlias("#goot-" + scope + "-no-friends").show();
			gootAlias("#goot-" + scope + "-friends-txt").hide();
		}
		console.log("friends found : " + l);
		for(var i = 0; i < l; i++){
			var friend = friends[i];
			var row = null;
			console.log("link : " + JSON.stringify(link));

			row = gootAlias('<tr class="goot-friend-row"></tr>').append("<button class='goot-standard-button' id='goot-friend-btn-" + friend.id + "'>" + friend.email +"<button>");
			//save link url in the view to avoid having to ajax call the server
			row.append("<input type='hidden' id='goot-friend-email-" + friend.id + "' name='goot-friend-email-" + friend.id + "' value=" + friend.email + "'></input>");
			table.append(row);			
		}
		gootAlias("#goot-" + scope + "-friends-table").append(table);
		
		for(var j=0; j < l;j++){
			var friend = friends[j];
			console.log('friend.id : ' + friend.id);
			
			gootAlias("#goot-friend-btn-" + friend.id).click(function(){
				sendLinkToAFriend(this.id);
			});
			
		}
	} else { 
		console.log("error while getting comment history");
	}
}


function sendLinkToAFriend(friendTagId){
	
	var friendId = friendTagId.replace('goot-friend-btn-','');
	var friendEmail = gootAlias("#goot-friend-email-" + friendId).val();
	var linkId = currentSharedLinkId;
	var tabUrl = gootAlias("#goot-link-url-" + linkId).val();

	var url = "http://goot.outsidethecircle.eu/plugin/link/send";
	var JSESSIONID = localStorage.JSESSIONID;
	
	var data = {tabUrl : tabUrl, receiverMail : friendEmail, JSESSIONID : JSESSIONID };
	
	gootAjaxCall(url, data, sendLinkToAFriendCallback);
}


function sendLinkToAFriendCallback(data){
	if(data.responseText == "success"){
		alert('Link successfully sent to your friend');
	} else {
		alert('Sending the link failed :-(');
	}
}


//show comments and data in the link
function expandLink(linkTagId){
	console.log("expandLink : " + linkTagId);
	
	var linkId = linkTagId.replace('goot-link-parent-','');
	
	//hide all other expanded links
	gootAlias(".goot-link-subtree").slideUp();
	
	// expand the link
	if(gootAlias("#goot-link-subtree-" +linkId).is(":hidden")){
		gootAlias("#goot-link-subtree-" +linkId).slideDown();
	} else { 
		//hide if link was already shown
		gootAlias("#goot-link-subtree-" +linkId).slideUp();
	}
	
}

function shareThisLink(linkTagId){
	var linkId = linkTagId.replace('goot-share-btn-','');
	var linkUrl = gootAlias("#goot-link-url-" + linkId).val();
	
	goToShareMenu(linkId, linkUrl);
	
}

function goToShareMenu(linkId, linkUrl){
	console.log("linkUrl : " +linkUrl);
	//display QRCode for this link
	synchronousShowQRCode(linkUrl);
	gootAlias("#goot-current-shared-link").html("<p>" + linkUrl.substring(0, Math.min(30, linkUrl.length)) +  "...</p>");
	currentSharedLinkId = linkId;
	toggleShareMenu();
}

function getUserCommentsFromUrl(tabUrl){
	console.log("getUserCommentsFromUrl");
	if(tabUrl != null){
		var currentTabUrl= tabUrl;
		var JSESSIONID = localStorage.JSESSIONID;
		
		var url = "http://goot.outsidethecircle.eu/plugin/comment/getFromUrl";
		var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
		
		gootAjaxCall(url, data, updateCommentsCallbackForUser);
	} else {
		console.log('error, current tab url is null');
	}
}


function getFriendsCommentsFromUrl(tabUrl){
	if(tabUrl != null){
		var currentTabUrl= tabUrl;
		var JSESSIONID = localStorage.JSESSIONID;
		
		var url = "http://goot.outsidethecircle.eu/plugin/comment/getFromUrlAndFriends";
		var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
		
		gootAjaxCall(url, data, updateCommentsCallbackForFriends);
	} else {
		console.log('error, current tab url is null');
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
		
		comments = result.content.comments[0];
		var table = gootAlias('<table></table>').addClass('goot-' + scope + '-comments'); 
		var l = 0;
		try { 
			var l = comments.length;
		}catch(e){}
		if(l==0){
			console.log("no comments found");
			gootAlias("#goot-" + scope + "-no-comments").show();
			gootAlias("#goot-" + scope + "-comments-txt").hide();
		}
		console.log("comments found : " + l);
		for(var i = 0; i < l; i++){
			var comment = comments[i];
			var row = null;
			console.log("comment : " + JSON.stringify(comment));
			console.log("comment.type : " + comment.type);
			if(comment.type == '0'){ //image
				row = gootAlias('<tr></tr>').text("image comment with id " + comment.id);
			}else if(comment.type == '1'){ //text
				row = gootAlias('<tr></tr>').text("text comment with id " + comment.id);
			}else if(comment.type == '2'){ //sound
				row = gootAlias('<tr></tr>').text("sound comment with id " + comment.id);
			}
			table.append(row);
		}
		gootAlias("#goot-" + scope + "-comments-table").append(table);
	} else { 
		console.log("error while getting comment history");
	}
}