		
function displayUser(user) {
	$('#fb_btn').hide();
	$('#disconnect_btn').show();
	//$('#sub-menu-login').append('<p>' + user.first);
    console.log(user);
}

$(document).ready(function(){	
	    if (localStorage.accessToken) {
            var graphUrl = "https://graph.facebook.com/me?" + localStorage.accessToken + "&callback=displayUser";
            console.log(graphUrl);
 
            var script = document.createElement("script");
            script.src = graphUrl;
            document.body.appendChild(script);
        } else {
			//hide disconnection button 
			$('#disconnect_btn').hide();
		}

});
			