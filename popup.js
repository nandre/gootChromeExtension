var size='200x200';
var qrCodeGeneratorUrl = 'http://api.qrserver.com/v1/create-qr-code/?size=' + size + '&data=';
var currentPageUrl;

var menus = ["main", "comment", "share", "tower", "tuto", "friends"];


var QRCodeGenerator = {
      
   /**
	* Define different types of detected urls, 
	* adapt plugin behavior for each
    */
	isYoutubeLink_:false,
   
   /**********************/
   
	parseURL_:function(url) {
		console.log("url : " + url);
		
		var provider = '';
		try {
		  provider = url.match(/https?:\/\/(:?www.)?(\w*)/)[2];
		}
		catch(err)
		  {}
		
		var id = null;
		
		console.log('provider : ' + provider);
		
		if(provider == "youtube") {
			console.log(url.match(/https?:\/\/(?:www.)?(\w*).(com|fr)\/.*v=(\w*)/));
			
			id = url.match(/https?:\/\/(?:www.)?(\w*).(com|fr)\/.*v=(\w*)/)[3];
			if(id.length > 0){
				gliiimAlias('#dropdown-menu-a').prepend('<li><a href="#" id="showYoutubePreviewButton">Show preview</a></li><li class="divider"></li>');
				document.getElementById('contentType').innerHTML = '<a href="#" id="showYoutubePreviewLink">Youtube video detected</a>';
				gliiimAlias('#showYoutubePreviewButton').click(function(){
					showPreview("youtube",id);
				});
				gliiimAlias('#showYoutubePreviewLink').click(function(){
					showPreview("youtube",id);
				});
				gliiimAlias('#closePreview').click(function(){
					closePreview("youtube");
				});
			}
		} else if (provider == "vimeo") {
			id = url.match(/https?:\/\/(?:www.)?(\w*).com\/(\d*)/)[2];
			document.getElementById('contentType').innerHTML = "Vimeo content detected";
		} else if (url.match("^http://gliiim.outsidethecircle.eu")) {
			document.getElementById('contentType').innerHTML = "Shareception spotted !";
			console.log("Shareception spotted !");  
		} else {
			console.log("No special format url detected");    
		}
		return {
			provider : provider,
			id : id
		};
	},
	
	

  /**
  * Set public current page url var
  * @private
  */
  setCurrentPageUrl_: function(tabUrl){
	currentPageUrl = tabUrl;
  },
	
	
	
  /**
   * Create full url for QRCode
   *
   * @return {string} Complete QRCode url for image
   * @private
   */
  constructQRCodeURL_: function (tabUrl) {
	this.setCurrentPageUrl_(tabUrl);
	console.log(currentPageUrl);
	
    return (qrCodeGeneratorUrl + currentPageUrl);
  },
  

  /**
   * Show Image in main page
   *
   * @public
   */
  showQRCode: function(tabUrl) {
	document.getElementById('QRCodeImage').src = this.constructQRCodeURL_(tabUrl);
	gliiimAlias("#QRCodeImage").show();
	this.parseURL_(tabUrl);
  },

  

};


/**
* Show main QRCode processing.
* This function is synchronous as it's waiting for chrome.tabs.getSelected() function to 
* set currentPageUrl variable.
* @public
*/
function synchronousShowQRCode(tabUrl){
	QRCodeGenerator.showQRCode(tabUrl);
}



/**
* Show preview for detected content
* @public
*/
function showPreview(contentType,id){
	console.log('ShowPreview function called');
	
	if(contentType == 'youtube'){
		gliiimAlias('.ytpreview').slideDown();
		document.getElementById('preview').innerHTML = "<iframe id='ytplayer' type='text/html' width='640' height='390' src='http://www.youtube.com/embed/" + id + "?autoplay=1' frameborder='0'/>";
		gliiimAlias('html, body').animate({
		   scrollTop: gliiimAlias("#ytplayer").offset().top
		}, 2000);
	}

}

function closePreview(contentType){
	if(contentType == 'youtube'){
		gliiimAlias('.ytpreview').slideUp();
		document.getElementById('preview').innerHTML = "";
	}
}

// Run QRCode generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
		/* chrome functions are asynchronous, that's why it should call a function and not set the variable inside */
		chrome.tabs.getSelected(null, function(tab) {
			synchronousShowQRCode(tab.url);
		});
  
});


