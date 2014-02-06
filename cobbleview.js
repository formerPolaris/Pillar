function CView (parent, target, visible, jQElements) {
  this.parent = parent;
  this.parentDisplay = parent.css("display");
  this.elements = [];
  for(element in jQElements) {
    this.elements.push(element);
  }
  if (!visible) {
    this.parent.css({ // Default to hidden state
      "display": "none",
      "opacity": 0
    });
  }
  this.parent.appendTo(target);
};

CView.prototype.createLink = function(name) {
  var newLink = jQuery("<div/>", {
    class: name + "-link"
  })
  return this.loadElement(newLink);
}

CView.prototype.loadElement = function(element) {
  element.appendTo(this.parent);
  this.elements.push(element);
  return element;
};

CView.prototype.hide = function() {
  var that = this;
  this.parent.css({"opacity": 0});
  window.setTimeout(function() {
    that.parent.css({"display": "none"});
  }, 1000);
};

CView.prototype.show = function() {
  var that = this;
  this.parent.css({"display": this.parentDisplay});
  window.setTimeout(function() {
    that.parent.css({"opacity": 1});
  }, 0);
};

CView.prototype.destroy = function() {
  for(element in jQElements) {
    element.off();
    element.remove();
  }
  this.parent.off();
  this.parent.remove();
};