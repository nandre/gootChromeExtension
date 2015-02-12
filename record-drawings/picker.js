/*globals bind */

// Picker widget
function hex2rgb(hex) {
  if (hex.length==4) {
    return {r: parseInt(hex.substr(1,1),16)*17,
            g: parseInt(hex.substr(2,1),16)*17,
            b: parseInt(hex.substr(3,1),16)*17};
  } else if (hex.length==7) {
    return {r: parseInt(hex.substr(1,2),16),
            g: parseInt(hex.substr(3,2),16),
            b: parseInt(hex.substr(5,2),16)};
  } else {
    return {r:0,g:0,b:0};
  }
}


function Picker(onPickColor, onPickBrush) {
  var self = this;
  this.colorsJq = gootAlias("<div id='colorsJq-picker'>").css({
    position: "fixed",
    cursor: 'pointer',
    "z-index": "100001",
    top: "100",
    left: "0",
    width: "32px",
    border: 'solid 1px #000'
  });
  var chosenColor = gootAlias();
  // different brush colors!

  // A true color picker!
  var truecolorpicker = gootAlias("<div id='truecolorpicker'>").css({"background-color": "#fff",
                                        "background-image":
                                        "url(./img/color-picker.png)",
                                        "color": "#000",
                                        "line-height": '32px',
                                        'font-size': '300%',
                                        'text-align': 'center',
                                        width: 32, height: 32});
  var value_holder = gootAlias("<input>");
  function make_colorpicker_active(){
    var color = value_holder.get(0).value;
    truecolorpicker.css({"background-color":color});
    onPickColor(hex2rgb(color));
    chosenColor.text("");
    chosenColor = truecolorpicker;
    truecolorpicker.html("&bull;");
  }
  value_holder.change(make_colorpicker_active);
  this.jscp = new jscolor.color(value_holder.get(0));
  truecolorpicker.click(function(){
                          if (self.jscp.isVisible()) {
                            if (truecolorpicker == chosenColor) {
                              self.jscp.hidePicker();
                            } else {
                              make_colorpicker_active();
                            }
                          } else {
                            self.jscp.showPicker();
                          }
                        });
  truecolorpicker.appendTo(self.colorsJq);

  // A nice small palette for the rest of em!
  var colors = ["#000", "#fff", "#e50", "#fa0", "#1ba", "#e07", "#ab0"]
    .map(function(color) {
      var colorjq = gootAlias("<div id='colorjq-picker2'>").css({"background-color": color,
                                    'color': (color=="#000"?"#fff":"#000"),
                                    'line-height': '32px',
                                    'font-size': '300%',
                                    'text-align': 'center',
                                    width: 32, height: 32});
      colorjq.click(function(){
        if (colorjq == chosenColor) { return; }
          onPickColor(hex2rgb(color));
          chosenColor.text("");
          chosenColor = colorjq;
          colorjq.html("&bull;");
        });
      colorjq.appendTo(self.colorsJq);
      return colorjq;
    });
  colors[0].click();

  // different brush sizes!
  var chosenBrush = gootAlias();
  this.brushesJq = gootAlias("<div id='brushesjq-picker'>")
        .css({
            position: "fixed",
            cursor: 'pointer',
            "z-index": "100001",
            top: "100",
            left: "32px",
            'float': 'left',
            'background-color':'#fff',
            border: 'solid 1px #000',
            color:'#000',
            margin:0
          });
  var brushes = [1,2,5,10,15,20]
    .map(function(size) {
        var brushJq = gootAlias("<div id='brushjq-picker'>")
              .css({
                display: 'block',
                'float': 'left',
                width: "32px",
                padding:0,
                height: "32px"
              });
        brushJq.append(gootAlias("<div>")
            .css({
                position: "absolute",
                height: size+"px",
                'background-color': "#000",
                top: (16-size/2)+"px",
                width: "32px"
              }));
        brushJq.click(function(){
          if (brushJq == chosenBrush) { return; }
            onPickBrush(size);
            chosenBrush.css({'background-color': "#fff"});
            chosenBrush.find("div").css({'background-color': "#000"});
            chosenBrush = brushJq;
            chosenBrush.css({'background-color': "#000"});
            chosenBrush.find("div").css({'background-color': "#fff"});
          });
        brushJq.appendTo(self.brushesJq);
        return brushJq;
    });
  brushes[2].click();
}

Picker.prototype.del = function() {
  this.colorsJq.fadeOut('fast', bind(this,function(){this.colorsJq.remove();}));
  this.brushesJq.fadeOut('fast', bind(this,function(){this.brushesJq.remove();}));
  this.jscp.hidePicker();
};

Picker.prototype.show = function() {
  this.brushesJq.hide().appendTo(gootAlias("#goot_color_picker")).slideDown('medium');
  this.colorsJq.hide().appendTo(gootAlias("#goot_color_picker")).slideDown('medium');
};