// Initial state at beginning
gliiimAlias(document).ready(function(){
	console.log("initial load on document ready");	 
	
	gliiimAlias("#share-fb-btn").hide();
	gliiimAlias("#add-gliiim-btn").hide();
	gliiimAlias("#record-comment-btn").hide();

	//new ones, after rebranding 
	gliiimAlias("#gliiim-main-menu-btn").hide();
	gliiimAlias("#gliiim-menu-options").hide();

	
	if(localStorage.accessToken){
		//user connected via facebook
		gliiimAlias("#share-fb-btn").show();
		gliiimAlias("#add-gliiim-btn").show();
		gliiimAlias("#record-comment-btn").show();
		gliiimAlias("#gliiim-main-menu-btn").show();
	} else if(localStorage.JSESSSIONID){
		//user connected via gliiim
		gliiimAlias("#add-gliiim-btn").show();
		gliiimAlias("#record-comment-btn").show();
		gliiimAlias("#gliiim-main-menu-btn").show();
	}

	// disconnect button
	gliiimAlias("#disconnect_btn").click(function(){
		localStorage.removeItem('accessToken');
		localStorage.removeItem('JSESSSIONID');
		
		gliiimAlias("#share-fb-btn").hide();
		gliiimAlias("#add-gliiim-btn").hide();
		gliiimAlias("#record-comment-btn").hide();
		gliiimAlias("#gliiim-menu-options").hide();
		
		gliiimAlias('#fb_btn').show();
		gliiimAlias('#sub-menu-login-all').show();
		gliiimAlias('#gliiim-connect-zone-btn').fadeIn();
		
		gliiimAlias('#gliiim-main-menu-btn').hide();
		gliiimAlias('#disconnect_btn').hide();
		
		alert('You\'ve been disconnected');
	});
	
	//Add all scripts necessary to add comments
	gliiimAlias("#record-comment-btn").click(function(){		
		// same action as contextual menu, add record comment menu to page
		chrome.tabs.executeScript(null, {file: "record-comments/record.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/ajax.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/canvas-rendering.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/draw.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/drawings.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/jscolor.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/mouse-drawing.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/picker.js"});
		chrome.tabs.executeScript(null, {file: "record-drawings/shapes.js"});
	});	
	
	gliiimAlias('#gliiim-connect-zone-btn').click(function(){
		  if ( gliiimAlias('#sub-menu-login-all').is(":hidden")) {
			  	gliiimAlias('#sub-menu-login-all').slideDown( "slow" );
			  } else {
				gliiimAlias('#sub-menu-login-all').fadeOut();
			  }
	});
	
	// Method to create an invoice but don't start autopolling on it. 
	gliiimAlias('#connect_btn').click(function(){
		ajaxConnect();
	});	
	
	
	// could be done by looping on menus
	gliiimAlias('#gliiim-tuto-menu-btn').click(function(){
		toggleTutoMenu();
	});	
	
	gliiimAlias('#gliiim-tower-menu-btn').click(function(){
		toggleTowerMenu();
	});	
	
	gliiimAlias('#gliiim-share-menu-btn').click(function(){
		toggleShareMenu();
	});	
	
	gliiimAlias('#gliiim-comment-menu-btn').click(function(){
		toggleCommentMenu();
	});	
	
	gliiimAlias('#gliiim-main-menu-btn').click(function(){
		toggleMainMenu();
	});	
	
	gliiimAlias("#gliiim-link-send-friend").click(function(){
		goToFriendsPageFromSharePage();
	});
	
	
});

function hideAllButSelectedMenu(selectedMenu){
		
	var l = menus.length;
	
	if(gliiimAlias("#gliiim-" + selectedMenu +"-menu").is(":hidden")){
		//make sure connection menu is hidden
		gliiimAlias("#sub-menu-login-all").fadeOut();
		//hide connection/disconnection bar if not hidden
		gliiimAlias("#gliiim-topbar-connection").slideUp();
		
		var hiddingMenuCounter = 0;
		 
		for(var i = 0; i < l; i++) {
		    var menu = menus[i];
		   
		    try {
		    	gliiimAlias("#gliiim-" + menu + "-menu").fadeOut(100,function(){ 
			    	gliiimAlias("#gliiim-menu-contextual-" + menu).hide("slide", { direction: "right" }, 500, function(){
			    		hiddingMenuCounter = hiddingMenuCounter + 1;
						if(hiddingMenuCounter >= l-3){
							gliiimAlias("#gliiim-menu-options").hide("slide", { direction: "right" }, 500, function(){
								gliiimAlias("#gliiim-menu-contextual-" + selectedMenu).show("slide", { direction: "right" }, 500);
							});
						}
			    });
			   });
		    }catch(e){}
		}
		
		//show the proprer context bar
		//display content for selectedMenu
		gliiimAlias("#gliiim-" + selectedMenu + "-menu").slideDown();
	} else {
		gliiimAlias("#gliiim-topbar-connection").slideUp();
		gliiimAlias("#gliiim-" + selectedMenu + "-menu").slideUp();
		gliiimAlias("#gliiim-menu-contextual-" + selectedMenu).hide("slide", { direction: "right" }, 500);
	}
}

