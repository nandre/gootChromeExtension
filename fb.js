		
function displayUser(user) {
	if(user && (user.first_name != null)){
		$('#fb_btn').hide();
		$('#sub-menu-login-goot').hide();
		$('#disconnect_btn').show();
		$('#sub-menu-login-fb').append('<p style="color : white;">Hi ' + user.first_name + '!</p>');
	} else {
		// session lost on fb
		localStorage.removeItem('accessToken');
	}
	
    console.log(user);
}

$(document).ready(function(){
	
	    if (localStorage.accessToken) {
			//in this case, user is connected with facebook
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
			