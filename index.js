"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.views = void 0;

var _morphdom = _interopRequireDefault(require("morphdom"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var views = function views(store, container, templates) {
  var parser = new DOMParser();

  var render = function render() {
    console.time("render");
    var currentState = store.getState();
    var html = container.render(currentState, templates);
    var prev = document.getElementById("root");
    var next = prev.cloneNode(false);
    var fragment = parser.parseFromString(html, "text/html").body;
    Object.keys(fragment.childNodes).forEach(function() {
      next.appendChild(fragment.firstElementChild);
    });
    (0, _morphdom.default)(prev, next, {
      onBeforeElUpdated: function onBeforeElUpdated(fromEl, toEl) {
        if (
          fromEl.isEqualNode(toEl) ||
          (fromEl.classList && fromEl.classList.contains("norend"))
        ) {
          return false;
        }
      }
    });
    console.timeEnd("render");
  };

  store.subscribe(
    (0, _lodash.debounce)(render, 0, {
      leading: false,
      trailing: true
    })
  );
  return {
    render: render
  };
};

exports.views = views;
var _default = views;
exports.default = _default;