function toggleTutoMenu(){
	hideAllButSelectedMenu("tuto");
}

function toggleTowerMenu(){
	hideAllButSelectedMenu("tower");
}

function toggleShareMenu(){
	hideAllButSelectedMenu("share");
}

function toggleCommentMenu(){ 
	hideAllButSelectedMenu("comment");
}

function goToFriendsPageFromSharePage(){
	gliiimAlias("#gliiim-share-menu").fadeOut(100, function(){
		gliiimAlias("#gliiim-friends-menu").fadeIn();
	});
	
}

function toggleMainMenu(){ 
	var l = menus.length;
	
	if(gliiimAlias("#gliiim-menu-options").is(":hidden")){
		gliiimAlias("#sub-menu-login-all").fadeOut();
		gliiimAlias("#gliiim-topbar-connection").slideUp();

		var hiddingMenuCounter = 0;
		 
		for(var i = 0; i < l; i++) {
		    var menu = menus[i];
		   
		    try {
		    	gliiimAlias("#gliiim-" + menu + "-menu").fadeOut();
		    	gliiimAlias("#gliiim-menu-contextual-" + menu).hide("slide", { direction: "right" }, 500, function(){
		    		hiddingMenuCounter = hiddingMenuCounter + 1;
					if(hiddingMenuCounter >= l-3){
						gliiimAlias("#gliiim-menu-options").show("slide", { direction: "right" }, 500);
					}
		    	});
		    }catch(e){}
		}
		
		
	} else {
		gliiimAlias("#gliiim-menu-options").hide("slide", { direction: "right" }, 500, function(){
			for(var i = 0; i < l; i++) {
			    var menu = menus[i];
			    try {
			    	gliiimAlias("#gliiim-" + menu +"-menu").fadeOut();
			    }catch(e){}
			}
			gliiimAlias("#gliiim-topbar-connection").show("slide", { direction: "up" }, 500);

		});
	}
		

}


function ajaxConnect(){

	var username = gliiimAlias('#username').val();
	var password = gliiimAlias('#password').val();

	var data = { username: username, password: password };
	var url = "http://gliiim.outsidethecircle.eu/plugin/connect";
	
	gliiimAjaxCall(url, data, connectionCallback);
}


function connectionCallback(data){
	
	var result = gliiimAlias.parseJSON(JSON.stringify(data));
	
	if(result.status == "success"){
		
		alert('Connection done ! ');
		//add JSESSIONID in localStorage
		localStorage.JSESSIONID = result.content.sessionId;
		//add JSESSIONID in the cookie
		document.cookie="JSESSIONID=" + localStorage.JSESSIONID;
		
		var firstName = result.content.firstName;
		displayGliiimUser(firstName);
		
		//we should get user infos from server here
	} else {
		alert("Connection failed.");
		//connection failed
	}
}

function displayGliiimUser(firstName) {
	if(firstName != null){
		gliiimAlias('#fb_btn').hide();
		gliiimAlias('#sub-menu-login-all').hide();
		gliiimAlias('#disconnect_btn').show();
		gliiimAlias('#gliiim-hi').append('<p style="color : white;">Hi ' + firstName + '!</p>');
		gliiimAlias('#gliiim-connect-zone-btn').hide();
	} else {
		// session lost on Gliiim
		localStorage.removeItem('JSESSIONID');
	}

}


//This function has been replaced by the event in background.js
function injectScriptIntoPage(scriptPath){ 
	var s = document.createElement('script');
	s.src = chrome.extension.getURL(scriptPath);
	s.onload = function() {
	    this.parentNode.removeChild(this);
	};
	(document.head||document.documentElement).appendChild(s);
}

