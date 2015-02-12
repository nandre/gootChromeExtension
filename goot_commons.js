//change jquery alias by brand new one for goot
var gootAlias = jQuery.noConflict();

function testInject(){
	console.log('injection done');
}

gootAlias(document).ready(function(){ testInject(); });


//ajax function with callback available in both extension and page
function gootAjaxCall(url, data, callback){ 
	
	gootAlias.ajax({
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