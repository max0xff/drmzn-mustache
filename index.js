"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getTemplates = exports.views = void 0;

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
/**
 * Import templates
 * Returns templates and container
 * @return {any}
 */

exports.views = views;

var getTemplates = function getTemplates(views) {
  var templates = {};
  /**
   * Get the filename from directory, remove .html.
   * @param {string} name - The hostname.
   * @return {string}
   */

  var getName = function getName(name) {
    return name
      .split("/")
      .pop()
      .slice(0, -5);
  }; // get all html views

  if (views.keys().length < 1) {
    throw Error("Templates are missing!");
  } // generate templates object

  views.keys().forEach(function(view) {
    var name = getName(view);

    if (templates[name]) {
      throw new Error("Duplicate name of template: " + view);
    }

    templates[name] = views(view);
  });

  if (templates["root"] === undefined) {
    throw new Error("Container is missing!");
  } // define app container

  var container = templates["root"]; // remove app container template from list of templates

  delete templates["root"];
  return {
    templates: templates,
    container: container
  };
};

exports.getTemplates = getTemplates;
var _default = views;
exports.default = _default;
