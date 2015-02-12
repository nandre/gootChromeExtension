//this file has to be injected after all other javascript dependencies
function init_drawings() {

jQuery.noConflict();

(function($){
  if (window.drawings && window.drawings.active) {
    window.drawings.stop(); 
    window.drawings = null; 
    return;
  }

  /*globals Drawings */
  window.drawings = new Drawings(window.serverURL);
  
})(jQuery);}



//Utility functions
//function to add a callback action to a function
function bind(bindee, action) {
return function() {
  return action.apply(bindee, Array.prototype.slice.call(arguments));
};
}

//returns the coordinates of the element clicked
function pointsFromEv(ev) {
// given an event object, return the point's XY coordinates relative to the screen
//	if ('clientX' in ev) { // Firefox
//	  return [ev.clientX, ev.clientY];
//	} else if ('offsetX' in ev) { // Opera
//	  return [ev.offsetX, ev.offsetY];
//	}
	
	return [ev.pageX, ev.pageY];
	
}

function getUrl() {

	  var l = document.location,
	  base = l.protocol+"//"+l.host+"/"+l.pathname;
	  
	  return base;
}

