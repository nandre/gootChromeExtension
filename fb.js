var gliiimAlias = jQuery.noConflict();

function displayUser(user) {
	if(user && (user.first_name != null)){
		gliiimAlias('#fb_btn').hide();
		gliiimAlias('#sub-menu-login-all').hide();
		gliiimAlias('#disconnect_btn').show();
		gliiimAlias('#gliiim-hi').append('<p style="color : white;">Hi ' + user.first_name + '!</p>');
		gliiimAlias('#gliiim-connect-zone-btn').hide();
	} else {
		// session lost on fb
		localStorage.removeItem('accessToken');
	}
	
    console.log(user);
}

gliiimAlias(document).ready(function(){
	
	    if (localStorage.accessToken) {
			//in this case, user is connected with facebook
            var graphUrl = "https://graph.facebook.com/me?" + localStorage.accessToken + "&callback=displayUser";
            console.log(graphUrl);
 
            var script = document.createElement("script");
            script.src = graphUrl;
            document.body.appendChild(script);
        } else {
			//hide disconnection button 
			gliiimAlias('#disconnect_btn').hide();
		}

});
			