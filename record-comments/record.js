navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
window.URL = window.URL || window.webkitURL;

window.serverURL = "http://gliiim.outsidethecircle.eu/";

var gliiimAlias = jQuery.noConflict();

var app = null;
var video = null; 
var localMediaStream = null;
var canvas = null;
var effect = null; 
var gallery = null; 
var ctx = null; 
var intervalId = null;
var idx = 0;

//var to set id to saved images
var snapshotIncrementalId = 0;

var accessToken;
var JSESSIONID;

var filters = [
  'grayscale',
  'sepia',
  'blur',
  'brightness',
  'contrast',
  'hue-rotate', 'hue-rotate2', 'hue-rotate3',
  'saturate',
  'invert',
  ''
];

function changeFilter(el) {
  el.className = '';
  var effect = filters[idx++ % filters.length];
  if (effect) {
    el.classList.add(effect);
  }
}

function gotStream(stream) {
  console.log("stream video...");
  localMediaStream = stream;
  
  if (window.URL) {
	console.log("...on standard browser");
	console.log("Url to stream : " + window.URL.createObjectURL(stream));
    video.attr("src", window.URL.createObjectURL(stream));
    video.load();
  } else {
	console.log("...on Opera");
    video.src = stream; // Opera.
  }
  
  video.onerror = function(e) {
	console.log("error on streaming video");
    stream.stop();
  };

  stream.onended = noStream;

  video.onloadedmetadata = function(e) { //won't fire on chrome...
	  gliiimAlias('#splash').hide();
	  gliiimAlias('#gliiim-app-video').show();
  };

  // Since video.onloadedmetadata isn't firing for getUserMedia video, we have
  // to fake it.
  setTimeout(function() {
	console.log('show video');
    gliiimAlias('#splash').hide();
    gliiimAlias('#gliiim-app-video').show();
  }, 50);
}

function noStream(e) {
  var msg = 'No camera available.';
  if (e.code == 1) {
    msg = 'User denied access to use camera.';
  }
  document.getElementById('errorMessage').textContent = msg;
}

function capture() {

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    return;
  }

  intervalId = setInterval(function() {
    ctx.drawImage(video, 0, 0);
    var img = document.createElement('img');
    img.src = canvas.toDataURL('image/webp');

    var angle = Math.floor(Math.random() * 36);
    var sign = Math.floor(Math.random() * 2) ? 1 : -1;
    img.style.webkitTransform = 'rotateZ(' + (sign * angle) + 'deg)';

    var maxLeft = document.body.clientWidth;
    var maxTop = document.body.clientHeight;

    img.style.top = Math.floor(Math.random() * maxTop) + 'px';
    img.style.left = Math.floor(Math.random() * maxLeft) + 'px';

    gallery.appendChild(img);
  }, 150);
}

function snapshot() {
	console.log('snapshot called...');
    if (localMediaStream) {
   	  var tmpVideo = document.querySelector('video');
   	  var ratio;
   	  var w = null;
   	  var h = null;
   	  var divideBy = 3;
   	  
			// Calculate the ratio of the video's width to height
			ratio = tmpVideo.videoWidth / tmpVideo.videoHeight;
			//value set in the css
			h = parseInt(150/divideBy, 10);
			//calculate considering the ratio
			w = parseInt(h * ratio, 10);
			
			console.log("w : " + w);
			console.log("h : " + h);
			
			// Set the canvas width and height to the values just calculated
		    canvas[0].width = w;
			canvas[0].height = h;	
			  
		    ctx.fillRect(0, 0, w, h);
			// Grab the image from the video
		    ctx.drawImage(tmpVideo, 0, 0, w, h);
			  
		    // "image/webp" works in Chrome.
		    // Other browsers will fall back to image/png.
		    
//		    gliiimAlias("#gliiim-snapshot").width(w); // Units are assumed to be pixels
		    var url = canvas[0].toDataURL('image/png');
		    var newImg = document.createElement("img"); // create img tag
		    newImg.src = url;
		    newImg.setAttribute("id", "snapshot_" + snapshotIncrementalId);
		    newImg.setAttribute("class", "snapshot_image");

		    newImg.onclick = function(){
		    	gliiimAlias('.gliiim_selected').removeClass('gliiim_selected_gliiim');
		    	gliiimAlias(this).addClass('gliiim_selected');
		    	gliiimAlias('#add-image-comment-btn').show();
		    	gliiimAlias('#imageToSave').val(gliiimAlias(this).attr('src'));
		    };
		    
		    snapshotIncrementalId += 1;

		    gliiimAlias("#gliiim-snapshot").prepend(newImg);

    }
  }

function init_camera(el) {
  console.log("init camera triggered");
  if (!navigator.getUserMedia) {
    document.getElementById('errorMessage').innerHTML = 'Sorry. <code>navigator.getUserMedia()</code> is not available.';
    return;
  }
  //el.onclick = capture; //to pop images up everywhere in the page
  navigator.getUserMedia({video: true}, gotStream, noStream);
 
  gliiimAlias("#init-camera-btn").hide();
  //associate action to take snapshots
  gliiimAlias("#gliiim-snapshot-btn").click(function(){ 
	  snapshot();
  });
  gliiimAlias("#gliiim-snapshot-btn").show();
  
}

