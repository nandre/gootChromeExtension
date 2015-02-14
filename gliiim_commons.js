//change jquery alias by brand new one for gliiim
var gliiimAlias = jQuery.noConflict();

function testInject(){
	console.log('injection done');
}

gliiimAlias(document).ready(function(){ testInject(); });


//ajax function with callback available in both extension and page
function gliiimAjaxCall(url, data, callback){ 
	
	gliiimAlias.ajax({
		url: url,
		dataType: 'json',
		type:"POST",
		contentType: 'application/json',
		crossDomain: true,
		xhrFields: {
		    withCredentials: true
		},
		data: JSON.stringify(data),
		error: function(data) {
				callback(data);
		}, 
		success:function(data){
				callback(data);
		}
	});
	
}