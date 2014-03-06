function CView (options, jQElements) {
  this.parent = options.parent;
  this.visible = options.visible;
  this.transitionTime = options.transitionTime;
  this.parentDisplay = this.parent.css("display");
  this.elements = [];
  for (element in jQElements) {
    this.elements.push(element);
  }
  if (!this.visible) {
    this.parent.css({ // Default to hidden state
      "opacity": 0,
      "display": "none"
    });
  }
  this.parent.appendTo(options.target);
};

CView.prototype.loadElement = function(element) {
  element.appendTo(this.parent);
  this.elements.push(element);
  return element;
};

CView.prototype.createLink = function(name) {
  var newLink = jQuery("<div/>", {
    class: name + "-link"
  })
  return this.loadElement(newLink);
};

CView.prototype.showView = function(callbacks) {
  this.visible = true;
  var that = this;
  this.parent.css({
    "display": this.parentDisplay
  });
  this.parent.animate({
    "opacity": 1
  }, {
    duration: this.transitionTime,
    complete: function() {
      that.parent.css({
        position: "relative"
      });
      callbacks && callbacks.forEach(function(callback) {
        callback();
      });
    }
  });
};

CView.prototype.hideView = function(callbacks) {
  this.visible = false;
  this.parent.off();
  this.elements.forEach(function(element) {
    element.off();
  });
  this.parent.css({
    "position": "absolute"
  });
  var that = this;
  this.parent.animate({
    "opacity": 0
  }, {
    duration: this.transitionTime,
    complete: function() {
      that.parent.css({"display": "none"});
      callbacks && callbacks.forEach(function(callback) {
        callback();
      });
    }
  });
};

CView.prototype.destroy = function() {
  this.elements.forEach(function(element) {
    element.off();
    element.remove();
  });
  this.parent.off();
  this.parent.remove();
};