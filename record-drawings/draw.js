/*jslint bitwise:false */
/*globals getUrl picker bind Picker Shape pointsFromEv */
// GOGGLES
function Drawings(ajaxroot) {
  // Here is our drawings object.

  this.canvas = gootAlias("<canvas>").css({
    position: "fixed",
    "z-index": "100000",
    top: "100",
    left: "0",
    "pointer-events": "auto"
  }).appendTo(gootAlias("#goot_color_picker"))[0];
  //}).appendTo(document.body)[0];

    	
  this.url = getUrl(); //url from the tab page
  this.serverUrl = ajaxroot; //url from the server 

  this.ctx = this.canvas.getContext('2d');

  this.shapes = null;
  // the list of shapes to draw.

  this.waitingShapes = [];
  // the list of shapes we've sent to the server but haven't heard back about.

  this.active = true;
  // used to find out whether we've stopped or not

  this.historyStream = null;

  // Center coordinate
  // Guess at where the text probably is
  this.centerCoordX = 0;
  this.centerCoordY = 0;
  // Color picker
  this.curColor = {r:0,g:0,b:0};
  this.curBrushSize = 5;
  this.picker = new Picker(bind(this,function(color){
      this.curColor = color;
    }), bind(this,function(size){
      this.curBrushSize = size;
    }));

  // Events
  this.canvas.oncontextmenu = function(){ return false; };
  this.canvas.onmousedown = bind(this, function(ev) {
      if (ev.button & 2) {
        this.beginErasing(ev);
      } else {
        this.beginDrawing(ev);
      }
      return false;
    });

  // Window resize and scroll handlers
  this.resizeTimer = null;
  window.onresize = bind(this, function() {
    // Resize later
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(bind(this, this.resizeCanvas), 100);
  });
  window.onscroll = bind(this, this.redraw);
  this.resizeCanvas();
  
  // And connect
  //this.connect(bind(this, function(){
      this.picker.show();
    //}));
}

Drawings.prototype.stop = function() {
  // Destroy a drawings object with optional callback
  this.active = false;
  this.picker.del();
  window.onresize = null;
  window.onscroll = null;
  if (this.historyStream) {
    this.historyStream.stop();
  }
  clearTimeout(this.resizeTimer);
  gootAlias(this.canvas).fadeOut('fast', bind(this, function() {
      gootAlias(this.canvas).remove();
    }));
};
Drawings.prototype.transform = function(p) {
  // Point transformation functions
  // Establish a new coordinate system. (0, 0) is at the top MIDDLE of
  // the page, +x is right and -x is left.
  // This accomodates pages that have fixed-width or centered layouts.
  // todo: actually I would really like this to be relative to either
  // the left of the content or the middle of the page.
  //
  // Given an absolute point in our new coordinate system, return the
  // point's position on the screen
  return [
    p[0]-window.scrollX + this.centerCoordX,
    p[1]-window.scrollY + this.centerCoordY
  ];
};
Drawings.prototype.untransform = function(p) {
  // Given an point wrt the screen, return the point's absolute position
  // wrt our coordinate system
//  console.log("centerCoordX : " + this.centerCoordX);
//  console.log('X coordinate : ' +  p[0]+window.scrollX - this.centerCoordX);
//  console.log('Y coordinate : ' +  p[1]+window.scrollY);
  
  return [
    p[0]+window.scrollX - this.centerCoordX,
    p[1]+window.scrollY - this.centerCoordY
  ];
};
Drawings.prototype.recalculateCenter = function() {
  // this calculates what X-coordinate will be the 'focus' of our web
  // page.
  //
  // essentially, we want our x=0 coordinate to be the left edge of the
  // content. this works reasonably well in practice except for
  // dynamically generated things and line wrapping.

  this.centerCoordX = (
//    (gootAlias("#header").offset() || {left:0}).left ||
//    (gootAlias(".header").offset() || {left:0}).left ||
//    (gootAlias(".inner").offset()  || {left:0}).left ||
//    (gootAlias(".content").offset()|| {left:0}).left ||
//    (gootAlias("#content").offset()|| {left:0}).left ||
//
//    // hackernews
//    (gootAlias("body>center>table").offset()||{left: 0}).left ||
//    // table-based layouts
//    (gootAlias("body>table").offset()||{left: 0}).left ||
//
//    // gogole results pages
//    (gootAlias("#center_col").offset()||{left:0}).left ||
//
//    (this.canvas.width/2)
		  0
  
  );
  
  this.centerCoordY = 145;
};


//Connection to server
Drawings.prototype.connect = function(cb) {
  // Initial connection from the server.
  cb = cb || function(){};
  var self = this;
  
  ajaxRequest(this.serverUrl, {
      page: this.url
    }, function(json) {
      if (json.err) {
        alert(json.err);
        return self.stop();
      }
      if (self.active) {
        // collect things
        self.shapes = json.shapes.map(Shape.fromJSON);
        self.redraw();
        cb();
        self.historyStream = new StreamingHistory(self.serverUrl, {page: self.url},
          json.nextUpdate,
          function(event) {
            if (event.add_shape) {
              var shape = Shape.fromJSON(event.add_shape);
              self.shapes.push(shape);
              deleteShape(self.waitingShapes, shape);
              self.redraw();
            } else if (event.delete_shape) {
              deleteShapeWithID(self.shapes, parseInt(event.delete_shape, 10));
              self.redraw();
            }
          });
      }
    });
};

