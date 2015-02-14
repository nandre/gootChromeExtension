var currentTabUrl = null;
var currentSharedLinkId = null;

gliiimAlias(document).ready(function(){
	gliiimAlias('#add-gliiim-btn').click(function(){
		addCurrentTabToFav();
	});
	
	gliiimAlias('#gliiim-friend-add').click(function(){
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
	var url = "http://gliiim.outsidethecircle.eu/plugin/link/add";
	var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
	
	gliiimAjaxCall(url, data, historyCallback);
}

function historyCallback(data){
	if(data.responseText == "success"){
		alert('Url successfully added to favorites');
	} else {
		alert('Adding url to favorites failed');
	}
}

function getMyLinks(){
	var url = "http://gliiim.outsidethecircle.eu/plugin/link/getMyFavorites";
	var JSESSIONID = localStorage.JSESSIONID;
	
	var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
	
	gliiimAjaxCall(url, data, getMyLinksCallback);
	
}

function getMyLinksCallback(data){

	var result = gliiimAlias.parseJSON(JSON.stringify(data));
	
	console.log("links : " + JSON.stringify(data));
	
	scope = "user";
	var links = null;
	if(result.status == "success"){
		
		console.log("getMyLinksCallback result success");
		
		links = result.content.links;
		var table = gliiimAlias('<ul></ul>').addClass('gliiim-' + scope + '-links'); 
		var l = 0;
		try { 
			var l = links.length;
		}catch(e){}
		if(l==0){
			console.log("no links found");
			gliiimAlias("#gliiim-" + scope + "-no-links").show();
			gliiimAlias("#gliiim-" + scope + "-links-txt").hide();
		}
		console.log("links found : " + l);
		for(var i = 0; i < l; i++){
			var link = links[i];
			var row = null;
			console.log("link : " + JSON.stringify(link));

			row = gliiimAlias('<li class="gliiim-link-row"></li>').append("<a href='#' id='gliiim-link-parent-" + link.id + "'>" + link.url.substring(0, Math.min(30, link.url.length)) +"...<a>");
			row.append("<div class='gliiim-link-subtree' style='display:none;' id='gliiim-link-subtree-" + link.id + "'>" +
						"<a class='gliiim-btn-link' target='_blank' href='" + link.url + "'>Open" +
						"</a>" +  
						"<button class='gliiim-standard-btn' id='gliiim-share-btn-" + link.id + "'>" + 
							"Share" + 
							"</button>" + 
						"</div>");
			//save link url in the view to avoid having to ajax call the server
			row.append("<input type='hidden' id='gliiim-link-url-" + link.id + "' name='gliiim-link-url-" + link.id + "' value=" + link.url + "'></input>");
			table.append(row);			
		}
		gliiimAlias("#gliiim-" + scope + "-links-table").append(table);
		
		for(var j=0; j < l;j++){
			var link = links[j];
			console.log('link.id : ' + link.id);
			
			gliiimAlias("#gliiim-link-parent-" + link.id).click(function(){
				expandLink(this.id);
			});
			
			gliiimAlias("#gliiim-share-btn-" + link.id).click(function(){
				shareThisLink(this.id);
			});
		}
	} else { 
		console.log("error while getting comment history");
	}
}

function addFriend(){
	var url = "http://gliiim.outsidethecircle.eu/plugin/friend/add";
	var JSESSIONID = localStorage.JSESSIONID;
	var email = gliiimAlias("#gliiim-friend-email").val();
	
	console.log("addFriend email : " + email)
	
	if(email == null || (email !=null && email.length < 1)){
		alert("Please enter an email");
		return;
	}
	
	var data = { JSESSIONID : JSESSIONID, email : email};
	
	gliiimAjaxCall(url, data, addFriendCallback);
}

function addFriendCallback(data){
	if(data.responseText == "success"){
		alert('Friend successfully added');
	} else {
		alert('Your friend does not have a Gliim account yet :-(');
	}
}


function getMyFriends(){
	var url = "http://gliiim.outsidethecircle.eu/plugin/friend/getAll";
	var JSESSIONID = localStorage.JSESSIONID;
	
	var data = { JSESSIONID : JSESSIONID };
	
	gliiimAjaxCall(url, data, getMyFriendsCallback);
	
}

function getMyFriendsCallback(data){

	var result = gliiimAlias.parseJSON(JSON.stringify(data));
	
	console.log("friends : " + JSON.stringify(data));
	
	scope = "user";
	var friends = null;
	if(result.status == "success"){
		
		console.log("getMyFriendsCallback result success");
		
		friends = result.content.friends;
		var table = gliiimAlias('<div></div>').addClass('gliiim-' + scope + '-friends'); 
		var l = 0;
		try { 
			var l = friends.length;
		}catch(e){}
		if(l==0){
			console.log("no friends found");
			gliiimAlias("#gliiim-" + scope + "-no-friends").show();
			gliiimAlias("#gliiim-" + scope + "-friends-txt").hide();
		}
		console.log("friends found : " + l);
		for(var i = 0; i < l; i++){
			var friend = friends[i];
			var row = null;
			console.log("friend " + JSON.stringify(friend));

			row = gliiimAlias('<div class="row gliiim-friend-row text-align"></div>').append("<button class='gliiim-standard-btn fix-center' id='gliiim-friend-btn-" + friend.id + "'>" + friend.email +"</button>");
			//save link url in the view to avoid having to ajax call the server
			row.append("<input type='hidden' id='gliiim-friend-email-" + friend.id + "' name='gliiim-friend-email-" + friend.id + "' value='" + friend.email + "'></input>");
			table.append(row);			
		}
		gliiimAlias("#gliiim-" + scope + "-friends-table").append(table);
		
		for(var j=0; j < l;j++){
			var friend = friends[j];
			console.log('friend.id : ' + friend.id);
			
			gliiimAlias("#gliiim-friend-btn-" + friend.id).click(function(){
				sendLinkToAFriend(this.id);
			});
			
		}
	} else { 
		console.log("error while getting comment history");
	}
}


function sendLinkToAFriend(friendTagId){
	
	var friendId = friendTagId.replace('gliiim-friend-btn-','');
	var friendEmail = gliiimAlias("#gliiim-friend-email-" + friendId).val();
	var linkId = currentSharedLinkId;
	var tabUrl = gliiimAlias("#gliiim-link-url-" + linkId).val();

	var url = "http://gliiim.outsidethecircle.eu/plugin/link/send";
	var JSESSIONID = localStorage.JSESSIONID;
	
	console.log("friendEmail : " + friendEmail);
	
	var data = {tabUrl : tabUrl, receiverMail : friendEmail, JSESSIONID : JSESSIONID };
	
	gliiimAjaxCall(url, data, sendLinkToAFriendCallback);
}


function sendLinkToAFriendCallback(data){
	console.log("sendLinkToAFriendCallback data : " + data.responseText);
	if(data.responseText == "success"){
		alert('Link successfully sent to your friend');
	} else {
		alert('Sending the link failed :-(');
	}
}


//show comments and data in the link
function expandLink(linkTagId){
	console.log("expandLink : " + linkTagId);
	
	var linkId = linkTagId.replace('gliiim-link-parent-','');
	
	//hide all other expanded links
	gliiimAlias(".gliiim-link-subtree").slideUp();
	
	// expand the link
	if(gliiimAlias("#gliiim-link-subtree-" +linkId).is(":hidden")){
		gliiimAlias("#gliiim-link-subtree-" +linkId).slideDown();
	} else { 
		//hide if link was already shown
		gliiimAlias("#gliiim-link-subtree-" +linkId).slideUp();
	}
	
}

function shareThisLink(linkTagId){
	var linkId = linkTagId.replace('gliiim-share-btn-','');
	var linkUrl = gliiimAlias("#gliiim-link-url-" + linkId).val();
	
	goToShareMenu(linkId, linkUrl);
	
}

function goToShareMenu(linkId, linkUrl){
	console.log("linkUrl : " +linkUrl);
	//display QRCode for this link
	synchronousShowQRCode(linkUrl);
	gliiimAlias("#gliiim-current-shared-link").html("<p>" + linkUrl.substring(0, Math.min(30, linkUrl.length)) +  "...</p>");
	currentSharedLinkId = linkId;
	toggleShareMenu();
}

function getUserCommentsFromUrl(tabUrl){
	console.log("getUserCommentsFromUrl");
	if(tabUrl != null){
		var currentTabUrl= tabUrl;
		var JSESSIONID = localStorage.JSESSIONID;
		
		var url = "http://gliiim.outsidethecircle.eu/plugin/comment/getFromUrl";
		var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
		
		gliiimAjaxCall(url, data, updateCommentsCallbackForUser);
	} else {
		console.log('error, current tab url is null');
	}
}


function getFriendsCommentsFromUrl(tabUrl){
	if(tabUrl != null){
		var currentTabUrl= tabUrl;
		var JSESSIONID = localStorage.JSESSIONID;
		
		var url = "http://gliiim.outsidethecircle.eu/plugin/comment/getFromUrlAndFriends";
		var data = { JSESSIONID : JSESSIONID, tabUrl : currentTabUrl};
		
		gliiimAjaxCall(url, data, updateCommentsCallbackForFriends);
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

	var result = gliiimAlias.parseJSON(JSON.stringify(data));
		
	var comments = null;
	if(result.status == "success"){
		
		console.log("updateCommentsCallback result success");
		
		comments = result.content.comments[0];
		var table = gliiimAlias('<table></table>').addClass('gliiim-' + scope + '-comments'); 
		var l = 0;
		try { 
			var l = comments.length;
		}catch(e){}
		if(l==0){
			console.log("no comments found");
			gliiimAlias("#gliiim-" + scope + "-no-comments").show();
			gliiimAlias("#gliiim-" + scope + "-comments-txt").hide();
		}
		console.log("comments found : " + l);
		for(var i = 0; i < l; i++){
			var comment = comments[i];
			var row = null;
			console.log("comment : " + JSON.stringify(comment));
			console.log("comment.type : " + comment.type);
			if(comment.type == '0'){ //image
				row = gliiimAlias('<tr></tr>').text("image comment with id " + comment.id);
			}else if(comment.type == '1'){ //text
				row = gliiimAlias('<tr></tr>').text("text comment with id " + comment.id);
			}else if(comment.type == '2'){ //sound
				row = gliiimAlias('<tr></tr>').text("sound comment with id " + comment.id);
			}
			table.append(row);
		}
		gliiimAlias("#gliiim-" + scope + "-comments-table").append(table);
	} else { 
		console.log("error while getting comment history");
	}
}