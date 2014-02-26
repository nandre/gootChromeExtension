
alert('You are now connected through your facebook account !');

window.addEventListener("message", function(event) {
	console.log('Plugin event listener running...');
    // We only accept messages from our extension (security check)
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
      console.log("accessToken passed by content script : " + event.data.accessToken);
	   var payload = {
		accessToken: event.data.accessToken    // Pass the access token in a payload
	  };
	  //we send the received message to the chrome extension
	  chrome.extension.sendRequest(payload, function(response) {});
	  window.close();
	  //We could just do window.close() in the setTimeout method but using window.open and then window.close also works on IE and FF	
	  //setTimeout(function(){var ww = window.open(window.location, '_self'); ww.close(); }, 2000);
    }
}, false);