Drawings.prototype.sendShape = function(shape) {
  // todo: find a way of telling that we couldn't send the shape and
  // recovering
  var self = this;
  ajaxRequest(this.serverUrl, {
      page: this.url, add: 't',
      r: shape.r, g:shape.g, b:shape.b, a:shape.a,t:shape.t,
      p:shape.serializePoints()},
    function(data){
      if (data && data.err) {
        alert("There was a problem sending the shapes to the server.");
        self.stop();
      }
    });
};

Drawings.prototype.sendDeleteShape = function(shape) {
  // todo: find a way of telling that we couldn't erase the shape and
  // recovering
  var self = this;
  if (shape.id === null) { return; }
  ajaxRequest(this.serverUrl, {
      page: this.url, del: 't',
      id: shape.id},
    function(data){
      if (data && data.err) {
        alert("There was a problem deleting the shape.");
        self.stop();
      }
    });
};





//canvas-rendering.js
/*globals Drawings */
//Drawing functions
Drawings.prototype.redraw = function() {
	console.log("redraw");
	// Redraw entire canvas
	if (this.shapes === null) {
	 this.drawLoading();
	} else {
	 var ctx = this.ctx;
	 // clear
	 this.resetCanvasXform();
	 console.log('this.shapes : ' + this.shapes);
	 var toDraw = this.shapes.concat(this.waitingShapes);
	 for (var i=0,l=toDraw.length; i<l; i++) {
	   var bb = toDraw[i].boundingBox();
	   // clip invisible shapes
	   if (bb.right - window.scrollX + this.centerCoordX > 0 &&
	       bb.left - window.scrollX + this.centerCoordX < this.canvas.width &&
	       bb.bottom - window.scrollY + this.centerCoordY > 0 &&
	       bb.top - window.scrollY + this.centerCoordY < this.canvas.height) {
		   console.log("toDraw[i] : " + toDraw[i]);
	     toDraw[i].draw(ctx);
	   }
	 }
	}
};


Drawings.prototype.resetCanvasXform = function() {
	this.ctx.setTransform(1,0,
	                     0,1,  0, 0);
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.setTransform(1,0,
	                     0,1,
	 this.centerCoordX-window.scrollX,
	 this.centerCoordY-window.scrollY);
};


Drawings.prototype.resizeCanvas = function() {
	// Fix the canvas when resized
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	this.recalculateCenter();
	this.redraw();
};

//Loading... screen
Drawings.prototype.drawLoading = function() {
	this.ctx.setTransform(1,0,
	                     0,1,  0, 0);
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	//this.ctx.fillStyle = "rgba(128,128,128,0.2)";
	this.ctx.fillStyle = "rgba(128,128,128,0)";
	this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
};











//Mouse drawing
/*globals Drawings getUrl picker bind Picker Shape pointsFromEv */
//Handles drawing shapes with the MOUSE.

Drawings.prototype.beginErasing = function(ev) {
// Begin erasing shapes until the mouse button is released.
var mdhandler = this.canvas.onmousedown;
if (this.shapes !== null) {
 // Erase
 var curpoint = this.untransform(pointsFromEv(ev));
 this.canvas.onmousedown = null;
 this.canvas.onmouseup = bind(this, function(ev) {
     this.canvas.onmousemove = null;
     this.canvas.onmouseup = null;
     this.canvas.onmousedown = bind(this, mdhandler);
 });
 this.canvas.onmousemove = bind(this, function(ev) {
     var newpoint = this.untransform(pointsFromEv(ev)),
         removedAShape = false;
     for (var i=0,l=this.shapes.length; i<l; i++) {
       if (this.shapes[i].pointIntersects(newpoint, this.curBrushSize/2) ||
           this.shapes[i].lineIntersects(curpoint, newpoint)) {
         // delete them
         // todo: we don't want to  KEEP the shape but at the same time we
         // also don't want to DISCARD the shape before we know it's been
         // erased.
         // so for now we'll just be sneaky! >:D
         this.sendDeleteShape(this.shapes[i]);
         this.shapes.splice(this.shapes.indexOf(this.shapes[i]), 1);
         i--;
         l--;
         removedAShape = true;
       }
     }
     if (removedAShape) {
       this.redraw();
     }
     curpoint = newpoint;
 });
}
};

Drawings.prototype.beginDrawing = function(ev){
// Begin drawing a shape until the mouse button is released
	
console.log("begin drawing now...");
var mdhandler = this.canvas.onmousedown,
   self = this,
   curshape;

function makeShape() {
 curshape = new Shape(self.curBrushSize, self.curColor.r,self.curColor.g,self.curColor.b,1);
 self.waitingShapes.push(curshape); // add to our list of shapes we're waiting on
}

function finishShape() {
 curshape.simplifyInPlace();
 if (curshape.p.length>=2) {
   self.sendShape(curshape);
 }
 //console.log(curshape);
 //self.redraw();
}

//TODO : uncomment
//if (this.shapes !== null) {
 makeShape();
 curshape.appendPoint(this.untransform(pointsFromEv(ev)));
 this.canvas.onmousedown = null;
 this.canvas.onmouseup = bind(this, function(ev) {
     finishShape(curshape);
     this.canvas.onmousemove = null;
     this.canvas.onmouseup = null;
     this.canvas.onmousedown = bind(this, mdhandler);
 });
 this.canvas.onmousemove = bind(this, function(ev) {
     curshape.appendPoint(this.untransform(pointsFromEv(ev)));
     if (curshape.p.length >= 1000) {
       //curshape.simplifyInPlace();
       finishShape(curshape);
       makeShape();
       curshape.appendPoint(this.untransform(pointsFromEv(ev)));
     }
     curshape.drawLast(this.ctx);
 });
//}
};