/**
 * Add record bar menu into current tab page
 * @returns
 */
function addRecordBar(){
		gliiimAlias("body").prepend("<div id='gliiim_color_picker'></div>");
		
		gliiimAlias("body").prepend("<div id='gliiim_nav'></div>");
		
		var stickyNavTop = gliiimAlias('#gliiim_nav').offset().top;

		var stickyNav = function(){
			var scrollTop = gliiimAlias(window).scrollTop();
			     
			if (scrollTop > stickyNavTop) { 
			    gliiimAlias('#gliiim_nav').addClass('sticky');
			} else {
			    gliiimAlias('#gliiim_nav').removeClass('sticky'); 
			}
			
			if (scrollTop > stickyNavTop) { 
			    gliiimAlias('#gliiim_color_picker').addClass('sticky_picker');
			} else {
			    gliiimAlias('#gliiim_color_picker').removeClass('sticky_picker'); 
			}	
			
		};

		stickyNav();

		gliiimAlias(window).scroll(function() {
			stickyNav();
		});
		
		gliiimAlias("#gliiim_nav").load(chrome.extension.getURL("record-comments/record.html"), function(){
			initVars();
		});
		
}

/** Init variables 
 * 
 */
function initVars(){
	 app = gliiimAlias('#gliiim-app-video');
	 video = gliiimAlias('#monitor');
	 canvas = gliiimAlias('#photo');
	 effect = gliiimAlias('#effect');
	 gallery = gliiimAlias('#gallery');
	 ctx = canvas[0].getContext('2d');
	 
	 // get values from the extension 
	 chrome.runtime.sendMessage({method: "getLocalStorage", key: "JSESSIONID"}, function(response) {
		 console.log("localstorage data : " + response.data);
		 if(response.data != null && response.data != "null" && response.data != "undefined"){
			 JSESSIONID = response.data;
		 }
	 });
	 
	 // get values from the extension 
	 chrome.runtime.sendMessage({method: "getLocalStorage", key: "accessToken"}, function(response) {
		 console.log("localstorage data : " + response.data);
		 if(response.data != null && response.data != "null" && response.data != "undefined"){
			 accessToken = response.data;
		 }
	 });	 
	 
	gliiimAlias('#init-camera-btn').click(function(){ 
		console.log("init camera clicked");
		init_camera(this);
	});
	
	gliiimAlias('#monitor').click(function(){ 
		console.log("video monitor clicked");
		changeFilter(this);
	});
	
	gliiimAlias('#add-image-comment-btn').click(function(){ 
		console.log("save image comment button clicked");
		addImageCommentToPage();
	});
	
	
	gliiimAlias('#add-text-comment-btn').click(function(){ 
		console.log("save text comment button clicked");
		addTextCommentToPage();
	});
	
	
	gliiimAlias('#init-drawing-btn').click(function(){ 
		console.log("Draw on page button clicked");
		init_drawings();
	});
	
	
	
		
}

//INITIALIZATION OF COMMENTS RECORDING
gliiimAlias(document).ready(function(){
	addRecordBar();
});

window.addEventListener('keydown', function(e) {
  if (e.keyCode == 27) { // ESC
    document.querySelector('details').open = false;
  }
}, false);





function addImageCommentToPage(){

	var currentTabUrl = document.URL;
	document.cookie="JSESSIONID=" + JSESSIONID;
	
	var image = gliiimAlias('#imageToSave').val();
	console.log("current tab url : " + currentTabUrl);
	console.log("image blob : " + image);
	
	
	var data = { image : image, tabUrl : currentTabUrl};
	var url = "http://gliiim.outsidethecircle.eu/plugin/comment/image";
	
	gliiimAjaxCall(url, data, saveImageCallback);
}


function addTextCommentToPage(){

	var currentTabUrl = document.URL;
	document.cookie="JSESSIONID=" + JSESSIONID;
	
	var text = gliiimAlias('#text-comment').val();
	if(text == null || text.length == 0){
		alert("Please enter text comment");
		return;
	}
	
	console.log("current tab url : " + currentTabUrl);
	console.log("text : " + text);
	
	var data = { text : text, tabUrl : currentTabUrl};
	var url = "http://gliiim.outsidethecircle.eu/plugin/comment/text";
	
	gliiimAjaxCall(url, data, saveTextCallback);
	
}


//CALLBACK FUNCTIONS 
function saveTextCallback(data){
	var successMessage= 'Text comment added';
	var errorMessage = 'Adding text comment failed';
	
	saveCommentCallback(data,successMessage, errorMessage);
}

function saveImageCallback(data){
	var successMessage= 'Image comment added';
	var errorMessage = 'Adding image comment failed';
	
	saveCommentCallback(data,successMessage, errorMessage);
}

function saveCommentCallback(data, successMessage, errorMessage){
	if(data.responseText == "success"){					
		alert(successMessage);
	} else {
		alert(errorMessage);
	}
}