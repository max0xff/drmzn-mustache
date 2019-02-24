"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ssr = exports.getTemplates = exports.views = void 0;

var _morphdom = _interopRequireDefault(require("morphdom"));

var _lodash = require("lodash");

var _serializeJavascript = _interopRequireDefault(
  require("serialize-javascript")
);

var _jsStringEscape = _interopRequireDefault(require("js-string-escape"));

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

var getTemplates = function getTemplates(views) {
  var templates = {};
  var getName = function getName(name) {
    return name
      .split("/")
      .pop()
      .slice(0, -5);
  };

  if (views.keys().length < 1) {
    throw Error("Templates are missing!");
  }

  views.keys().forEach(function(view) {
    var name = getName(view);

    if (templates[name]) {
      throw new Error("Duplicate name of template: " + view);
    }

    templates[name] = views(view);
  });

  if (templates["root"] === undefined) {
    throw new Error("Container is missing!");
  }

  var container = templates["root"];

  delete templates["root"];
  return {
    templates: templates,
    container: container
  };
};

exports.getTemplates = getTemplates;

var ssr = function ssr(placeholder, container, templates, version) {
  var render = function render(store, req, res, error) {
    if (error === void 0) {
      error = false;
    }

    var currentState = store.getState();
    var html = container.render(currentState, templates);
    var preloadedState = (0, _jsStringEscape.default)(
      (0, _serializeJavascript.default)(currentState, {
        isJSON: true
      })
    );
    res.header("Content-Type", "text/html; charset=utf-8");

    if (error) {
      res.status(404).send(placeholder(html, preloadedState, version));
    } else {
      res.send(placeholder(html, preloadedState, version));
    }
  };

  return {
    render: render
  };
};

exports.ssr = ssr;
var _default = views;
exports.default = _default;
