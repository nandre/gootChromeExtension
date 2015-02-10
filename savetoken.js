
alert('You are now connected with your facebook account');

window.addEventListener("message", function(event) {
	console.log('Plugin event listener running...');

    // We only accept messages from our extension (security check)
    if (event.source != window)
      return;

    console.log("event.data.type : " + event.data.type);
    
    if (event.data.type && (event.data.type == "GOOT_PAGE_TYPE")) {
      console.log("accessToken passed by content script : " + event.data.accessToken);
      console.log("JSESSIONID passed by content script : " + event.data.JSESSIONID);
	  console.log("All data passed : " + event.data);
	  
	   var payload = {
		accessToken: event.data.accessToken,    // Pass the access token in a payload
		JSESSIONID: event.data.JSESSIONID		// Pass the JSESSIONID in the payload
	  };
	  //we send the received message to the chrome extension
	  chrome.extension.sendRequest(payload, function(response) {});
	  window.close();
	  //We could just do window.close() in the setTimeout method but using window.open and then window.close also works on IE and FF	
	  //setTimeout(function(){var ww = window.open(window.location, '_self'); ww.close(); }, 2000);
    }
}, false);
