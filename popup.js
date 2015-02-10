var size='200x200';
var qrCodeGeneratorUrl = 'http://api.qrserver.com/v1/create-qr-code/?size=' + size + '&data=';
var currentPageUrl;

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
		
		var id;
		
		console.log('provider : ' + provider);
		
		if(provider == "youtube") {
			console.log(url.match(/https?:\/\/(?:www.)?(\w*).(com|fr)\/.*v=(\w*)/));
			
			id = url.match(/https?:\/\/(?:www.)?(\w*).(com|fr)\/.*v=(\w*)/)[3];
			if(id.length > 0){
				gootAlias('#dropdown-menu-a').prepend('<li><a href="#" id="showYoutubePreviewButton">Show preview</a></li><li class="divider"></li>');
				document.getElementById('contentType').innerHTML = '<a href="#" id="showYoutubePreviewLink">Check phone rendering</a>';
				gootAlias('#showYoutubePreviewButton').click(function(){
					showPreview("youtube",id);
				});
				gootAlias('#showYoutubePreviewLink').click(function(){
					showPreview("youtube",id);
				});
				gootAlias('#closePreview').click(function(){
					closePreview("youtube");
				});
			}
		} else if (provider == "vimeo") {
			id = url.match(/https?:\/\/(?:www.)?(\w*).com\/(\d*)/)[2];
			document.getElementById('contentType').innerHTML = "Vimeo content detected";
		} else if (url.match("^http://goot.outsidethecircle.eu")) {
			document.getElementById('contentType').innerHTML = "Shareception spotted !";
			console.log("Shareception spotted !");  
		} else {
			console.log("No special format url detected");    
		}
		return {
			provider : provider,
			id : id
		}
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
		gootAlias('.ytpreview').slideDown()
		document.getElementById('preview').innerHTML = "<iframe id='ytplayer' type='text/html' width='640' height='390' src='http://www.youtube.com/embed/" + id + "?autoplay=1' frameborder='0'/>";
		gootAlias('html, body').animate({
		   scrollTop: gootAlias("#ytplayer").offset().top
		}, 2000);
	}

}

function closePreview(contentType){
	if(contentType == 'youtube'){
		gootAlias('.ytpreview').slideUp();
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
gootAlias(document).ready(function(){
	console.log("initial load on document ready");	 
	
	gootAlias("#share-fb-btn").hide();
	gootAlias("#add-goot-btn").hide();
	gootAlias("#record-comment-btn").hide();
	

	if(localStorage.accessToken){
		gootAlias("#share-fb-btn").show();
		gootAlias("#add-goot-btn").show();
		gootAlias("#record-comment-btn").show();
	} else if(localStorage.JSESSSIONID){
		gootAlias("#add-goot-btn").show();
		gootAlias("#record-comment-btn").show();
	}

	// disconnect button
	gootAlias("#disconnect_btn").click(function(){
		localStorage.removeItem('accessToken');
		localStorage.removeItem('JSESSSIONID');
		
		gootAlias("#share-fb-btn").hide();
		gootAlias("#add-goot-btn").hide();
		gootAlias("#record-comment-btn").hide();
		
		
		gootAlias('#fb_btn').show();
		gootAlias('#sub-menu-login-goot').show();
		gootAlias('#sub-menu-login-fb').show();
		
		alert('You\'ve been disconnected');
	});
	
	//Add all scripts necessary to add comments
	gootAlias("#record-comment-btn").click(function(){		
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
	
		// Method to create an invoice but don't start autopolling on it. 
	gootAlias('#connect_btn').click(function(){
		ajaxConnect();
	});	
	
});


function ajaxConnect(){

	var username = gootAlias('#username').val();
	var password = gootAlias('#password').val();

	var data = { username: username, password: password };
	var url = "http://goot.outsidethecircle.eu/plugin/connect";
	
	gootAjaxCall(url, data, connectionCallback);
}


function connectionCallback(data){ 
	if(data.responseText != "error"){
		//add JSESSIONID in localStorage
		localStorage.JSESSIONID = data.responseText;
		//add JSESSIONID in the cookie
		document.cookie="JSESSIONID=" + localStorage.JSESSIONID;
		
		gootAlias('#fb_btn').hide();
		gootAlias('#sub-menu-login-goot').hide();
		gootAlias('#sub-menu-login-fb').hide();
		
		//we should get user infos from server here
	} else {
		//connection failed
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

