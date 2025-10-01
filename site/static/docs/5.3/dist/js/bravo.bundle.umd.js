(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Bravo = {}));
})(this, (function(exports2) {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  var bootstrap = window.bootstrap || {};
  const elementMap = /* @__PURE__ */ new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, /* @__PURE__ */ new Map());
      }
      const instanceMap = elementMap.get(element);
      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }
      instanceMap.set(key, instance);
    },
    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }
      return null;
    },
    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }
      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);
      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };
  const MAX_UID = 1e6;
  const MILLISECONDS_MULTIPLIER = 1e3;
  const TRANSITION_END = "transitionend";
  const parseSelector = (selector) => {
    if (selector && window.CSS && window.CSS.escape) {
      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    }
    return selector;
  };
  const toType = (object) => {
    if (object === null || object === void 0) {
      return `${object}`;
    }
    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };
  const getUID = (prefix) => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  const getTransitionDurationFromElement = (element) => {
    if (!element) {
      return 0;
    }
    let { transitionDuration, transitionDelay } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }
    transitionDuration = transitionDuration.split(",")[0];
    transitionDelay = transitionDelay.split(",")[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };
  const triggerTransitionEnd = (element) => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  const isElement$1 = (object) => {
    if (!object || typeof object !== "object") {
      return false;
    }
    if (typeof object.jquery !== "undefined") {
      object = object[0];
    }
    return typeof object.nodeType !== "undefined";
  };
  const getElement = (object) => {
    if (isElement$1(object)) {
      return object.jquery ? object[0] : object;
    }
    if (typeof object === "string" && object.length > 0) {
      return document.querySelector(parseSelector(object));
    }
    return null;
  };
  const isVisible = (element) => {
    if (!isElement$1(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
    const closedDetails = element.closest("details:not([open])");
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest("summary");
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  const isDisabled = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains("disabled")) {
      return true;
    }
    if (typeof element.disabled !== "undefined") {
      return element.disabled;
    }
    return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
  };
  const findShadowRoot = (element) => {
    if (!document.documentElement.attachShadow) {
      return null;
    }
    if (typeof element.getRootNode === "function") {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }
    if (element instanceof ShadowRoot) {
      return element;
    }
    if (!element.parentNode) {
      return null;
    }
    return findShadowRoot(element.parentNode);
  };
  const noop = () => {
  };
  const reflow = (element) => {
    element.offsetHeight;
  };
  const getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
      return window.jQuery;
    }
    return null;
  };
  const DOMContentLoadedCallbacks = [];
  const onDOMContentLoaded = (callback) => {
    if (document.readyState === "loading") {
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener("DOMContentLoaded", () => {
          for (const callback2 of DOMContentLoadedCallbacks) {
            callback2();
          }
        });
      }
      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  const isRTL = () => document.documentElement.dir === "rtl";
  const defineJQueryPlugin = (plugin) => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;
        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    return typeof possibleCallback === "function" ? possibleCallback.call(...args) : defaultValue;
  };
  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
    const handler = ({ target }) => {
      if (target !== transitionElement) {
        return;
      }
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };
  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement);
    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }
    index += shouldGetNext ? 1 : -1;
    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }
    return list[Math.max(0, Math.min(index, listLength - 1))];
  };
  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {};
  let uidEvent = 1;
  const customEvents = {
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  };
  const nativeEvents = /* @__PURE__ */ new Set([
    "click",
    "dblclick",
    "mouseup",
    "mousedown",
    "contextmenu",
    "mousewheel",
    "DOMMouseScroll",
    "mouseover",
    "mouseout",
    "mousemove",
    "selectstart",
    "selectend",
    "keydown",
    "keypress",
    "keyup",
    "orientationchange",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointerleave",
    "pointercancel",
    "gesturestart",
    "gesturechange",
    "gestureend",
    "focus",
    "blur",
    "change",
    "reset",
    "select",
    "submit",
    "focusin",
    "focusout",
    "load",
    "unload",
    "beforeunload",
    "resize",
    "move",
    "DOMContentLoaded",
    "readystatechange",
    "error",
    "abort",
    "scroll"
  ]);
  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }
  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn) {
    return function handler(event) {
      hydrateObj(event, { delegateTarget: element });
      if (handler.oneOff) {
        EventHandler$1.off(element, event.type, fn);
      }
      return fn.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
      for (let { target } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }
          hydrateObj(event, { delegateTarget: target });
          if (handler.oneOff) {
            EventHandler$1.off(element, event.type, selector, fn);
          }
          return fn.apply(target, [event]);
        }
      }
    };
  }
  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
  }
  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === "string";
    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);
    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }
    return [isDelegated, callable, typeEvent];
  }
  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== "string" || !element) {
      return;
    }
    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
    if (originalTypeEvent in customEvents) {
      const wrapFunction = (fn2) => {
        return function(event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn2.call(this, event);
          }
        };
      };
      callable = wrapFunction(callable);
    }
    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }
    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn.delegationSelector = isDelegated ? handler : null;
    fn.callable = callable;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, isDelegated);
  }
  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);
    if (!fn) {
      return;
    }
    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }
  function getTypeEvent(event) {
    event = event.replace(stripNameRegex, "");
    return customEvents[event] || event;
  }
  const EventHandler$1 = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },
    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },
    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== "string" || !element) {
        return;
      }
      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith(".");
      if (typeof callable !== "undefined") {
        if (!Object.keys(storeElementEvent).length) {
          return;
        }
        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }
      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }
      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, "");
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },
    trigger(element, event, args) {
      if (typeof event !== "string" || !element) {
        return null;
      }
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
      const evt = hydrateObj(new Event(event, { bubbles, cancelable: true }), args);
      if (defaultPrevented) {
        evt.preventDefault();
      }
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }
      return evt;
    }
  };
  function hydrateObj(obj, meta = {}) {
    for (const [key, value] of Object.entries(meta)) {
      try {
        obj[key] = value;
      } catch {
        Object.defineProperty(obj, key, {
          configurable: true,
          get() {
            return value;
          }
        });
      }
    }
    return obj;
  }
  function normalizeData(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === "" || value === "null") {
      return null;
    }
    if (typeof value !== "string") {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
  }
  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, "");
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }
  };
  class Config {
    // Getters
    static get Default() {
      return {};
    }
    static get DefaultType() {
      return {};
    }
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
    _getConfig(config2) {
      config2 = this._mergeConfigObj(config2);
      config2 = this._configAfterMerge(config2);
      this._typeCheckConfig(config2);
      return config2;
    }
    _configAfterMerge(config2) {
      return config2;
    }
    _mergeConfigObj(config2, element) {
      const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, "config") : {};
      return {
        ...this.constructor.Default,
        ...typeof jsonConfig === "object" ? jsonConfig : {},
        ...isElement$1(element) ? Manipulator.getDataAttributes(element) : {},
        ...typeof config2 === "object" ? config2 : {}
      };
    }
    _typeCheckConfig(config2, configTypes = this.constructor.DefaultType) {
      for (const [property, expectedTypes] of Object.entries(configTypes)) {
        const value = config2[property];
        const valueType = isElement$1(value) ? "element" : toType(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(
            `${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`
          );
        }
      }
    }
  }
  const VERSION = "5.3.8";
  class BaseComponent extends Config {
    constructor(element, config2) {
      super();
      element = getElement(element);
      if (!element) {
        return;
      }
      this._element = element;
      this._config = this._getConfig(config2);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }
    // Public
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler$1.off(this._element, this.constructor.EVENT_KEY);
      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }
    // Private
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    _getConfig(config2) {
      config2 = this._mergeConfigObj(config2, this._element);
      config2 = this._configAfterMerge(config2);
      this._typeCheckConfig(config2);
      return config2;
    }
    // Static
    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }
    static getOrCreateInstance(element, config2 = {}) {
      return this.getInstance(element) || new this(element, typeof config2 === "object" ? config2 : null);
    }
    static get VERSION() {
      return VERSION;
    }
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }
  }
  const getSelector = (element) => {
    let selector = element.getAttribute("data-bs-target");
    if (!selector || selector === "#") {
      let hrefAttribute = element.getAttribute("href");
      if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
        return null;
      }
      if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
        hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
      }
      selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
    }
    return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
  };
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },
    children(element, selector) {
      return [].concat(...element.children).filter((child) => child.matches(selector));
    },
    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);
      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }
      return parents;
    },
    prev(element, selector) {
      let previous = element.previousElementSibling;
      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }
        previous = previous.previousElementSibling;
      }
      return [];
    },
    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling;
      while (next) {
        if (next.matches(selector)) {
          return [next];
        }
        next = next.nextElementSibling;
      }
      return [];
    },
    focusableChildren(element) {
      const focusables = [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "details",
        "[tabindex]",
        '[contenteditable="true"]'
      ].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
      return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
    },
    getSelectorFromElement(element) {
      const selector = getSelector(element);
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null;
      }
      return null;
    },
    getElementFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.findOne(selector) : null;
    },
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.find(selector) : [];
    }
  };
  const enableDismissTrigger = (component, method = "hide") => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler$1.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
      if (["A", "AREA"].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target);
      instance[method]();
    });
  };
  const NAME$f = "alert";
  const DATA_KEY$b = "bs.alert";
  const EVENT_KEY$d = `.${DATA_KEY$b}`;
  const EVENT_CLOSE = `close${EVENT_KEY$d}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$d}`;
  const CLASS_NAME_FADE$5 = "fade";
  const CLASS_NAME_SHOW$8 = "show";
  let Alert$1 = class Alert2 extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$f;
    }
    // Public
    close() {
      const closeEvent = EventHandler$1.trigger(this._element, EVENT_CLOSE);
      if (closeEvent.defaultPrevented) {
        return;
      }
      this._element.classList.remove(CLASS_NAME_SHOW$8);
      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    }
    // Private
    _destroyElement() {
      this._element.remove();
      EventHandler$1.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Alert2.getOrCreateInstance(this);
        if (typeof config2 !== "string") {
          return;
        }
        if (data2[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2](this);
      });
    }
  };
  enableDismissTrigger(Alert$1, "close");
  defineJQueryPlugin(Alert$1);
  const NAME$e = "button";
  const DATA_KEY$a = "bs.button";
  const EVENT_KEY$c = `.${DATA_KEY$a}`;
  const DATA_API_KEY$6 = ".data-api";
  const CLASS_NAME_ACTIVE$3 = "active";
  const SELECTOR_DATA_TOGGLE$6 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$c}${DATA_API_KEY$6}`;
  let Button$1 = class Button2 extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$e;
    }
    // Public
    toggle() {
      this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Button2.getOrCreateInstance(this);
        if (config2 === "toggle") {
          data2[config2]();
        }
      });
    }
  };
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$6, (event) => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$6);
    const data2 = Button$1.getOrCreateInstance(button);
    data2.toggle();
  });
  defineJQueryPlugin(Button$1);
  const NAME$d = "swipe";
  const EVENT_KEY$b = ".bs.swipe";
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$b}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$b}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$b}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$b}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$b}`;
  const POINTER_TYPE_TOUCH = "touch";
  const POINTER_TYPE_PEN = "pen";
  const CLASS_NAME_POINTER_EVENT = "pointer-event";
  const SWIPE_THRESHOLD = 40;
  const Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  const DefaultType$c = {
    endCallback: "(function|null)",
    leftCallback: "(function|null)",
    rightCallback: "(function|null)"
  };
  class Swipe extends Config {
    constructor(element, config2) {
      super();
      this._element = element;
      if (!element || !Swipe.isSupported()) {
        return;
      }
      this._config = this._getConfig(config2);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);
      this._initEvents();
    }
    // Getters
    static get Default() {
      return Default$c;
    }
    static get DefaultType() {
      return DefaultType$c;
    }
    static get NAME() {
      return NAME$d;
    }
    // Public
    dispose() {
      EventHandler$1.off(this._element, EVENT_KEY$b);
    }
    // Private
    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }
    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }
      this._handleSwipe();
      execute(this._config.endCallback);
    }
    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }
    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);
      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }
      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;
      if (!direction) {
        return;
      }
      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }
    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler$1.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
        EventHandler$1.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler$1.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
        EventHandler$1.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
        EventHandler$1.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
      }
    }
    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    }
    // Static
    static isSupported() {
      return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
    }
  }
  const NAME$c = "carousel";
  const DATA_KEY$9 = "bs.carousel";
  const EVENT_KEY$a = `.${DATA_KEY$9}`;
  const DATA_API_KEY$5 = ".data-api";
  const ARROW_LEFT_KEY$1 = "ArrowLeft";
  const ARROW_RIGHT_KEY$1 = "ArrowRight";
  const TOUCHEVENT_COMPAT_WAIT = 500;
  const ORDER_NEXT = "next";
  const ORDER_PREV = "prev";
  const DIRECTION_LEFT = "left";
  const DIRECTION_RIGHT = "right";
  const EVENT_SLIDE = `slide${EVENT_KEY$a}`;
  const EVENT_SLID = `slid${EVENT_KEY$a}`;
  const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$a}`;
  const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$a}`;
  const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$a}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$a}`;
  const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$a}${DATA_API_KEY$5}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$a}${DATA_API_KEY$5}`;
  const CLASS_NAME_CAROUSEL = "carousel";
  const CLASS_NAME_ACTIVE$2 = "active";
  const CLASS_NAME_SLIDE = "slide";
  const CLASS_NAME_END = "carousel-item-end";
  const CLASS_NAME_START = "carousel-item-start";
  const CLASS_NAME_NEXT = "carousel-item-next";
  const CLASS_NAME_PREV = "carousel-item-prev";
  const SELECTOR_ACTIVE = ".active";
  const SELECTOR_ITEM = ".carousel-item";
  const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  const SELECTOR_ITEM_IMG = ".carousel-item img";
  const SELECTOR_INDICATORS = ".carousel-indicators";
  const SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  const Default$b = {
    interval: 5e3,
    keyboard: true,
    pause: "hover",
    ride: false,
    touch: true,
    wrap: true
  };
  const DefaultType$b = {
    interval: "(number|boolean)",
    // TODO:v6 remove boolean support
    keyboard: "boolean",
    pause: "(string|boolean)",
    ride: "(boolean|string)",
    touch: "boolean",
    wrap: "boolean"
  };
  let Carousel$1 = class Carousel2 extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._addEventListeners();
      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    }
    // Getters
    static get Default() {
      return Default$b;
    }
    static get DefaultType() {
      return DefaultType$b;
    }
    static get NAME() {
      return NAME$c;
    }
    // Public
    next() {
      this._slide(ORDER_NEXT);
    }
    nextWhenVisible() {
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }
    prev() {
      this._slide(ORDER_PREV);
    }
    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }
      this._clearInterval();
    }
    cycle() {
      this._clearInterval();
      this._updateInterval();
      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }
    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }
      if (this._isSliding) {
        EventHandler$1.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }
      this.cycle();
    }
    to(index) {
      const items = this._getItems();
      if (index > items.length - 1 || index < 0) {
        return;
      }
      if (this._isSliding) {
        EventHandler$1.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }
      const activeIndex = this._getItemIndex(this._getActive());
      if (activeIndex === index) {
        return;
      }
      const order2 = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
      this._slide(order2, items[index]);
    }
    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }
      super.dispose();
    }
    // Private
    _configAfterMerge(config2) {
      config2.defaultInterval = config2.interval;
      return config2;
    }
    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler$1.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
      }
      if (this._config.pause === "hover") {
        EventHandler$1.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler$1.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }
      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }
    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler$1.on(img, EVENT_DRAG_START, (event) => event.preventDefault());
      }
      const endCallBack = () => {
        if (this._config.pause !== "hover") {
          return;
        }
        this.pause();
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }
        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };
      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }
    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        this._slide(this._directionToOrder(direction));
      }
    }
    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }
    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }
      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute("aria-current");
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute("aria-current", "true");
      }
    }
    _updateInterval() {
      const element = this._activeElement || this._getActive();
      if (!element) {
        return;
      }
      const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }
    _slide(order2, element = null) {
      if (this._isSliding) {
        return;
      }
      const activeElement = this._getActive();
      const isNext = order2 === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
      if (nextElement === activeElement) {
        return;
      }
      const nextElementIndex = this._getItemIndex(nextElement);
      const triggerEvent = (eventName) => {
        return EventHandler$1.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order2),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };
      const slideEvent = triggerEvent(EVENT_SLIDE);
      if (slideEvent.defaultPrevented) {
        return;
      }
      if (!activeElement || !nextElement) {
        return;
      }
      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;
      this._setActiveIndicatorElement(nextElementIndex);
      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };
      this._queueCallback(completeCallBack, activeElement, this._isAnimated());
      if (isCycling) {
        this.cycle();
      }
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }
    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }
    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }
    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }
    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }
      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }
    _orderToDirection(order2) {
      if (isRTL()) {
        return order2 === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return order2 === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Carousel2.getOrCreateInstance(this, config2);
        if (typeof config2 === "number") {
          data2.to(config2);
          return;
        }
        if (typeof config2 === "string") {
          if (data2[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
            throw new TypeError(`No method named "${config2}"`);
          }
          data2[config2]();
        }
      });
    }
  };
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }
    event.preventDefault();
    const carousel = Carousel$1.getOrCreateInstance(target);
    const slideIndex = this.getAttribute("data-bs-slide-to");
    if (slideIndex) {
      carousel.to(slideIndex);
      carousel._maybeEnableCycle();
      return;
    }
    if (Manipulator.getDataAttribute(this, "slide") === "next") {
      carousel.next();
      carousel._maybeEnableCycle();
      return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
  });
  EventHandler$1.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
      Carousel$1.getOrCreateInstance(carousel);
    }
  });
  defineJQueryPlugin(Carousel$1);
  const NAME$b = "collapse";
  const DATA_KEY$8 = "bs.collapse";
  const EVENT_KEY$9 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$4 = ".data-api";
  const EVENT_SHOW$7 = `show${EVENT_KEY$9}`;
  const EVENT_SHOWN$7 = `shown${EVENT_KEY$9}`;
  const EVENT_HIDE$7 = `hide${EVENT_KEY$9}`;
  const EVENT_HIDDEN$7 = `hidden${EVENT_KEY$9}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$9}${DATA_API_KEY$4}`;
  const CLASS_NAME_SHOW$7 = "show";
  const CLASS_NAME_COLLAPSE = "collapse";
  const CLASS_NAME_COLLAPSING = "collapsing";
  const CLASS_NAME_COLLAPSED = "collapsed";
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = "collapse-horizontal";
  const WIDTH = "width";
  const HEIGHT = "height";
  const SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="collapse"]';
  const Default$a = {
    parent: null,
    toggle: true
  };
  const DefaultType$a = {
    parent: "(null|element)",
    toggle: "boolean"
  };
  let Collapse$1 = class Collapse2 extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$5);
      for (const elem of toggleList) {
        const selector = SelectorEngine.getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter((foundElement) => foundElement === this._element);
        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }
      this._initializeChildren();
      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }
      if (this._config.toggle) {
        this.toggle();
      }
    }
    // Getters
    static get Default() {
      return Default$a;
    }
    static get DefaultType() {
      return DefaultType$a;
    }
    static get NAME() {
      return NAME$b;
    }
    // Public
    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }
      let activeChildren = [];
      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element).map((element) => Collapse2.getOrCreateInstance(element, { toggle: false }));
      }
      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }
      const startEvent = EventHandler$1.trigger(this._element, EVENT_SHOW$7);
      if (startEvent.defaultPrevented) {
        return;
      }
      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }
      const dimension = this._getDimension();
      this._element.classList.remove(CLASS_NAME_COLLAPSE);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;
      this._addAriaAndCollapsedClass(this._triggerArray, true);
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        this._element.style[dimension] = "";
        EventHandler$1.trigger(this._element, EVENT_SHOWN$7);
      };
      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;
      this._queueCallback(complete, this._element, true);
      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }
    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }
      const startEvent = EventHandler$1.trigger(this._element, EVENT_HIDE$7);
      if (startEvent.defaultPrevented) {
        return;
      }
      const dimension = this._getDimension();
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      for (const trigger of this._triggerArray) {
        const element = SelectorEngine.getElementFromSelector(trigger);
        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE);
        EventHandler$1.trigger(this._element, EVENT_HIDDEN$7);
      };
      this._element.style[dimension] = "";
      this._queueCallback(complete, this._element, true);
    }
    // Private
    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    }
    _configAfterMerge(config2) {
      config2.toggle = Boolean(config2.toggle);
      config2.parent = getElement(config2.parent);
      return config2;
    }
    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }
    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }
      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$5);
      for (const element of children) {
        const selected = SelectorEngine.getElementFromSelector(element);
        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }
    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      return SelectorEngine.find(selector, this._config.parent).filter((element) => !children.includes(element));
    }
    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }
      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute("aria-expanded", isOpen);
      }
    }
    // Static
    static jQueryInterface(config2) {
      const _config = {};
      if (typeof config2 === "string" && /show|hide/.test(config2)) {
        _config.toggle = false;
      }
      return this.each(function() {
        const data2 = Collapse2.getOrCreateInstance(this, _config);
        if (typeof config2 === "string") {
          if (typeof data2[config2] === "undefined") {
            throw new TypeError(`No method named "${config2}"`);
          }
          data2[config2]();
        }
      });
    }
  };
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$5, function(event) {
    if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
      event.preventDefault();
    }
    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
      Collapse$1.getOrCreateInstance(element, { toggle: false }).toggle();
    }
  });
  defineJQueryPlugin(Collapse$1);
  var top = "top";
  var bottom = "bottom";
  var right = "right";
  var left = "left";
  var auto = "auto";
  var basePlacements = [top, bottom, right, left];
  var start = "start";
  var end = "end";
  var clippingParents = "clippingParents";
  var viewport = "viewport";
  var popper = "popper";
  var reference = "reference";
  var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []);
  var beforeRead = "beforeRead";
  var read = "read";
  var afterRead = "afterRead";
  var beforeMain = "beforeMain";
  var main = "main";
  var afterMain = "afterMain";
  var beforeWrite = "beforeWrite";
  var write = "write";
  var afterWrite = "afterWrite";
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
  function getNodeName(element) {
    return element ? (element.nodeName || "").toLowerCase() : null;
  }
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== "[object Window]") {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function(name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? "" : value);
        }
      });
    });
  }
  function effect$2(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function() {
      Object.keys(state.elements).forEach(function(name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function(style2, property) {
          style2[property] = "";
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function(attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  const applyStyles$1 = {
    name: "applyStyles",
    enabled: true,
    phase: "write",
    fn: applyStyles,
    effect: effect$2,
    requires: ["computeStyles"]
  };
  function getBasePlacement(placement) {
    return placement.split("-")[0];
  }
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function(item) {
        return item.brand + "/" + item.version;
      }).join(" ");
    }
    return navigator.userAgent;
  }
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y
    };
  }
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height
    };
  }
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }
  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function isTableElement(element) {
    return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
  }
  function getDocumentElement(element) {
    return ((isElement(element) ? element.ownerDocument : (
      // $FlowFixMe[prop-missing]
      element.document
    )) || window.document).documentElement;
  }
  function getParentNode(element) {
    if (getNodeName(element) === "html") {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || // DOM Element detected
      (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element)
    );
  }
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle$1(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle$1(element);
      if (elementCss.position === "fixed") {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle$1(currentNode);
      if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle$1(offsetParent).position === "static")) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
  }
  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }
  function withinMaxClamp(min2, value, max2) {
    var v = within(min2, value, max2);
    return v > max2 ? max2 : v;
  }
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }
  function expandToHashMap(value, keys) {
    return keys.reduce(function(hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }
  var toPaddingObject = function toPaddingObject2(padding, state) {
    padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state, name = _ref.name, options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? "height" : "width";
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === "y" ? top : left;
    var maxProp = axis === "y" ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
  }
  function effect$1(_ref2) {
    var state = _ref2.state, options = _ref2.options;
    var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === "string") {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  }
  const arrow$1 = {
    name: "arrow",
    enabled: true,
    phase: "main",
    fn: arrow,
    effect: effect$1,
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"]
  };
  function getVariation(placement) {
    return placement.split("-")[1];
  }
  var unsetSides = {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto"
  };
  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x, y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
      x,
      y
    }) : {
      x,
      y
    };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty("x");
    var hasY = offsets.hasOwnProperty("y");
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = "clientHeight";
      var widthProp = "clientWidth";
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle$1(offsetParent).position !== "static" && position === "absolute") {
          heightProp = "scrollHeight";
          widthProp = "scrollWidth";
        }
      }
      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
          // $FlowFixMe[prop-missing]
          offsetParent[heightProp]
        );
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
          // $FlowFixMe[prop-missing]
          offsetParent[widthProp]
        );
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x,
      y
    }, getWindow(popper2)) : {
      x,
      y
    };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state, options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === "fixed"
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: "absolute",
        adaptive: false,
        roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-placement": state.placement
    });
  }
  const computeStyles$1 = {
    name: "computeStyles",
    enabled: true,
    phase: "beforeWrite",
    fn: computeStyles,
    data: {}
  };
  var passive = {
    passive: true
  };
  function effect(_ref) {
    var state = _ref.state, instance = _ref.instance, options = _ref.options;
    var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.addEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener("resize", instance.update, passive);
    }
    return function() {
      if (scroll) {
        scrollParents.forEach(function(scrollParent) {
          scrollParent.removeEventListener("scroll", instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener("resize", instance.update, passive);
      }
    };
  }
  const eventListeners = {
    name: "eventListeners",
    enabled: true,
    phase: "write",
    fn: function fn() {
    },
    effect,
    data: {}
  };
  var hash$1 = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function(matched) {
      return hash$1[matched];
    });
  }
  var hash = {
    start: "end",
    end: "start"
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function(matched) {
      return hash[matched];
    });
  }
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop
    };
  }
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x + getWindowScrollBarX(element),
      y
    };
  }
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle$1(body || html).direction === "rtl") {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle$1(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }
  function getScrollParent(node) {
    if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : (
      // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)))
    );
  }
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === "fixed");
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle$1(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function(clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }
  function computeOffsets(_ref) {
    var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === "y" ? "height" : "width";
      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
      }
    }
    return offsets;
  }
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function(key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
      return getVariation(placement2) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function(placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    }
    var overflows = allowedPlacements.reduce(function(acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function(a, b) {
      return overflows[a] - overflows[b];
    });
  }
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
      return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
        flipVariations,
        allowedAutoPlacements
      }) : placement2);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i = 0; i < placements2.length; i++) {
      var placement = placements2[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? "width" : "height";
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function(check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function(placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function(check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break") break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  const flip$1 = {
    name: "flip",
    enabled: true,
    phase: "main",
    fn: flip,
    requiresIfExists: ["offset"],
    data: {
      _skip: false
    }
  };
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function(side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state, name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: "reference"
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-reference-hidden": isReferenceHidden,
      "data-popper-escaped": hasPopperEscaped
    });
  }
  const hide$1 = {
    name: "hide",
    enabled: true,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: hide
  };
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
      placement
    })) : offset2, skidding = _ref[0], distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state, options = _ref2.options, name = _ref2.name;
    var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data2 = placements.reduce(function(acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data2[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data2;
  }
  const offset$1 = {
    name: "offset",
    enabled: true,
    phase: "main",
    requires: ["popperOffsets"],
    fn: offset
  };
  function popperOffsets(_ref) {
    var state = _ref.state, name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      placement: state.placement
    });
  }
  const popperOffsets$1 = {
    name: "popperOffsets",
    enabled: true,
    phase: "read",
    fn: popperOffsets,
    data: {}
  };
  function getAltAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function preventOverflow(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data2 = {
      x: 0,
      y: 0
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === "y" ? top : left;
      var altSide = mainAxis === "y" ? bottom : right;
      var len = mainAxis === "y" ? "height" : "width";
      var offset2 = popperOffsets2[mainAxis];
      var min$1 = offset2 + overflow[mainSide];
      var max$1 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset2, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets2[mainAxis] = preventedOffset;
      data2[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === "y" ? "height" : "width";
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data2[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data2;
  }
  const preventOverflow$1 = {
    name: "preventOverflow",
    enabled: true,
    phase: "main",
    fn: preventOverflow,
    requiresIfExists: ["offset"]
  };
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function(modifier) {
      map.set(modifier.name, modifier);
    });
    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function(dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function(modifier) {
      if (!visited.has(modifier.name)) {
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function(acc, phase) {
      return acc.concat(orderedModifiers.filter(function(modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }
  function debounce(fn) {
    var pending;
    return function() {
      if (!pending) {
        pending = new Promise(function(resolve) {
          Promise.resolve().then(function() {
            pending = void 0;
            resolve(fn());
          });
        });
      }
      return pending;
    };
  }
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function(merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function(key) {
      return merged[key];
    });
  }
  var DEFAULT_OPTIONS = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute"
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function(element) {
      return !(element && typeof element.getBoundingClientRect === "function");
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper2(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions;
      }
      var state = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
            popper: listScrollParents(popper2)
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function(m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
            popper: getLayoutRect(popper3)
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function(modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index], fn = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
            if (typeof fn === "function") {
              state = fn({
                state,
                options: _options,
                name,
                instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function() {
          return new Promise(function(resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference2, popper2)) {
        return instance;
      }
      instance.setOptions(options).then(function(state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function(_ref) {
          var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect2 = _ref.effect;
          if (typeof effect2 === "function") {
            var cleanupFn = effect2({
              state,
              name,
              instance,
              options: options2
            });
            var noopFn = function noopFn2() {
            };
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function(fn) {
          return fn();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }
  var createPopper$2 = /* @__PURE__ */ popperGenerator();
  var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
  var createPopper$1 = /* @__PURE__ */ popperGenerator({
    defaultModifiers: defaultModifiers$1
  });
  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /* @__PURE__ */ popperGenerator({
    defaultModifiers
  });
  const lib = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    afterMain,
    afterRead,
    afterWrite,
    applyStyles: applyStyles$1,
    arrow: arrow$1,
    auto,
    basePlacements,
    beforeMain,
    beforeRead,
    beforeWrite,
    bottom,
    clippingParents,
    computeStyles: computeStyles$1,
    createPopper,
    createPopperBase: createPopper$2,
    createPopperLite: createPopper$1,
    detectOverflow,
    end,
    eventListeners,
    flip: flip$1,
    hide: hide$1,
    left,
    main,
    modifierPhases,
    offset: offset$1,
    placements,
    popper,
    popperGenerator,
    popperOffsets: popperOffsets$1,
    preventOverflow: preventOverflow$1,
    read,
    reference,
    right,
    start,
    top,
    variationPlacements,
    viewport,
    write
  }, Symbol.toStringTag, { value: "Module" }));
  const NAME$a = "dropdown";
  const DATA_KEY$7 = "bs.dropdown";
  const EVENT_KEY$8 = `.${DATA_KEY$7}`;
  const DATA_API_KEY$3 = ".data-api";
  const ESCAPE_KEY$2 = "Escape";
  const TAB_KEY$1 = "Tab";
  const ARROW_UP_KEY$1 = "ArrowUp";
  const ARROW_DOWN_KEY$1 = "ArrowDown";
  const RIGHT_MOUSE_BUTTON = 2;
  const EVENT_HIDE$6 = `hide${EVENT_KEY$8}`;
  const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$8}`;
  const EVENT_SHOW$6 = `show${EVENT_KEY$8}`;
  const EVENT_SHOWN$6 = `shown${EVENT_KEY$8}`;
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$8}${DATA_API_KEY$3}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$8}${DATA_API_KEY$3}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$8}${DATA_API_KEY$3}`;
  const CLASS_NAME_SHOW$6 = "show";
  const CLASS_NAME_DROPUP = "dropup";
  const CLASS_NAME_DROPEND = "dropend";
  const CLASS_NAME_DROPSTART = "dropstart";
  const CLASS_NAME_DROPUP_CENTER = "dropup-center";
  const CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$4}.${CLASS_NAME_SHOW$6}`;
  const SELECTOR_MENU = ".dropdown-menu";
  const SELECTOR_NAVBAR = ".navbar";
  const SELECTOR_NAVBAR_NAV = ".navbar-nav";
  const SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
  const PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
  const PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
  const PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
  const PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
  const PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
  const PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
  const PLACEMENT_TOPCENTER = "top";
  const PLACEMENT_BOTTOMCENTER = "bottom";
  const Default$9 = {
    autoClose: true,
    boundary: "clippingParents",
    display: "dynamic",
    offset: [0, 2],
    popperConfig: null,
    reference: "toggle"
  };
  const DefaultType$9 = {
    autoClose: "(boolean|string)",
    boundary: "(string|element)",
    display: "string",
    offset: "(array|string|function)",
    popperConfig: "(null|object|function)",
    reference: "(string|element|object)"
  };
  let Dropdown$1 = class Dropdown2 extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._popper = null;
      this._parent = this._element.parentNode;
      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    }
    // Getters
    static get Default() {
      return Default$9;
    }
    static get DefaultType() {
      return DefaultType$9;
    }
    static get NAME() {
      return NAME$a;
    }
    // Public
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler$1.trigger(this._element, EVENT_SHOW$6, relatedTarget);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._createPopper();
      if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler$1.on(element, "mouseover", noop);
        }
      }
      this._element.focus();
      this._element.setAttribute("aria-expanded", true);
      this._menu.classList.add(CLASS_NAME_SHOW$6);
      this._element.classList.add(CLASS_NAME_SHOW$6);
      EventHandler$1.trigger(this._element, EVENT_SHOWN$6, relatedTarget);
    }
    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      this._completeHide(relatedTarget);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper) {
        this._popper.update();
      }
    }
    // Private
    _completeHide(relatedTarget) {
      const hideEvent = EventHandler$1.trigger(this._element, EVENT_HIDE$6, relatedTarget);
      if (hideEvent.defaultPrevented) {
        return;
      }
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler$1.off(element, "mouseover", noop);
        }
      }
      if (this._popper) {
        this._popper.destroy();
      }
      this._menu.classList.remove(CLASS_NAME_SHOW$6);
      this._element.classList.remove(CLASS_NAME_SHOW$6);
      this._element.setAttribute("aria-expanded", "false");
      Manipulator.removeDataAttribute(this._menu, "popper");
      EventHandler$1.trigger(this._element, EVENT_HIDDEN$6, relatedTarget);
    }
    _getConfig(config2) {
      config2 = super._getConfig(config2);
      if (typeof config2.reference === "object" && !isElement$1(config2.reference) && typeof config2.reference.getBoundingClientRect !== "function") {
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }
      return config2;
    }
    _createPopper() {
      if (typeof lib === "undefined") {
        throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org/docs/v2/)");
      }
      let referenceElement = this._element;
      if (this._config.reference === "parent") {
        referenceElement = this._parent;
      } else if (isElement$1(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === "object") {
        referenceElement = this._config.reference;
      }
      const popperConfig = this._getPopperConfig();
      this._popper = createPopper(referenceElement, this._menu, popperConfig);
    }
    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }
    _getPlacement() {
      const parentDropdown = this._parent;
      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      }
      const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }
      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }
    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }
    _getOffset() {
      const { offset: offset2 } = this._config;
      if (typeof offset2 === "string") {
        return offset2.split(",").map((value) => Number.parseInt(value, 10));
      }
      if (typeof offset2 === "function") {
        return (popperData) => offset2(popperData, this._element);
      }
      return offset2;
    }
    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              boundary: this._config.boundary
            }
          },
          {
            name: "offset",
            options: {
              offset: this._getOffset()
            }
          }
        ]
      };
      if (this._inNavbar || this._config.display === "static") {
        Manipulator.setDataAttribute(this._menu, "popper", "static");
        defaultBsPopperConfig.modifiers = [{
          name: "applyStyles",
          enabled: false
        }];
      }
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
      };
    }
    _selectMenuItem({ key, target }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
      if (!items.length) {
        return;
      }
      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Dropdown2.getOrCreateInstance(this, config2);
        if (typeof config2 !== "string") {
          return;
        }
        if (typeof data2[config2] === "undefined") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2]();
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY$1) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = Dropdown2.getInstance(toggle);
        if (!context || context._config.autoClose === false) {
          continue;
        }
        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);
        if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
          continue;
        }
        if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }
        const relatedTarget = { relatedTarget: context._element };
        if (event.type === "click") {
          relatedTarget.clickEvent = event;
        }
        context._completeHide(relatedTarget);
      }
    }
    static dataApiKeydownHandler(event) {
      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }
      if (isInput && !isEscapeEvent) {
        return;
      }
      event.preventDefault();
      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$4) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$4)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$4)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$4, event.delegateTarget.parentNode);
      const instance = Dropdown2.getOrCreateInstance(getToggleButton);
      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();
        instance._selectMenuItem(event);
        return;
      }
      if (instance._isShown()) {
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }
  };
  EventHandler$1.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$4, Dropdown$1.dataApiKeydownHandler);
  EventHandler$1.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown$1.dataApiKeydownHandler);
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$3, Dropdown$1.clearMenus);
  EventHandler$1.on(document, EVENT_KEYUP_DATA_API, Dropdown$1.clearMenus);
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$4, function(event) {
    event.preventDefault();
    Dropdown$1.getOrCreateInstance(this).toggle();
  });
  defineJQueryPlugin(Dropdown$1);
  const NAME$9 = "backdrop";
  const CLASS_NAME_FADE$4 = "fade";
  const CLASS_NAME_SHOW$5 = "show";
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  const Default$8 = {
    className: "modal-backdrop",
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    rootElement: "body"
    // give the choice to place backdrop under different elements
  };
  const DefaultType$8 = {
    className: "string",
    clickCallback: "(function|null)",
    isAnimated: "boolean",
    isVisible: "boolean",
    rootElement: "(element|string)"
  };
  class Backdrop extends Config {
    constructor(config2) {
      super();
      this._config = this._getConfig(config2);
      this._isAppended = false;
      this._element = null;
    }
    // Getters
    static get Default() {
      return Default$8;
    }
    static get DefaultType() {
      return DefaultType$8;
    }
    static get NAME() {
      return NAME$9;
    }
    // Public
    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._append();
      const element = this._getElement();
      if (this._config.isAnimated) {
        reflow(element);
      }
      element.classList.add(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        execute(callback);
      });
    }
    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._getElement().classList.remove(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }
    dispose() {
      if (!this._isAppended) {
        return;
      }
      EventHandler$1.off(this._element, EVENT_MOUSEDOWN);
      this._element.remove();
      this._isAppended = false;
    }
    // Private
    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement("div");
        backdrop.className = this._config.className;
        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }
        this._element = backdrop;
      }
      return this._element;
    }
    _configAfterMerge(config2) {
      config2.rootElement = getElement(config2.rootElement);
      return config2;
    }
    _append() {
      if (this._isAppended) {
        return;
      }
      const element = this._getElement();
      this._config.rootElement.append(element);
      EventHandler$1.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }
    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }
  }
  const NAME$8 = "focustrap";
  const DATA_KEY$6 = "bs.focustrap";
  const EVENT_KEY$7 = `.${DATA_KEY$6}`;
  const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$7}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$7}`;
  const TAB_KEY = "Tab";
  const TAB_NAV_FORWARD = "forward";
  const TAB_NAV_BACKWARD = "backward";
  const Default$7 = {
    autofocus: true,
    trapElement: null
    // The element to trap focus inside of
  };
  const DefaultType$7 = {
    autofocus: "boolean",
    trapElement: "element"
  };
  class FocusTrap extends Config {
    constructor(config2) {
      super();
      this._config = this._getConfig(config2);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }
    // Getters
    static get Default() {
      return Default$7;
    }
    static get DefaultType() {
      return DefaultType$7;
    }
    static get NAME() {
      return NAME$8;
    }
    // Public
    activate() {
      if (this._isActive) {
        return;
      }
      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }
      EventHandler$1.off(document, EVENT_KEY$7);
      EventHandler$1.on(document, EVENT_FOCUSIN$2, (event) => this._handleFocusin(event));
      EventHandler$1.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
      this._isActive = true;
    }
    deactivate() {
      if (!this._isActive) {
        return;
      }
      this._isActive = false;
      EventHandler$1.off(document, EVENT_KEY$7);
    }
    // Private
    _handleFocusin(event) {
      const { trapElement } = this._config;
      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }
      const elements = SelectorEngine.focusableChildren(trapElement);
      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }
    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }
      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }
  }
  const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
  const SELECTOR_STICKY_CONTENT = ".sticky-top";
  const PROPERTY_PADDING = "padding-right";
  const PROPERTY_MARGIN = "margin-right";
  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }
    // Public
    getWidth() {
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }
    hide() {
      const width = this.getWidth();
      this._disableOverFlow();
      this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
    }
    reset() {
      this._resetElementAttributes(this._element, "overflow");
      this._resetElementAttributes(this._element, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }
    isOverflowing() {
      return this.getWidth() > 0;
    }
    // Private
    _disableOverFlow() {
      this._saveInitialAttribute(this._element, "overflow");
      this._element.style.overflow = "hidden";
    }
    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();
      const manipulationCallBack = (element) => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }
        this._saveInitialAttribute(element, styleProperty);
        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);
      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }
    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = (element) => {
        const value = Manipulator.getDataAttribute(element, styleProperty);
        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }
        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _applyManipulationCallback(selector, callBack) {
      if (isElement$1(selector)) {
        callBack(selector);
        return;
      }
      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }
  }
  const NAME$7 = "modal";
  const DATA_KEY$5 = "bs.modal";
  const EVENT_KEY$6 = `.${DATA_KEY$5}`;
  const DATA_API_KEY$2 = ".data-api";
  const ESCAPE_KEY$1 = "Escape";
  const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$6}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  const EVENT_RESIZE$1 = `resize${EVENT_KEY$6}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$6}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$6}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$6}${DATA_API_KEY$2}`;
  const CLASS_NAME_OPEN = "modal-open";
  const CLASS_NAME_FADE$3 = "fade";
  const CLASS_NAME_SHOW$4 = "show";
  const CLASS_NAME_STATIC = "modal-static";
  const OPEN_SELECTOR$1 = ".modal.show";
  const SELECTOR_DIALOG = ".modal-dialog";
  const SELECTOR_MODAL_BODY = ".modal-body";
  const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="modal"]';
  const Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  const DefaultType$6 = {
    backdrop: "(boolean|string)",
    focus: "boolean",
    keyboard: "boolean"
  };
  let Modal$1 = class Modal2 extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
      this._addEventListeners();
    }
    // Getters
    static get Default() {
      return Default$6;
    }
    static get DefaultType() {
      return DefaultType$6;
    }
    static get NAME() {
      return NAME$7;
    }
    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }
      const showEvent = EventHandler$1.trigger(this._element, EVENT_SHOW$5, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }
      const hideEvent = EventHandler$1.trigger(this._element, EVENT_HIDE$5);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW$4);
      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }
    dispose() {
      EventHandler$1.off(window, EVENT_KEY$6);
      EventHandler$1.off(this._dialog, EVENT_KEY$6);
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    handleUpdate() {
      this._adjustDialog();
    }
    // Private
    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value,
        isAnimated: this._isAnimated()
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _showElement(relatedTarget) {
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }
      this._element.style.display = "block";
      this._element.removeAttribute("aria-hidden");
      this._element.setAttribute("aria-modal", true);
      this._element.setAttribute("role", "dialog");
      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW$4);
      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }
        this._isTransitioning = false;
        EventHandler$1.trigger(this._element, EVENT_SHOWN$5, {
          relatedTarget
        });
      };
      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }
    _addEventListeners() {
      EventHandler$1.on(this._element, EVENT_KEYDOWN_DISMISS$1, (event) => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        this._triggerBackdropTransition();
      });
      EventHandler$1.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler$1.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
        EventHandler$1.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }
          if (this._config.backdrop === "static") {
            this._triggerBackdropTransition();
            return;
          }
          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }
    _hideModal() {
      this._element.style.display = "none";
      this._element.setAttribute("aria-hidden", true);
      this._element.removeAttribute("aria-modal");
      this._element.removeAttribute("role");
      this._isTransitioning = false;
      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);
        this._resetAdjustments();
        this._scrollBar.reset();
        EventHandler$1.trigger(this._element, EVENT_HIDDEN$5);
      });
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }
    _triggerBackdropTransition() {
      const hideEvent = EventHandler$1.trigger(this._element, EVENT_HIDE_PREVENTED$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY;
      if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }
      if (!isModalOverflowing) {
        this._element.style.overflowY = "hidden";
      }
      this._element.classList.add(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);
      this._element.focus();
    }
    /**
     * The following methods are used to handle overflowing modals
     */
    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const scrollbarWidth = this._scrollBar.getWidth();
      const isBodyOverflowing = scrollbarWidth > 0;
      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? "paddingLeft" : "paddingRight";
        this._element.style[property] = `${scrollbarWidth}px`;
      }
      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? "paddingRight" : "paddingLeft";
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }
    _resetAdjustments() {
      this._element.style.paddingLeft = "";
      this._element.style.paddingRight = "";
    }
    // Static
    static jQueryInterface(config2, relatedTarget) {
      return this.each(function() {
        const data2 = Modal2.getOrCreateInstance(this, config2);
        if (typeof config2 !== "string") {
          return;
        }
        if (typeof data2[config2] === "undefined") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2](relatedTarget);
      });
    }
  };
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$3, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    EventHandler$1.one(target, EVENT_SHOW$5, (showEvent) => {
      if (showEvent.defaultPrevented) {
        return;
      }
      EventHandler$1.one(target, EVENT_HIDDEN$5, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
    if (alreadyOpen) {
      Modal$1.getInstance(alreadyOpen).hide();
    }
    const data2 = Modal$1.getOrCreateInstance(target);
    data2.toggle(this);
  });
  enableDismissTrigger(Modal$1);
  defineJQueryPlugin(Modal$1);
  const NAME$6 = "offcanvas";
  const DATA_KEY$4 = "bs.offcanvas";
  const EVENT_KEY$5 = `.${DATA_KEY$4}`;
  const DATA_API_KEY$1 = ".data-api";
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$5}${DATA_API_KEY$1}`;
  const ESCAPE_KEY = "Escape";
  const CLASS_NAME_SHOW$3 = "show";
  const CLASS_NAME_SHOWING$1 = "showing";
  const CLASS_NAME_HIDING = "hiding";
  const CLASS_NAME_BACKDROP = "offcanvas-backdrop";
  const OPEN_SELECTOR = ".offcanvas.show";
  const EVENT_SHOW$4 = `show${EVENT_KEY$5}`;
  const EVENT_SHOWN$4 = `shown${EVENT_KEY$5}`;
  const EVENT_HIDE$4 = `hide${EVENT_KEY$5}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$5}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$5}`;
  const EVENT_RESIZE = `resize${EVENT_KEY$5}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$5}${DATA_API_KEY$1}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$5}`;
  const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="offcanvas"]';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$5 = {
    backdrop: "(boolean|string)",
    keyboard: "boolean",
    scroll: "boolean"
  };
  let Offcanvas$1 = class Offcanvas2 extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._addEventListeners();
    }
    // Getters
    static get Default() {
      return Default$5;
    }
    static get DefaultType() {
      return DefaultType$5;
    }
    static get NAME() {
      return NAME$6;
    }
    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown) {
        return;
      }
      const showEvent = EventHandler$1.trigger(this._element, EVENT_SHOW$4, { relatedTarget });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._backdrop.show();
      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }
      this._element.setAttribute("aria-modal", true);
      this._element.setAttribute("role", "dialog");
      this._element.classList.add(CLASS_NAME_SHOWING$1);
      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }
        this._element.classList.add(CLASS_NAME_SHOW$3);
        this._element.classList.remove(CLASS_NAME_SHOWING$1);
        EventHandler$1.trigger(this._element, EVENT_SHOWN$4, { relatedTarget });
      };
      this._queueCallback(completeCallBack, this._element, true);
    }
    hide() {
      if (!this._isShown) {
        return;
      }
      const hideEvent = EventHandler$1.trigger(this._element, EVENT_HIDE$4);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.add(CLASS_NAME_HIDING);
      this._backdrop.hide();
      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
        this._element.removeAttribute("aria-modal");
        this._element.removeAttribute("role");
        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }
        EventHandler$1.trigger(this._element, EVENT_HIDDEN$4);
      };
      this._queueCallback(completeCallback, this._element, true);
    }
    dispose() {
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    // Private
    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === "static") {
          EventHandler$1.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }
        this.hide();
      };
      const isVisible2 = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible: isVisible2,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible2 ? clickCallback : null
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _addEventListeners() {
      EventHandler$1.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        EventHandler$1.trigger(this._element, EVENT_HIDE_PREVENTED);
      });
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Offcanvas2.getOrCreateInstance(this, config2);
        if (typeof config2 !== "string") {
          return;
        }
        if (data2[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2](this);
      });
    }
  };
  EventHandler$1.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$2, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    EventHandler$1.one(target, EVENT_HIDDEN$4, () => {
      if (isVisible(this)) {
        this.focus();
      }
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas$1.getInstance(alreadyOpen).hide();
    }
    const data2 = Offcanvas$1.getOrCreateInstance(target);
    data2.toggle(this);
  });
  EventHandler$1.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas$1.getOrCreateInstance(selector).show();
    }
  });
  EventHandler$1.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find("[aria-modal][class*=show][class*=offcanvas-]")) {
      if (getComputedStyle(element).position !== "fixed") {
        Offcanvas$1.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas$1);
  defineJQueryPlugin(Offcanvas$1);
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
    a: ["target", "href", "title", "rel"],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ["src", "srcset", "alt", "title", "width", "height"],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  const uriAttributes = /* @__PURE__ */ new Set([
    "background",
    "cite",
    "href",
    "itemtype",
    "longdesc",
    "poster",
    "src",
    "xlink:href"
  ]);
  const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();
    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
      }
      return true;
    }
    return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }
    if (sanitizeFunction && typeof sanitizeFunction === "function") {
      return sanitizeFunction(unsafeHtml);
    }
    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
    const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();
      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }
      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }
  const NAME$5 = "TemplateFactory";
  const Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    // { selector : text ,  selector2 : text2 , }
    extraClass: "",
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: "<div></div>"
  };
  const DefaultType$4 = {
    allowList: "object",
    content: "object",
    extraClass: "(string|function)",
    html: "boolean",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    template: "string"
  };
  const DefaultContentType = {
    entry: "(string|element|function|null)",
    selector: "(string|element)"
  };
  class TemplateFactory extends Config {
    constructor(config2) {
      super();
      this._config = this._getConfig(config2);
    }
    // Getters
    static get Default() {
      return Default$4;
    }
    static get DefaultType() {
      return DefaultType$4;
    }
    static get NAME() {
      return NAME$5;
    }
    // Public
    getContent() {
      return Object.values(this._config.content).map((config2) => this._resolvePossibleFunction(config2)).filter(Boolean);
    }
    hasContent() {
      return this.getContent().length > 0;
    }
    changeContent(content) {
      this._checkContent(content);
      this._config.content = { ...this._config.content, ...content };
      return this;
    }
    toHtml() {
      const templateWrapper = document.createElement("div");
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }
      const template = templateWrapper.children[0];
      const extraClass = this._resolvePossibleFunction(this._config.extraClass);
      if (extraClass) {
        template.classList.add(...extraClass.split(" "));
      }
      return template;
    }
    // Private
    _typeCheckConfig(config2) {
      super._typeCheckConfig(config2);
      this._checkContent(config2.content);
    }
    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({ selector, entry: content }, DefaultContentType);
      }
    }
    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);
      if (!templateElement) {
        return;
      }
      content = this._resolvePossibleFunction(content);
      if (!content) {
        templateElement.remove();
        return;
      }
      if (isElement$1(content)) {
        this._putElementInTemplate(getElement(content), templateElement);
        return;
      }
      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }
      templateElement.textContent = content;
    }
    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [void 0, this]);
    }
    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = "";
        templateElement.append(element);
        return;
      }
      templateElement.textContent = element.textContent;
    }
  }
  const NAME$4 = "tooltip";
  const DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
  const CLASS_NAME_FADE$2 = "fade";
  const CLASS_NAME_MODAL = "modal";
  const CLASS_NAME_SHOW$2 = "show";
  const SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = "hide.bs.modal";
  const TRIGGER_HOVER = "hover";
  const TRIGGER_FOCUS = "focus";
  const TRIGGER_CLICK = "click";
  const TRIGGER_MANUAL = "manual";
  const EVENT_HIDE$3 = "hide";
  const EVENT_HIDDEN$3 = "hidden";
  const EVENT_SHOW$3 = "show";
  const EVENT_SHOWN$3 = "shown";
  const EVENT_INSERTED = "inserted";
  const EVENT_CLICK$1 = "click";
  const EVENT_FOCUSIN$1 = "focusin";
  const EVENT_FOCUSOUT$1 = "focusout";
  const EVENT_MOUSEENTER = "mouseenter";
  const EVENT_MOUSELEAVE = "mouseleave";
  const AttachmentMap = {
    AUTO: "auto",
    TOP: "top",
    RIGHT: isRTL() ? "left" : "right",
    BOTTOM: "bottom",
    LEFT: isRTL() ? "right" : "left"
  };
  const Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: "clippingParents",
    container: false,
    customClass: "",
    delay: 0,
    fallbackPlacements: ["top", "right", "bottom", "left"],
    html: false,
    offset: [0, 6],
    placement: "top",
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    title: "",
    trigger: "hover focus"
  };
  const DefaultType$3 = {
    allowList: "object",
    animation: "boolean",
    boundary: "(string|element)",
    container: "(string|element|boolean)",
    customClass: "(string|function)",
    delay: "(number|object)",
    fallbackPlacements: "array",
    html: "boolean",
    offset: "(array|string|function)",
    placement: "(string|function)",
    popperConfig: "(null|object|function)",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    selector: "(string|boolean)",
    template: "string",
    title: "(string|element|function)",
    trigger: "string"
  };
  let Tooltip$1 = class Tooltip2 extends BaseComponent {
    constructor(element, config2) {
      if (typeof lib === "undefined") {
        throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org/docs/v2/)");
      }
      super(element, config2);
      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null;
      this.tip = null;
      this._setListeners();
      if (!this._config.selector) {
        this._fixTitle();
      }
    }
    // Getters
    static get Default() {
      return Default$3;
    }
    static get DefaultType() {
      return DefaultType$3;
    }
    static get NAME() {
      return NAME$4;
    }
    // Public
    enable() {
      this._isEnabled = true;
    }
    disable() {
      this._isEnabled = false;
    }
    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }
    toggle() {
      if (!this._isEnabled) {
        return;
      }
      if (this._isShown()) {
        this._leave();
        return;
      }
      this._enter();
    }
    dispose() {
      clearTimeout(this._timeout);
      EventHandler$1.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      if (this._element.getAttribute("data-bs-original-title")) {
        this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
      }
      this._disposePopper();
      super.dispose();
    }
    show() {
      if (this._element.style.display === "none") {
        throw new Error("Please use show on visible elements");
      }
      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }
      const showEvent = EventHandler$1.trigger(this._element, this.constructor.eventName(EVENT_SHOW$3));
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }
      this._disposePopper();
      const tip = this._getTipElement();
      this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
      const { container } = this._config;
      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler$1.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }
      this._popper = this._createPopper(tip);
      tip.classList.add(CLASS_NAME_SHOW$2);
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler$1.on(element, "mouseover", noop);
        }
      }
      const complete = () => {
        EventHandler$1.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$3));
        if (this._isHovered === false) {
          this._leave();
        }
        this._isHovered = false;
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    hide() {
      if (!this._isShown()) {
        return;
      }
      const hideEvent = EventHandler$1.trigger(this._element, this.constructor.eventName(EVENT_HIDE$3));
      if (hideEvent.defaultPrevented) {
        return;
      }
      const tip = this._getTipElement();
      tip.classList.remove(CLASS_NAME_SHOW$2);
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler$1.off(element, "mouseover", noop);
        }
      }
      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null;
      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }
        if (!this._isHovered) {
          this._disposePopper();
        }
        this._element.removeAttribute("aria-describedby");
        EventHandler$1.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$3));
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    update() {
      if (this._popper) {
        this._popper.update();
      }
    }
    // Protected
    _isWithContent() {
      return Boolean(this._getTitle());
    }
    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }
      return this.tip;
    }
    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml();
      if (!tip) {
        return null;
      }
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute("id", tipId);
      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }
      return tip;
    }
    setContent(content) {
      this._newContent = content;
      if (this._isShown()) {
        this._disposePopper();
        this.show();
      }
    }
    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory({
          ...this._config,
          // the `content` var has to be after `this._config`
          // to override config.content in case of popover
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        });
      }
      return this._templateFactory;
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }
    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
    }
    // Private
    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }
    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }
    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }
    _createPopper(tip) {
      const placement = execute(this._config.placement, [this, tip, this._element]);
      const attachment = AttachmentMap[placement.toUpperCase()];
      return createPopper(this._element, tip, this._getPopperConfig(attachment));
    }
    _getOffset() {
      const { offset: offset2 } = this._config;
      if (typeof offset2 === "string") {
        return offset2.split(",").map((value) => Number.parseInt(value, 10));
      }
      if (typeof offset2 === "function") {
        return (popperData) => offset2(popperData, this._element);
      }
      return offset2;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this._element, this._element]);
    }
    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [
          {
            name: "flip",
            options: {
              fallbackPlacements: this._config.fallbackPlacements
            }
          },
          {
            name: "offset",
            options: {
              offset: this._getOffset()
            }
          },
          {
            name: "preventOverflow",
            options: {
              boundary: this._config.boundary
            }
          },
          {
            name: "arrow",
            options: {
              element: `.${this.constructor.NAME}-arrow`
            }
          },
          {
            name: "preSetPlacement",
            enabled: true,
            phase: "beforeMain",
            fn: (data2) => {
              this._getTipElement().setAttribute("data-popper-placement", data2.state.placement);
            }
          }
        ]
      };
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
      };
    }
    _setListeners() {
      const triggers = this._config.trigger.split(" ");
      for (const trigger of triggers) {
        if (trigger === "click") {
          EventHandler$1.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[TRIGGER_CLICK] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK]);
            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler$1.on(this._element, eventIn, this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            context._enter();
          });
          EventHandler$1.on(this._element, eventOut, this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
            context._leave();
          });
        }
      }
      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };
      EventHandler$1.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }
    _fixTitle() {
      const title = this._element.getAttribute("title");
      if (!title) {
        return;
      }
      if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
        this._element.setAttribute("aria-label", title);
      }
      this._element.setAttribute("data-bs-original-title", title);
      this._element.removeAttribute("title");
    }
    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }
      this._isHovered = true;
      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }
    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }
      this._isHovered = false;
      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }
    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }
    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }
    _getConfig(config2) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }
      config2 = {
        ...dataAttributes,
        ...typeof config2 === "object" && config2 ? config2 : {}
      };
      config2 = this._mergeConfigObj(config2);
      config2 = this._configAfterMerge(config2);
      this._typeCheckConfig(config2);
      return config2;
    }
    _configAfterMerge(config2) {
      config2.container = config2.container === false ? document.body : getElement(config2.container);
      if (typeof config2.delay === "number") {
        config2.delay = {
          show: config2.delay,
          hide: config2.delay
        };
      }
      if (typeof config2.title === "number") {
        config2.title = config2.title.toString();
      }
      if (typeof config2.content === "number") {
        config2.content = config2.content.toString();
      }
      return config2;
    }
    _getDelegateConfig() {
      const config2 = {};
      for (const [key, value] of Object.entries(this._config)) {
        if (this.constructor.Default[key] !== value) {
          config2[key] = value;
        }
      }
      config2.selector = false;
      config2.trigger = "manual";
      return config2;
    }
    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();
        this._popper = null;
      }
      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Tooltip2.getOrCreateInstance(this, config2);
        if (typeof config2 !== "string") {
          return;
        }
        if (typeof data2[config2] === "undefined") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2]();
      });
    }
  };
  defineJQueryPlugin(Tooltip$1);
  const NAME$3 = "popover";
  const SELECTOR_TITLE = ".popover-header";
  const SELECTOR_CONTENT = ".popover-body";
  const Default$2 = {
    ...Tooltip$1.Default,
    content: "",
    offset: [0, 8],
    placement: "right",
    template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
    trigger: "click"
  };
  const DefaultType$2 = {
    ...Tooltip$1.DefaultType,
    content: "(null|string|element|function)"
  };
  let Popover$1 = class Popover2 extends Tooltip$1 {
    // Getters
    static get Default() {
      return Default$2;
    }
    static get DefaultType() {
      return DefaultType$2;
    }
    static get NAME() {
      return NAME$3;
    }
    // Overrides
    _isWithContent() {
      return this._getTitle() || this._getContent();
    }
    // Private
    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }
    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Popover2.getOrCreateInstance(this, config2);
        if (typeof config2 !== "string") {
          return;
        }
        if (typeof data2[config2] === "undefined") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2]();
      });
    }
  };
  defineJQueryPlugin(Popover$1);
  const NAME$2 = "scrollspy";
  const DATA_KEY$3 = "bs.scrollspy";
  const EVENT_KEY$4 = `.${DATA_KEY$3}`;
  const DATA_API_KEY = ".data-api";
  const EVENT_ACTIVATE = `activate${EVENT_KEY$4}`;
  const EVENT_CLICK = `click${EVENT_KEY$4}`;
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$4}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
  const CLASS_NAME_ACTIVE$1 = "active";
  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  const SELECTOR_TARGET_LINKS = "[href]";
  const SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
  const SELECTOR_NAV_LINKS = ".nav-link";
  const SELECTOR_NAV_ITEMS = ".nav-item";
  const SELECTOR_LIST_ITEMS = ".list-group-item";
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  const SELECTOR_DROPDOWN = ".dropdown";
  const SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
  const Default$1 = {
    offset: null,
    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: "0px 0px -25%",
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  const DefaultType$1 = {
    offset: "(number|null)",
    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: "string",
    smoothScroll: "boolean",
    target: "element",
    threshold: "array"
  };
  class ScrollSpy extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._targetLinks = /* @__PURE__ */ new Map();
      this._observableSections = /* @__PURE__ */ new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh();
    }
    // Getters
    static get Default() {
      return Default$1;
    }
    static get DefaultType() {
      return DefaultType$1;
    }
    static get NAME() {
      return NAME$2;
    }
    // Public
    refresh() {
      this._initializeTargetsAndObservables();
      this._maybeEnableSmoothScroll();
      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }
      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }
    dispose() {
      this._observer.disconnect();
      super.dispose();
    }
    // Private
    _configAfterMerge(config2) {
      config2.target = getElement(config2.target) || document.body;
      config2.rootMargin = config2.offset ? `${config2.offset}px 0px -30%` : config2.rootMargin;
      if (typeof config2.threshold === "string") {
        config2.threshold = config2.threshold.split(",").map((value) => Number.parseFloat(value));
      }
      return config2;
    }
    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      }
      EventHandler$1.off(this._config.target, EVENT_CLICK);
      EventHandler$1.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, (event) => {
        const observableSection = this._observableSections.get(event.target.hash);
        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;
          if (root.scrollTo) {
            root.scrollTo({ top: height, behavior: "smooth" });
            return;
          }
          root.scrollTop = height;
        }
      });
    }
    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver((entries) => this._observerCallback(entries), options);
    }
    // The logic of selection
    _observerCallback(entries) {
      const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
      const activate = (entry) => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
        this._process(targetElement(entry));
      };
      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;
          this._clearActiveClass(targetElement(entry));
          continue;
        }
        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry);
          if (!parentScrollTop) {
            return;
          }
          continue;
        }
        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }
    _initializeTargetsAndObservables() {
      this._targetLinks = /* @__PURE__ */ new Map();
      this._observableSections = /* @__PURE__ */ new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
      for (const anchor of targetLinks) {
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }
        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
        if (isVisible(observableSection)) {
          this._targetLinks.set(decodeURI(anchor.hash), anchor);
          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }
    _process(target) {
      if (this._activeTarget === target) {
        return;
      }
      this._clearActiveClass(this._config.target);
      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);
      this._activateParents(target);
      EventHandler$1.trigger(this._element, EVENT_ACTIVATE, { relatedTarget: target });
    }
    _activateParents(target) {
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }
      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }
    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = ScrollSpy.getOrCreateInstance(this, config2);
        if (typeof config2 !== "string") {
          return;
        }
        if (data2[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2]();
      });
    }
  }
  EventHandler$1.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });
  defineJQueryPlugin(ScrollSpy);
  const NAME$1 = "tab";
  const DATA_KEY$2 = "bs.tab";
  const EVENT_KEY$3 = `.${DATA_KEY$2}`;
  const EVENT_HIDE$2 = `hide${EVENT_KEY$3}`;
  const EVENT_HIDDEN$2 = `hidden${EVENT_KEY$3}`;
  const EVENT_SHOW$2 = `show${EVENT_KEY$3}`;
  const EVENT_SHOWN$2 = `shown${EVENT_KEY$3}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$3}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$3}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$3}`;
  const ARROW_LEFT_KEY = "ArrowLeft";
  const ARROW_RIGHT_KEY = "ArrowRight";
  const ARROW_UP_KEY = "ArrowUp";
  const ARROW_DOWN_KEY = "ArrowDown";
  const HOME_KEY = "Home";
  const END_KEY = "End";
  const CLASS_NAME_ACTIVE = "active";
  const CLASS_NAME_FADE$1 = "fade";
  const CLASS_NAME_SHOW$1 = "show";
  const CLASS_DROPDOWN = "dropdown";
  const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
  const SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
  const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
  const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  const SELECTOR_OUTER = ".nav-item, .list-group-item";
  const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
  const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE$1}`;
  const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
  let Tab$1 = class Tab2 extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);
      if (!this._parent) {
        return;
      }
      this._setInitialAttributes(this._parent, this._getChildren());
      EventHandler$1.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
    }
    // Getters
    static get NAME() {
      return NAME$1;
    }
    // Public
    show() {
      const innerElem = this._element;
      if (this._elemIsActive(innerElem)) {
        return;
      }
      const active = this._getActiveElem();
      const hideEvent = active ? EventHandler$1.trigger(active, EVENT_HIDE$2, { relatedTarget: innerElem }) : null;
      const showEvent = EventHandler$1.trigger(innerElem, EVENT_SHOW$2, { relatedTarget: active });
      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }
      this._deactivate(active, innerElem);
      this._activate(innerElem, active);
    }
    // Private
    _activate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.add(CLASS_NAME_ACTIVE);
      this._activate(SelectorEngine.getElementFromSelector(element));
      const complete = () => {
        if (element.getAttribute("role") !== "tab") {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }
        element.removeAttribute("tabindex");
        element.setAttribute("aria-selected", true);
        this._toggleDropDown(element, true);
        EventHandler$1.trigger(element, EVENT_SHOWN$2, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();
      this._deactivate(SelectorEngine.getElementFromSelector(element));
      const complete = () => {
        if (element.getAttribute("role") !== "tab") {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }
        element.setAttribute("aria-selected", false);
        element.setAttribute("tabindex", "-1");
        this._toggleDropDown(element, false);
        EventHandler$1.trigger(element, EVENT_HIDDEN$2, { relatedTarget: relatedElem });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const children = this._getChildren().filter((element) => !isDisabled(element));
      let nextActiveElement;
      if ([HOME_KEY, END_KEY].includes(event.key)) {
        nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
      } else {
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
      }
      if (nextActiveElement) {
        nextActiveElement.focus({ preventScroll: true });
        Tab2.getOrCreateInstance(nextActiveElement).show();
      }
    }
    _getChildren() {
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }
    _getActiveElem() {
      return this._getChildren().find((child) => this._elemIsActive(child)) || null;
    }
    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, "role", "tablist");
      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }
    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);
      const isActive = this._elemIsActive(child);
      const outerElem = this._getOuterElement(child);
      child.setAttribute("aria-selected", isActive);
      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, "role", "presentation");
      }
      if (!isActive) {
        child.setAttribute("tabindex", "-1");
      }
      this._setAttributeIfNotExists(child, "role", "tab");
      this._setInitialAttributesOnTargetPanel(child);
    }
    _setInitialAttributesOnTargetPanel(child) {
      const target = SelectorEngine.getElementFromSelector(child);
      if (!target) {
        return;
      }
      this._setAttributeIfNotExists(target, "role", "tabpanel");
      if (child.id) {
        this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
      }
    }
    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);
      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }
      const toggle = (selector, className) => {
        const element2 = SelectorEngine.findOne(selector, outerElem);
        if (element2) {
          element2.classList.toggle(className, open);
        }
      };
      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute("aria-expanded", open);
    }
    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }
    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    }
    // Try to get the inner element (usually the .nav-link)
    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    }
    // Try to get the outer element (usually the .nav-item)
    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Tab2.getOrCreateInstance(this);
        if (typeof config2 !== "string") {
          return;
        }
        if (data2[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data2[config2]();
      });
    }
  };
  EventHandler$1.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE$1, function(event) {
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    Tab$1.getOrCreateInstance(this).show();
  });
  EventHandler$1.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab$1.getOrCreateInstance(element);
    }
  });
  defineJQueryPlugin(Tab$1);
  const NAME = "toast";
  const DATA_KEY$1 = "bs.toast";
  const EVENT_KEY$2 = `.${DATA_KEY$1}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY$2}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY$2}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY$2}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY$2}`;
  const EVENT_HIDE$1 = `hide${EVENT_KEY$2}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$2}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$2}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$2}`;
  const CLASS_NAME_FADE = "fade";
  const CLASS_NAME_HIDE = "hide";
  const CLASS_NAME_SHOW = "show";
  const CLASS_NAME_SHOWING = "showing";
  const DefaultType = {
    animation: "boolean",
    autohide: "boolean",
    delay: "number"
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5e3
  };
  let Toast$1 = class Toast2 extends BaseComponent {
    constructor(element, config2) {
      super(element, config2);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;
      this._setListeners();
    }
    // Getters
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }
    // Public
    show() {
      const showEvent = EventHandler$1.trigger(this._element, EVENT_SHOW$1);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._clearTimeout();
      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }
      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);
        EventHandler$1.trigger(this._element, EVENT_SHOWN$1);
        this._maybeScheduleHide();
      };
      this._element.classList.remove(CLASS_NAME_HIDE);
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    hide() {
      if (!this.isShown()) {
        return;
      }
      const hideEvent = EventHandler$1.trigger(this._element, EVENT_HIDE$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE);
        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        EventHandler$1.trigger(this._element, EVENT_HIDDEN$1);
      };
      this._element.classList.add(CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    dispose() {
      this._clearTimeout();
      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }
      super.dispose();
    }
    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    }
    // Private
    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }
      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }
      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case "mouseover":
        case "mouseout": {
          this._hasMouseInteraction = isInteracting;
          break;
        }
        case "focusin":
        case "focusout": {
          this._hasKeyboardInteraction = isInteracting;
          break;
        }
      }
      if (isInteracting) {
        this._clearTimeout();
        return;
      }
      const nextElement = event.relatedTarget;
      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }
      this._maybeScheduleHide();
    }
    _setListeners() {
      EventHandler$1.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
      EventHandler$1.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
      EventHandler$1.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
      EventHandler$1.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
    }
    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    // Static
    static jQueryInterface(config2) {
      return this.each(function() {
        const data2 = Toast2.getOrCreateInstance(this, config2);
        if (typeof config2 === "string") {
          if (typeof data2[config2] === "undefined") {
            throw new TypeError(`No method named "${config2}"`);
          }
          data2[config2](this);
        }
      });
    }
  };
  enableDismissTrigger(Toast$1);
  defineJQueryPlugin(Toast$1);
  const BootstrapComponents = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    Alert: Alert$1,
    Button: Button$1,
    Carousel: Carousel$1,
    Collapse: Collapse$1,
    Dropdown: Dropdown$1,
    Modal: Modal$1,
    Offcanvas: Offcanvas$1,
    Popover: Popover$1,
    ScrollSpy,
    Tab: Tab$1,
    Toast: Toast$1,
    Tooltip: Tooltip$1
  }, Symbol.toStringTag, { value: "Module" }));
  const version = "5.3.8-2";
  const packageJson = {
    version
  };
  class DynamicObserver {
    observer = null;
    componentClasses = [];
    // Stores registered components
    debounceTimer = null;
    debounceDelay = 100;
    // milliseconds
    addedNodes = /* @__PURE__ */ new Set();
    constructor() {
      if (DynamicObserver.instance) {
        return DynamicObserver.instance;
      }
      DynamicObserver.instance = this;
      this.startObserving();
    }
    /**
     * Registers a component based on its selector.
     */
    add(componentClass) {
      const selector = componentClass.selector;
      if (!selector) {
        console.error(`Component ${componentClass.name} must provide a 'selector' via static getter.`);
        return;
      } else if (this.componentClasses.includes(componentClass)) {
        return;
      }
      this.componentClasses.push(componentClass);
      const elements = SelectorEngine.find(selector);
      elements.forEach((element) => {
        if (!componentClass.getInstance(element)) {
          componentClass.getOrCreateInstance(element);
        }
      });
    }
    /**
     * Initializes existing components on the page.
     */
    initializeExisting() {
      this.componentClasses.forEach((componentClass) => {
        SelectorEngine.find(componentClass.selector).forEach((element) => {
          if (!componentClass.getInstance(element)) {
            componentClass.getOrCreateInstance(element);
          }
        });
      });
    }
    /**
     * Starts observing the DOM for changes.
     * This method is automatically called in the constructor.
     */
    startObserving() {
      this.initializeExisting();
      this.observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.addedNodes.add(node);
              } else if (node.hasChildNodes()) {
                node.childNodes.forEach((child) => {
                  if (child.nodeType === Node.ELEMENT_NODE) {
                    this.addedNodes.add(child);
                  }
                });
              }
            });
          }
        });
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
          Array.from(this.addedNodes).forEach((node) => {
            this.initializeNode(node);
          });
          this.addedNodes.clear();
        }, this.debounceDelay);
      });
      const config2 = { childList: true, subtree: true };
      this.observer.observe(document.body, config2);
      this.setupDisposalHandling();
    }
    /**
     * Sets up MutationObserver for handling component disposals.
     */
    setupDisposalHandling() {
      const disposalObserver = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
            mutation.removedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.disposeNode(node);
              }
            });
          }
        });
      });
      const config2 = { childList: true, subtree: true };
      disposalObserver.observe(document.body, config2);
    }
    /**
     * Disposes of component instances within a removed node.
     */
    disposeNode(node) {
      this.componentClasses.forEach((componentClass) => {
        const selector = componentClass.selector;
        if (node.matches(selector)) {
          const instance = componentClass.getInstance(node);
          if (instance) {
            instance.dispose();
          }
        }
        SelectorEngine.find(selector, node).forEach((child) => {
          const instance = componentClass.getInstance(child);
          if (instance) {
            instance.dispose();
          }
        });
      });
    }
    /**
     * Stops observing the DOM.
     */
    stopObserving() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
    /**
     * Initializes a single node and its descendants.
     */
    initializeNode(node) {
      this.componentClasses.forEach((componentClass) => {
        const selector = componentClass.selector;
        if (node.matches(selector)) {
          if (!componentClass.getInstance(node)) {
            componentClass.getOrCreateInstance(node);
          }
        }
        SelectorEngine.find(selector, node).forEach((child) => {
          if (!componentClass.getInstance(child)) {
            componentClass.getOrCreateInstance(child);
          }
        });
      });
    }
    /**
     * Retrieves the singleton instance.
     */
    static getInstance() {
      if (!DynamicObserver.instance) {
        DynamicObserver.instance = new DynamicObserver();
      }
      return DynamicObserver.instance;
    }
  }
  const dynamicObserver = DynamicObserver.getInstance();
  const _Alert = class _Alert extends Alert$1 {
  };
  __publicField(_Alert, "selector", ".alert");
  dynamicObserver.add(_Alert);
  let Alert = _Alert;
  const CLASS_LOADING = "loading";
  const _Button = class _Button extends Button$1 {
    originalContent;
    loadingText;
    spinner;
    constructor(...args) {
      super(...args);
      this._initializeLoader();
      this._element.showLoader = this.showLoader.bind(this);
      this._element.hideLoader = this.hideLoader.bind(this);
    }
    _initializeLoader() {
      this.originalContent = this._element.innerHTML;
      this.loadingText = this._element.getAttribute("data-bs-loader").trim().toLowerCase() != "true" ? this._element.getAttribute("data-bs-loader") : "";
    }
    showLoader() {
      if (!this.spinner) {
        this.spinner = this.createSpinner();
      }
      let _loadingText = this.loadingText !== "" ? this.loadingText : "Loading...";
      const loadingTextNode = this.createLoaderText(_loadingText);
      if (this.loadingText === "") {
        loadingTextNode.classList.add("visually-hidden");
      }
      this._element.innerHTML = "";
      this._element.appendChild(document.createTextNode(" "));
      this._element.appendChild(this.spinner);
      this._element.appendChild(loadingTextNode);
      this._element.appendChild(document.createTextNode(" "));
      this._element.setAttribute("aria-label", _loadingText);
      this._element.classList.add(CLASS_LOADING);
      this._element.setAttribute("aria-busy", "true");
      this._element.disabled = true;
    }
    hideLoader() {
      if (!this._element.classList.contains(CLASS_LOADING)) {
        return;
      }
      this.spinner.remove();
      this.spinner = null;
      this._element.innerHTML = this.originalContent;
      this._element.classList.remove(CLASS_LOADING);
      this._element.disabled = false;
      this._element.removeAttribute("aria-busy");
      this._element.removeAttribute("aria-label");
    }
    createSpinner() {
      const spinner = document.createElement("span");
      spinner.classList.add("spinner-border", "spinner-border-sm");
      spinner.setAttribute("aria-hidden", "true");
      return spinner;
    }
    createLoaderText(text) {
      const loaderText = document.createElement("span");
      loaderText.setAttribute("role", "status");
      loaderText.classList.add("ms-2");
      loaderText.textContent = text;
      return loaderText;
    }
  };
  __publicField(_Button, "selector", "[data-bs-loader]");
  dynamicObserver.add(_Button);
  let Button = _Button;
  const _Carousel = class _Carousel extends Carousel$1 {
  };
  __publicField(_Carousel, "selector", '[data-bs-ride="carousel"]');
  dynamicObserver.add(_Carousel);
  let Carousel = _Carousel;
  const _Collapse = class _Collapse extends Collapse$1 {
  };
  __publicField(_Collapse, "selector", '[data-bs-toggle="collapse"]');
  dynamicObserver.add(_Collapse);
  let Collapse = _Collapse;
  const _Dropdown = class _Dropdown extends Dropdown$1 {
    constructor(element, config2) {
      super(element, config2);
      if (this._element.getAttribute("data-bs-trigger") === "hover") {
        this._addHoverListeners();
      }
    }
    _addHoverListeners() {
      const commonParent = this._element.closest(".dropdown") || this._element.parentNode;
      this._hoverParent = commonParent;
      EventHandler$1.on(commonParent, "mouseenter", () => this.show());
      EventHandler$1.on(commonParent, "mouseleave", (event) => this._onMouseLeave(event, commonParent));
    }
    // Handler for mouseleave to check if we left the entire dropdown area
    _onMouseLeave(event, commonParent) {
      const relatedTarget = event.relatedTarget;
      if (!relatedTarget || !commonParent.contains(relatedTarget)) {
        this.hideWithDelay();
      }
    }
    hideWithDelay() {
      setTimeout(() => {
        if (!this._element.matches(":hover") && !this._menu.matches(":hover")) {
          this.hide();
        }
      }, 50);
    }
    dispose() {
      if (this._hoverParent) {
        EventHandler$1.off(this._hoverParent, "mouseenter");
        EventHandler$1.off(this._hoverParent, "mouseleave");
      }
      super.dispose();
    }
  };
  __publicField(_Dropdown, "selector", '[data-bs-toggle="dropdown"]');
  dynamicObserver.add(_Dropdown);
  let Dropdown = _Dropdown;
  const EVENT_KEY$1 = `.bs.modal`;
  const EVENT_HIDE = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN = `shown${EVENT_KEY$1}`;
  const EVENT_NAV_CLOSE = "close.bs.nav";
  const EVENT_NAV_OPEN = "open.bs.nav";
  const EVENT_NAV_OPENED = "opened.bs.nav";
  const EVENT_NAV_BACK = "back.bs.nav";
  const EVENT_NAV_BACKING = "backing.bs.nav";
  const EVENT_NAV_BACKED = "backed.bs.nav";
  const EVENT_NAV_FORWARD = "forward.bs.nav";
  const EVENT_NAV_FORWARDING = "forwarding.bs.nav";
  const EVENT_NAV_FORWARDED = "forwarded.bs.nav";
  const CLASS_NAVIGATION = "modal-navigation";
  const CLASS_NAVIGATION_HAS_STACK = "modal-navigation-stacked";
  const CLASS_NAVIGATION_TRANSITION = "modal-animation-transition";
  const CLASS_NAVIGATION_TRANSITION_IN = "modal-animation-transition-in";
  const CLASS_NAVIGATION_BACK = "modal-animation-direction-back";
  const CLASS_NAVIGATION_FORWARD = "modal-animation-direction-forward";
  const STATE_OPENED = "open";
  const STATE_CLOSED = "closed";
  const modalNavigationMap = /* @__PURE__ */ new WeakMap();
  class Navigation {
    Modal;
    Template;
    Animation;
    options = {
      animation: "slide",
      backButton: {
        text: "",
        // &larr;
        disabled: false
      },
      closeButton: {
        text: "",
        // &times;
        disabled: false
      }
    };
    stack = [];
    refs = {};
    events = {};
    state = STATE_CLOSED;
    constructor(options = {}) {
      this.options = { ...structuredClone(this.options), ...options };
      this.Template = new ModalTemplate(this.options);
    }
    setBaseModal(Modal2) {
      if (modalNavigationMap.has(Modal2._element)) {
        throw new Error("A Navigation instance is already attached to this modal.");
      }
      this.Modal = Modal2;
      const animationObj = animationsMap[this.options.animation] ?? animationsMap.slide;
      this.Animation = new animationObj(this.Modal);
      this.Modal._element.classList.add(CLASS_NAVIGATION);
      this.Modal._element.classList.add(this.Animation.className);
      this.events.hidden = () => this.close();
      this.events.shown = () => EventHandler$1.trigger(document, EVENT_NAV_OPENED, { stack: this.refs });
      this.events.click = (e) => this.relClickEventListener(e);
      EventHandler$1.on(this.Modal._element, EVENT_HIDDEN, this.events.hidden);
      EventHandler$1.on(this.Modal._element, EVENT_SHOWN, this.events.shown);
      EventHandler$1.on(this.Modal._element, "click", "[rel]", this.events.click);
      modalNavigationMap.set(this.Modal._element, this);
    }
    relClickEventListener(e) {
      e.preventDefault();
      const elementWithRel = e.target.closest("[rel]");
      if (!elementWithRel) {
        return;
      }
      const rel = elementWithRel.getAttribute("rel");
      if (rel == "back") {
        this.pop();
      } else if (rel == "close") {
        this.Modal.hide();
      } else {
        this.findAndPushModal(rel);
      }
    }
    findAndPushModal(reference2) {
      if (!reference2) {
        return;
      }
      const refId = reference2.replace(/^#/, "");
      if (this.refs[refId]) {
        this.push(this.refs[refId]);
        return;
      }
      if (!reference2.startsWith(".") && !reference2.startsWith("#")) {
        reference2 = `#${reference2}`;
      }
      const modalElement = document.querySelector(reference2);
      if (!modalElement) {
        throw new Error(`Invalid modal rel, ${reference2} doesnt exist.`);
      }
      let modal = Modal.getInstance(modalElement);
      if (null === modal) {
        modal = new Modal(modalElement);
      }
      this.push(modal);
    }
    /**
     * 
     */
    push(childModal) {
      if (this.stack.length == 0) {
        this.setBaseModal(childModal);
      }
      const existingModalStackIndex = this.stack.findIndex(([, , , { _element }]) => _element === childModal._element);
      if (false === this.options.backButton.disabled && existingModalStackIndex !== -1) {
        throw new Error("Modal is already in the stack. Thus not allowed to be pushed again since BackButton is enabled.");
      } else if (existingModalStackIndex !== -1) {
        const [existingHeader, existingBody, existingFooter, existingModal, existingForm] = this.stack[existingModalStackIndex];
        this.stack.splice(existingModalStackIndex, 1);
        this.stack.push([existingHeader, existingBody, existingFooter, existingModal, existingForm]);
      } else {
        const form = childModal._element.querySelector(".modal-content > form");
        this.stack.push([
          childModal._element.querySelector(".modal-header"),
          childModal._element.querySelector(".modal-body"),
          childModal._element.querySelector(".modal-footer"),
          childModal,
          form
          // Store form element or null
        ]);
      }
      if (!this.refs[childModal._element.id]) {
        this.refs[childModal._element.id] = childModal;
      }
      if (this.options.closeButton.disabled) {
        childModal._element.querySelector("button[rel=close]")?.remove();
      }
      return new Promise((resolve) => {
        if (this.stack.length > 1) {
          const { outPromise, inPromise } = this.replace(this.stack[this.stack.length - 1]);
          outPromise.then(() => {
            EventHandler$1.trigger(document, EVENT_NAV_FORWARDING, { stack });
          });
          inPromise.then(() => {
            EventHandler$1.trigger(document, EVENT_NAV_FORWARDED, { stack });
            resolve();
          });
          const stack = this.stack.map(([, , , { _element: { id } }]) => this.refs[id]);
          EventHandler$1.trigger(document, EVENT_NAV_FORWARD, { stack });
        } else {
          resolve();
        }
      });
    }
    /**
     *  
     */
    pop() {
      const currentStack = this.stack.pop();
      const prevStack = this.stack[this.stack.length - 1];
      if (!currentStack) {
        return Promise.resolve();
      } else if (!prevStack) {
        return new Promise((resolve) => {
          this.Modal.hide();
          resolve();
        });
      }
      return new Promise((resolve) => {
        const { outPromise, inPromise } = this.replace(prevStack, true);
        outPromise.then(() => {
          EventHandler$1.trigger(document, EVENT_NAV_BACKING, { stack });
        });
        inPromise.then(() => {
          this.restoreOriginalModal(currentStack);
          EventHandler$1.trigger(document, EVENT_NAV_BACKED, { stack });
          EventHandler$1.trigger(currentStack[3]._element, EVENT_HIDDEN);
          resolve();
        });
        const stack = this.stack.map(([, , , { _element: { id } }]) => this.refs[id]);
        EventHandler$1.trigger(document, EVENT_NAV_BACK, { stack });
        EventHandler$1.trigger(currentStack[3]._element, EVENT_HIDE);
      });
    }
    restoreOriginalModal(stack) {
      const [currentHeader, currentBody, currentFooter, currentModal, currentForm] = stack;
      const currentBodyContent = currentModal._element.querySelector(".modal-content");
      currentBodyContent.innerHTML = "";
      if (currentForm) {
        currentBodyContent.appendChild(currentForm);
      } else {
        currentBodyContent.append(currentHeader ?? "", currentBody, currentFooter ?? "");
      }
      return stack;
    }
    close() {
      this.state = STATE_CLOSED;
      const pops = [];
      while (this.stack.length > 0) {
        pops.push(this.pop());
      }
      Promise.all(pops).then(() => {
        EventHandler$1.trigger(document, EVENT_NAV_CLOSE, { stack: Object.values(this.refs) });
        Object.values(this.refs).forEach((modal) => {
          if (modal && modal._element && modal._element.parentNode && !modal._fromDOM) {
            modal._element.remove();
          }
        });
        if (this.Modal && this.events) {
          EventHandler$1.off(this.Modal._element, EVENT_HIDDEN, this.events.hidden);
          EventHandler$1.off(this.Modal._element, EVENT_SHOWN, this.events.shown);
          EventHandler$1.off(this.Modal._element, "click", "[rel]", this.events.click);
        }
        if (this.Modal) {
          modalNavigationMap.delete(this.Modal._element);
        }
        this.Modal = null;
        this.stack = [];
        this.refs = {};
        this.state = STATE_CLOSED;
      });
    }
    show() {
      this.state = STATE_OPENED;
      EventHandler$1.trigger(document, EVENT_NAV_OPEN, { stack: this.stack });
      this.Modal.show();
    }
    /**
     *  Actually inject the content (header, body, footer)
     */
    replace(to, _back = false) {
      const [newHeader, newBody, newFooter, Modal2, newForm] = to;
      EventHandler$1.trigger(Modal2._element, EVENT_SHOW);
      let outPromise;
      if (this.state === STATE_CLOSED) {
        outPromise = Promise.resolve();
      } else {
        outPromise = this.Animation.from(to).out(_back);
      }
      const inPromise = outPromise.then(() => {
        return this.handleContent(newHeader, newBody, newFooter, Modal2, newForm);
      }).then(() => {
        return this.Animation.in(_back);
      }).then(() => {
        EventHandler$1.trigger(Modal2._element, EVENT_SHOWN);
      });
      return { outPromise, inPromise };
    }
    addEventListener(...props) {
      document.addEventListener(...props);
    }
    setStackClass() {
      if (this.stack.length === 1) {
        this.Modal._element.classList.remove(CLASS_NAVIGATION_HAS_STACK);
      } else if (!this.Modal._element.classList.contains(CLASS_NAVIGATION_HAS_STACK)) {
        this.Modal._element.classList.add(CLASS_NAVIGATION_HAS_STACK);
      }
    }
    handleContent(newHeader, newBody, newFooter, newModal, newForm) {
      const modalContent = this.Modal._element.querySelector(".modal-content");
      const currentForm = modalContent.querySelector(":scope > form");
      if (newForm && !currentForm) {
        modalContent.innerHTML = "";
        modalContent.appendChild(newForm);
        const formElement = modalContent.querySelector("form");
        if (newHeader) formElement.appendChild(newHeader);
        formElement.appendChild(newBody);
        if (newFooter) formElement.appendChild(newFooter);
      } else if (!newForm && currentForm) {
        modalContent.innerHTML = "";
        if (newHeader) modalContent.appendChild(newHeader);
        modalContent.appendChild(newBody);
        if (newFooter) modalContent.appendChild(newFooter);
      } else if (newForm && currentForm) {
        modalContent.replaceChild(newForm, currentForm);
      } else {
        this.handleHeader(newHeader, newModal);
        this.handleBody(newBody);
        this.handleFooter(newFooter);
      }
      if (newHeader && this.stack.length > 1) {
        const shouldHaveBackButton = !newModal._config?.backButton?.disabled && !this.options.backButton?.disabled;
        if (shouldHaveBackButton && !newHeader.querySelector("button[rel=back]")) {
          newHeader.prepend(this.Template.backButton());
        }
      }
      this.setStackClass();
      return new Promise((resolve) => resolve());
    }
    handleHeader(newHeader, newModal) {
      const currentContainer = this.Modal._element.querySelector(".modal-body").parentNode;
      const currentHeader = this.Modal._element.querySelector(".modal-header");
      const backButton = newHeader?.querySelector("button[rel=back]");
      const shouldHaveBackButton = this.stack.length > 1 && !newModal._config?.backButton?.disabled && !this.options.backButton?.disabled;
      if (newHeader) {
        if (this.stack.length > 1 && shouldHaveBackButton && !backButton) {
          newHeader.prepend(this.Template.backButton());
        } else if (!shouldHaveBackButton && backButton) {
          backButton.remove();
        }
        if (currentHeader) {
          currentContainer.replaceChild(newHeader, currentHeader);
        } else {
          currentContainer.append(newHeader);
        }
      } else if (currentHeader) {
        currentHeader.remove();
      }
    }
    handleBody(newBody) {
      const currentContainer = this.Modal._element.querySelector(".modal-body").parentNode;
      const currentBody = this.Modal._element.querySelector(".modal-body");
      currentContainer.replaceChild(newBody, currentBody);
    }
    handleFooter(newFooter) {
      const currentContainer = this.Modal._element.querySelector(".modal-body").parentNode;
      const currentFooter = this.Modal._element.querySelector(".modal-footer");
      if (newFooter) {
        if (currentFooter) {
          currentContainer.replaceChild(newFooter, currentFooter);
        } else {
          currentContainer.append(newFooter);
        }
      } else if (currentFooter) {
        currentFooter.remove();
      }
    }
  }
  class Animation {
    Modal;
    stack;
    constructor(modal) {
      this.Modal = modal;
    }
    from(toStack) {
      this.stack = toStack;
      return this;
    }
    out = (directionBack = false, intoModal) => new Promise((resolve) => resolve());
    in = (directionBack = false) => new Promise((resolve) => resolve());
    /**
     * 
     */
    createFakeModalContent() {
      let cssStyle = "visibility: hidden; z-index: -1;";
      const [newHeader, newBody, newFooter] = this.stack;
      if (newBody) {
        newBody.removeAttribute("style");
      }
      let fakeContainer = document.createElement("div");
      fakeContainer.style.cssText = cssStyle;
      let fakeBody = newBody ? newBody.cloneNode(true) : document.createElement("div");
      let fakeHeader = newHeader?.cloneNode(true);
      let fakeFooter = newFooter?.cloneNode(true);
      fakeContainer.append(fakeHeader ?? "", fakeBody, fakeFooter ?? "");
      return fakeContainer;
    }
    /**
     * 
     */
    calculateFakeModalHeight(fakeModalContent) {
      const container = this.Modal._element.querySelector(".modal-body").parentNode;
      container.append(fakeModalContent);
      const fakeModalHeight = fakeModalContent.offsetHeight;
      fakeModalContent.remove();
      return fakeModalHeight;
    }
    getAnimationDuration = (element) => {
      let computedStyle = getComputedStyle(element ?? this.Modal._element.querySelector(".modal-body"));
      return parseFloat(
        computedStyle["animation-duration"] ?? computedStyle["transition-duration"]
      ) * 1e3;
    };
  }
  class ModalNavigationTransitionSlide extends Animation {
    className = "modal-animation-slide";
    out = (directionBack = false) => new Promise((resolve) => {
      const animationDirection = directionBack ? CLASS_NAVIGATION_BACK : CLASS_NAVIGATION_FORWARD;
      const ModalBody = this.Modal._element.querySelector(".modal-body");
      if (!ModalBody || !ModalBody.parentNode) {
        resolve();
        return;
      }
      const ModalContainer = ModalBody.parentNode;
      const currentContainerHeight = ModalContainer.offsetHeight;
      ModalContainer.style.height = `${currentContainerHeight}px`;
      const hiddenFakeModalHeight = this.calculateFakeModalHeight(
        this.createFakeModalContent()
      );
      this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION, animationDirection);
      ModalContainer.style.height = `${hiddenFakeModalHeight}px`;
      const transitionDuration = this.getAnimationDuration();
      setTimeout(() => resolve(), transitionDuration);
    });
    in = (directionBack) => new Promise((resolve) => {
      const animationDirection = directionBack ? CLASS_NAVIGATION_BACK : CLASS_NAVIGATION_FORWARD;
      this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
      this.Modal.handleUpdate();
      const transitionDuration = this.getAnimationDuration();
      setTimeout(() => {
        this.Modal._element.classList.remove(CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN, animationDirection);
        const modalBody = this.Modal._element.querySelector(".modal-body");
        if (modalBody && modalBody.parentNode) {
          modalBody.parentNode.removeAttribute("style");
        }
        resolve();
      }, transitionDuration);
    });
  }
  class ModalNavigationTransitionMorph extends Animation {
    className = "modal-animation-morph";
    heightMultiplyer = 0.85;
    out = (directionBack = false) => new Promise((resolve) => {
      const ModalBody = this.Modal._element.querySelector(".modal-body");
      if (!ModalBody || !ModalBody.parentNode) {
        resolve();
        return;
      }
      const ModalContainer = ModalBody.parentNode;
      const currentContainerHeight = ModalContainer.offsetHeight;
      ModalContainer.style.height = `${currentContainerHeight}px`;
      this.Modal._element.classList.add(this.className, CLASS_NAVIGATION_TRANSITION);
      setTimeout(() => ModalContainer.style.height = `${currentContainerHeight * this.heightMultiplyer}px`, 10);
      const transitionDuration = this.getAnimationDuration();
      setTimeout(() => resolve(), transitionDuration);
    });
    in = (directionBack) => new Promise((resolve) => {
      const ModalBody = this.Modal._element.querySelector(".modal-body");
      const ModalContainer = ModalBody.parentNode;
      const hiddenFakeModalHeight = this.calculateFakeModalHeight(
        this.createFakeModalContent()
      );
      this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
      ModalContainer.style.height = `${hiddenFakeModalHeight}px`;
      this.Modal.handleUpdate();
      const transitionDuration = this.getAnimationDuration();
      setTimeout(() => {
        this.Modal._element.classList.remove(Animation.className, CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN);
        if (ModalContainer) {
          ModalContainer.removeAttribute("style");
        }
        resolve();
      }, transitionDuration);
    });
  }
  const animationsMap = {
    slide: ModalNavigationTransitionSlide,
    morph: ModalNavigationTransitionMorph
  };
  const DATA_KEY = "bs.modal";
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_SUBMIT = `submit${EVENT_KEY}`;
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="modal"]';
  class Modal extends Modal$1 {
    static selector = SELECTOR_DATA_TOGGLE;
    constructor(elementOrOptions) {
      let modalElement;
      let options = {};
      let fromDOM = true;
      if (typeof elementOrOptions === "string") {
        modalElement = document.getElementById(elementOrOptions);
        if (!modalElement) {
          throw new Error("Element not found.");
        }
      } else if (elementOrOptions instanceof HTMLElement) {
        modalElement = elementOrOptions;
      } else if (typeof elementOrOptions === "object") {
        modalElement = Modal.generate(elementOrOptions);
        options = elementOrOptions;
        fromDOM = false;
      } else {
        throw new Error("Invalid parameter: Must provide an element ID or options object.");
      }
      super(modalElement, options);
      this._fromDOM = fromDOM;
      this.registerEventListeners();
    }
    addEventListener(...props) {
      this._element.addEventListener(...props);
    }
    registerEventListeners() {
      this._element.querySelectorAll("form").forEach((_form) => {
        if (!_form.hasAttribute("data-modal-listener")) {
          _form.addEventListener("submit", (e) => {
            const submitEvent = EventHandler$1.trigger(this._element, EVENT_SUBMIT, { target: _form });
            if (submitEvent.defaultPrevented) {
              e.preventDefault();
            }
          });
          _form.setAttribute("data-modal-listener", "true");
        }
      });
      this.addEventListener("hidden.bs.modal", () => {
        if (!this._fromDOM) {
          this.remove();
        }
      });
    }
    remove() {
      this._element.remove();
    }
    static generate(options = {}) {
      const {
        id = `modal-${Math.random().toString(36).slice(2, 9)}`,
        title = "",
        header = "",
        content = "",
        footerButtons = [],
        // Array of footer button configurations
        headerButtons = [],
        // Array of header button configurations
        isStatic = false,
        size = "lg",
        animation = "fade",
        scrollable = false,
        closeButton = {
          disabled: false,
          text: ""
          // &times;
        },
        backButton = {
          disabled: false,
          text: ""
          // &larr;
        }
      } = options;
      let className = options["class"] ?? "";
      const Template = new ModalTemplate(options);
      const modalHTML = Template.generate(id, { title, header }, content, footerButtons, headerButtons, className, isStatic, size, animation, scrollable);
      const modalFragment = document.createRange().createContextualFragment(modalHTML);
      document.body.append(modalFragment);
      let modalElement = document.querySelector(`#${id}`);
      return modalElement;
    }
  }
  class ModalTemplate {
    options = {
      closeButton: {
        disabled: false,
        text: ""
        // &times;
      },
      backButton: {
        disabled: false,
        text: ""
        // &larr;
      }
    };
    constructor(options) {
      this.options = { ...structuredClone(this.options), ...options };
    }
    generate = (id, headerObj, content, footerButtons, headerButtons, className, isStatic, size, animation, scrollable) => {
      const sizeClass = size ? `modal-${size}` : "";
      const animationClass = animation ? ` ${animation}` : "";
      let processedContent = content;
      let formAttributes = "";
      let hasForm = false;
      if (content) {
        const formMatch = content.match(/<form([^>]*)>([\s\S]*?)<\/form>/i);
        if (formMatch) {
          formAttributes = formMatch[1] || "";
          processedContent = formMatch[2] || "";
          hasForm = true;
        }
      }
      return `
            <div id="${id}" class="modal${animationClass} ${className}" tabindex="-1" role="dialog"${isStatic ? ` data-bs-backdrop="static"` : ""}>
                <div class="modal-dialog ${sizeClass} modal-dialog-centered${scrollable ? ` modal-dialog-scrollable` : ""}" role="document">
                    <div class="modal-content">
                        ${hasForm ? `<form${formAttributes ? " " + formAttributes : ""}>` : ""}
                            ${this.header(headerObj, headerButtons, isStatic)}

                            <div class="modal-body">
                                ${processedContent}
                            </div>

                            ${this.footer(footerButtons)}
                        ${hasForm ? "</form>" : ""}
                    </div>
                </div>
            </div>
        `;
    };
    header = (headerObj, buttons = [], isStatic = false) => {
      const { title, header } = headerObj;
      let headerHTML = "";
      if (header) {
        headerHTML += header;
      } else if (title) {
        headerHTML += `
                <h4 class="modal-title">${title}</h4>
            `;
      }
      const buttonElements = buttons.map((button) => {
        if (typeof button === "string") {
          return button;
        }
        const buttonAttributes = Object.keys(button).filter((key) => key !== "text" && key !== "class").map((key) => `${key}="${button[key]}"`).join("");
        return `
                <button class="btn ${button.class ? button.class : "btn-secondary"}" ${buttonAttributes}>
                    ${button.text}
                </button>
            `;
      }).join("");
      if (buttonElements || !this.options.closeButton.disabled) {
        headerHTML += buttonElements;
        if (!this.options.closeButton.disabled || !isStatic) {
          headerHTML += this.closeButton().outerHTML;
        }
      }
      return headerHTML != "" ? `
            <div class="modal-header">
                ${headerHTML}
            </div>
        ` : "";
    };
    footer = (buttons = []) => {
      const buttonElements = buttons.map((button) => {
        if (typeof button === "string") {
          return button;
        }
        button.type = button.type ?? "button";
        const buttonAttributes = Object.keys(button).filter((key) => key !== "text" && key !== "class").map((key) => `${key}="${button[key]}"`);
        const buttonClass = button.class || (button.type === "submit" ? "btn-primary" : "btn-default");
        if (!button.name && !button.rel && button.type !== "submit") {
          buttonAttributes.push(`data-bs-dismiss="modal"`);
        }
        return `
                <button class="btn ${buttonClass}" ${buttonAttributes.join(" ")}>
                    ${button.text}
                </button>
            `;
      }).join("");
      return buttons.length > 0 ? `<div class="modal-footer">${buttonElements}</div>` : "";
    };
    closeButton = () => {
      let closeBtn = document.createElement("button");
      closeBtn.innerHTML = this.options.closeButton.text;
      closeBtn.setAttribute("rel", "close");
      closeBtn.setAttribute("type", "button");
      closeBtn.classList.add("btn", "btn-sm", "btn-default", "btn-icon", "btn-rounded");
      closeBtn.dataset.bsDismiss = "modal";
      return closeBtn;
    };
    backButton = (_cb) => {
      let backButton = document.createElement("button");
      backButton.innerHTML = this.options.backButton.text;
      backButton.setAttribute("rel", "back");
      backButton.setAttribute("type", "button");
      backButton.classList.add("btn", "btn-sm", "btn-default", "btn-icon", "btn-rounded");
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        backButton.blur();
        if (typeof _cb == "function") {
          _cb();
        }
      });
      return backButton;
    };
  }
  const _Offcanvas = class _Offcanvas extends Offcanvas$1 {
  };
  __publicField(_Offcanvas, "selector", '[data-bs-toggle="offcanvas"]');
  dynamicObserver.add(_Offcanvas);
  let Offcanvas = _Offcanvas;
  const _Popover = class _Popover extends Popover$1 {
  };
  __publicField(_Popover, "selector", '[data-bs-toggle="popover"]');
  dynamicObserver.add(_Popover);
  let Popover = _Popover;
  const _Tab = class _Tab extends Tab$1 {
  };
  __publicField(_Tab, "selector", '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]');
  dynamicObserver.add(_Tab);
  let Tab = _Tab;
  const _Toast = class _Toast extends Toast$1 {
  };
  __publicField(_Toast, "selector", ".toast");
  dynamicObserver.add(_Toast);
  let Toast = _Toast;
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  function getAugmentedNamespace(n) {
    if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
    var f = n.default;
    if (typeof f == "function") {
      var a = function a2() {
        var isInstance = false;
        try {
          isInstance = this instanceof a2;
        } catch {
        }
        if (isInstance) {
          return Reflect.construct(f, arguments, this.constructor);
        }
        return f.apply(this, arguments);
      };
      a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, "__esModule", { value: true });
    Object.keys(n).forEach(function(k) {
      var d = Object.getOwnPropertyDescriptor(n, k);
      Object.defineProperty(a, k, d.get ? d : {
        enumerable: true,
        get: function() {
          return n[k];
        }
      });
    });
    return a;
  }
  var tooltip$1 = { exports: {} };
  const require$$0 = /* @__PURE__ */ getAugmentedNamespace(lib);
  var baseComponent$1 = { exports: {} };
  var data$1 = { exports: {} };
  /*!
    * Bootstrap data.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var data = data$1.exports;
  var hasRequiredData;
  function requireData() {
    if (hasRequiredData) return data$1.exports;
    hasRequiredData = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory();
      })(data, (function() {
        const elementMap2 = /* @__PURE__ */ new Map();
        const data2 = {
          set(element, key, instance) {
            if (!elementMap2.has(element)) {
              elementMap2.set(element, /* @__PURE__ */ new Map());
            }
            const instanceMap = elementMap2.get(element);
            if (!instanceMap.has(key) && instanceMap.size !== 0) {
              console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
              return;
            }
            instanceMap.set(key, instance);
          },
          get(element, key) {
            if (elementMap2.has(element)) {
              return elementMap2.get(element).get(key) || null;
            }
            return null;
          },
          remove(element, key) {
            if (!elementMap2.has(element)) {
              return;
            }
            const instanceMap = elementMap2.get(element);
            instanceMap.delete(key);
            if (instanceMap.size === 0) {
              elementMap2.delete(element);
            }
          }
        };
        return data2;
      }));
    })(data$1);
    return data$1.exports;
  }
  var eventHandler$1 = { exports: {} };
  var util$1 = { exports: {} };
  /*!
    * Bootstrap index.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var util = util$1.exports;
  var hasRequiredUtil;
  function requireUtil() {
    if (hasRequiredUtil) return util$1.exports;
    hasRequiredUtil = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        factory(exports3);
      })(util, (function(exports4) {
        const MAX_UID2 = 1e6;
        const MILLISECONDS_MULTIPLIER2 = 1e3;
        const TRANSITION_END2 = "transitionend";
        const parseSelector2 = (selector) => {
          if (selector && window.CSS && window.CSS.escape) {
            selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
          }
          return selector;
        };
        const toType2 = (object) => {
          if (object === null || object === void 0) {
            return `${object}`;
          }
          return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
        };
        const getUID2 = (prefix) => {
          do {
            prefix += Math.floor(Math.random() * MAX_UID2);
          } while (document.getElementById(prefix));
          return prefix;
        };
        const getTransitionDurationFromElement2 = (element) => {
          if (!element) {
            return 0;
          }
          let {
            transitionDuration,
            transitionDelay
          } = window.getComputedStyle(element);
          const floatTransitionDuration = Number.parseFloat(transitionDuration);
          const floatTransitionDelay = Number.parseFloat(transitionDelay);
          if (!floatTransitionDuration && !floatTransitionDelay) {
            return 0;
          }
          transitionDuration = transitionDuration.split(",")[0];
          transitionDelay = transitionDelay.split(",")[0];
          return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER2;
        };
        const triggerTransitionEnd2 = (element) => {
          element.dispatchEvent(new Event(TRANSITION_END2));
        };
        const isElement2 = (object) => {
          if (!object || typeof object !== "object") {
            return false;
          }
          if (typeof object.jquery !== "undefined") {
            object = object[0];
          }
          return typeof object.nodeType !== "undefined";
        };
        const getElement2 = (object) => {
          if (isElement2(object)) {
            return object.jquery ? object[0] : object;
          }
          if (typeof object === "string" && object.length > 0) {
            return document.querySelector(parseSelector2(object));
          }
          return null;
        };
        const isVisible2 = (element) => {
          if (!isElement2(element) || element.getClientRects().length === 0) {
            return false;
          }
          const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
          const closedDetails = element.closest("details:not([open])");
          if (!closedDetails) {
            return elementIsVisible;
          }
          if (closedDetails !== element) {
            const summary = element.closest("summary");
            if (summary && summary.parentNode !== closedDetails) {
              return false;
            }
            if (summary === null) {
              return false;
            }
          }
          return elementIsVisible;
        };
        const isDisabled2 = (element) => {
          if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return true;
          }
          if (element.classList.contains("disabled")) {
            return true;
          }
          if (typeof element.disabled !== "undefined") {
            return element.disabled;
          }
          return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
        };
        const findShadowRoot2 = (element) => {
          if (!document.documentElement.attachShadow) {
            return null;
          }
          if (typeof element.getRootNode === "function") {
            const root = element.getRootNode();
            return root instanceof ShadowRoot ? root : null;
          }
          if (element instanceof ShadowRoot) {
            return element;
          }
          if (!element.parentNode) {
            return null;
          }
          return findShadowRoot2(element.parentNode);
        };
        const noop2 = () => {
        };
        const reflow2 = (element) => {
          element.offsetHeight;
        };
        const getjQuery2 = () => {
          if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
            return window.jQuery;
          }
          return null;
        };
        const DOMContentLoadedCallbacks2 = [];
        const onDOMContentLoaded2 = (callback) => {
          if (document.readyState === "loading") {
            if (!DOMContentLoadedCallbacks2.length) {
              document.addEventListener("DOMContentLoaded", () => {
                for (const callback2 of DOMContentLoadedCallbacks2) {
                  callback2();
                }
              });
            }
            DOMContentLoadedCallbacks2.push(callback);
          } else {
            callback();
          }
        };
        const isRTL2 = () => document.documentElement.dir === "rtl";
        const defineJQueryPlugin2 = (plugin) => {
          onDOMContentLoaded2(() => {
            const $ = getjQuery2();
            if ($) {
              const name = plugin.NAME;
              const JQUERY_NO_CONFLICT = $.fn[name];
              $.fn[name] = plugin.jQueryInterface;
              $.fn[name].Constructor = plugin;
              $.fn[name].noConflict = () => {
                $.fn[name] = JQUERY_NO_CONFLICT;
                return plugin.jQueryInterface;
              };
            }
          });
        };
        const execute2 = (possibleCallback, args = [], defaultValue = possibleCallback) => {
          return typeof possibleCallback === "function" ? possibleCallback.call(...args) : defaultValue;
        };
        const executeAfterTransition2 = (callback, transitionElement, waitForTransition = true) => {
          if (!waitForTransition) {
            execute2(callback);
            return;
          }
          const durationPadding = 5;
          const emulatedDuration = getTransitionDurationFromElement2(transitionElement) + durationPadding;
          let called = false;
          const handler = ({
            target
          }) => {
            if (target !== transitionElement) {
              return;
            }
            called = true;
            transitionElement.removeEventListener(TRANSITION_END2, handler);
            execute2(callback);
          };
          transitionElement.addEventListener(TRANSITION_END2, handler);
          setTimeout(() => {
            if (!called) {
              triggerTransitionEnd2(transitionElement);
            }
          }, emulatedDuration);
        };
        const getNextActiveElement2 = (list, activeElement, shouldGetNext, isCycleAllowed) => {
          const listLength = list.length;
          let index = list.indexOf(activeElement);
          if (index === -1) {
            return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
          }
          index += shouldGetNext ? 1 : -1;
          if (isCycleAllowed) {
            index = (index + listLength) % listLength;
          }
          return list[Math.max(0, Math.min(index, listLength - 1))];
        };
        exports4.defineJQueryPlugin = defineJQueryPlugin2;
        exports4.execute = execute2;
        exports4.executeAfterTransition = executeAfterTransition2;
        exports4.findShadowRoot = findShadowRoot2;
        exports4.getElement = getElement2;
        exports4.getNextActiveElement = getNextActiveElement2;
        exports4.getTransitionDurationFromElement = getTransitionDurationFromElement2;
        exports4.getUID = getUID2;
        exports4.getjQuery = getjQuery2;
        exports4.isDisabled = isDisabled2;
        exports4.isElement = isElement2;
        exports4.isRTL = isRTL2;
        exports4.isVisible = isVisible2;
        exports4.noop = noop2;
        exports4.onDOMContentLoaded = onDOMContentLoaded2;
        exports4.parseSelector = parseSelector2;
        exports4.reflow = reflow2;
        exports4.toType = toType2;
        exports4.triggerTransitionEnd = triggerTransitionEnd2;
        Object.defineProperty(exports4, Symbol.toStringTag, { value: "Module" });
      }));
    })(util$1, util$1.exports);
    return util$1.exports;
  }
  /*!
    * Bootstrap event-handler.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var eventHandler = eventHandler$1.exports;
  var hasRequiredEventHandler;
  function requireEventHandler() {
    if (hasRequiredEventHandler) return eventHandler$1.exports;
    hasRequiredEventHandler = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory(requireUtil());
      })(eventHandler, (function(index_js) {
        const namespaceRegex2 = /[^.]*(?=\..*)\.|.*/;
        const stripNameRegex2 = /\..*/;
        const stripUidRegex2 = /::\d+$/;
        const eventRegistry2 = {};
        let uidEvent2 = 1;
        const customEvents2 = {
          mouseenter: "mouseover",
          mouseleave: "mouseout"
        };
        const nativeEvents2 = /* @__PURE__ */ new Set(["click", "dblclick", "mouseup", "mousedown", "contextmenu", "mousewheel", "DOMMouseScroll", "mouseover", "mouseout", "mousemove", "selectstart", "selectend", "keydown", "keypress", "keyup", "orientationchange", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel", "gesturestart", "gesturechange", "gestureend", "focus", "blur", "change", "reset", "select", "submit", "focusin", "focusout", "load", "unload", "beforeunload", "resize", "move", "DOMContentLoaded", "readystatechange", "error", "abort", "scroll"]);
        function makeEventUid2(element, uid) {
          return uid && `${uid}::${uidEvent2++}` || element.uidEvent || uidEvent2++;
        }
        function getElementEvents2(element) {
          const uid = makeEventUid2(element);
          element.uidEvent = uid;
          eventRegistry2[uid] = eventRegistry2[uid] || {};
          return eventRegistry2[uid];
        }
        function bootstrapHandler2(element, fn) {
          return function handler(event) {
            hydrateObj2(event, {
              delegateTarget: element
            });
            if (handler.oneOff) {
              EventHandler2.off(element, event.type, fn);
            }
            return fn.apply(element, [event]);
          };
        }
        function bootstrapDelegationHandler2(element, selector, fn) {
          return function handler(event) {
            const domElements = element.querySelectorAll(selector);
            for (let {
              target
            } = event; target && target !== this; target = target.parentNode) {
              for (const domElement of domElements) {
                if (domElement !== target) {
                  continue;
                }
                hydrateObj2(event, {
                  delegateTarget: target
                });
                if (handler.oneOff) {
                  EventHandler2.off(element, event.type, selector, fn);
                }
                return fn.apply(target, [event]);
              }
            }
          };
        }
        function findHandler2(events, callable, delegationSelector = null) {
          return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
        }
        function normalizeParameters2(originalTypeEvent, handler, delegationFunction) {
          const isDelegated = typeof handler === "string";
          const callable = isDelegated ? delegationFunction : handler || delegationFunction;
          let typeEvent = getTypeEvent2(originalTypeEvent);
          if (!nativeEvents2.has(typeEvent)) {
            typeEvent = originalTypeEvent;
          }
          return [isDelegated, callable, typeEvent];
        }
        function addHandler2(element, originalTypeEvent, handler, delegationFunction, oneOff) {
          if (typeof originalTypeEvent !== "string" || !element) {
            return;
          }
          let [isDelegated, callable, typeEvent] = normalizeParameters2(originalTypeEvent, handler, delegationFunction);
          if (originalTypeEvent in customEvents2) {
            const wrapFunction = (fn2) => {
              return function(event) {
                if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
                  return fn2.call(this, event);
                }
              };
            };
            callable = wrapFunction(callable);
          }
          const events = getElementEvents2(element);
          const handlers = events[typeEvent] || (events[typeEvent] = {});
          const previousFunction = findHandler2(handlers, callable, isDelegated ? handler : null);
          if (previousFunction) {
            previousFunction.oneOff = previousFunction.oneOff && oneOff;
            return;
          }
          const uid = makeEventUid2(callable, originalTypeEvent.replace(namespaceRegex2, ""));
          const fn = isDelegated ? bootstrapDelegationHandler2(element, handler, callable) : bootstrapHandler2(element, callable);
          fn.delegationSelector = isDelegated ? handler : null;
          fn.callable = callable;
          fn.oneOff = oneOff;
          fn.uidEvent = uid;
          handlers[uid] = fn;
          element.addEventListener(typeEvent, fn, isDelegated);
        }
        function removeHandler2(element, events, typeEvent, handler, delegationSelector) {
          const fn = findHandler2(events[typeEvent], handler, delegationSelector);
          if (!fn) {
            return;
          }
          element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
          delete events[typeEvent][fn.uidEvent];
        }
        function removeNamespacedHandlers2(element, events, typeEvent, namespace) {
          const storeElementEvent = events[typeEvent] || {};
          for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
            if (handlerKey.includes(namespace)) {
              removeHandler2(element, events, typeEvent, event.callable, event.delegationSelector);
            }
          }
        }
        function getTypeEvent2(event) {
          event = event.replace(stripNameRegex2, "");
          return customEvents2[event] || event;
        }
        const EventHandler2 = {
          on(element, event, handler, delegationFunction) {
            addHandler2(element, event, handler, delegationFunction, false);
          },
          one(element, event, handler, delegationFunction) {
            addHandler2(element, event, handler, delegationFunction, true);
          },
          off(element, originalTypeEvent, handler, delegationFunction) {
            if (typeof originalTypeEvent !== "string" || !element) {
              return;
            }
            const [isDelegated, callable, typeEvent] = normalizeParameters2(originalTypeEvent, handler, delegationFunction);
            const inNamespace = typeEvent !== originalTypeEvent;
            const events = getElementEvents2(element);
            const storeElementEvent = events[typeEvent] || {};
            const isNamespace = originalTypeEvent.startsWith(".");
            if (typeof callable !== "undefined") {
              if (!Object.keys(storeElementEvent).length) {
                return;
              }
              removeHandler2(element, events, typeEvent, callable, isDelegated ? handler : null);
              return;
            }
            if (isNamespace) {
              for (const elementEvent of Object.keys(events)) {
                removeNamespacedHandlers2(element, events, elementEvent, originalTypeEvent.slice(1));
              }
            }
            for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
              const handlerKey = keyHandlers.replace(stripUidRegex2, "");
              if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
                removeHandler2(element, events, typeEvent, event.callable, event.delegationSelector);
              }
            }
          },
          trigger(element, event, args) {
            if (typeof event !== "string" || !element) {
              return null;
            }
            const $ = index_js.getjQuery();
            const typeEvent = getTypeEvent2(event);
            const inNamespace = event !== typeEvent;
            let jQueryEvent = null;
            let bubbles = true;
            let nativeDispatch = true;
            let defaultPrevented = false;
            if (inNamespace && $) {
              jQueryEvent = $.Event(event, args);
              $(element).trigger(jQueryEvent);
              bubbles = !jQueryEvent.isPropagationStopped();
              nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
              defaultPrevented = jQueryEvent.isDefaultPrevented();
            }
            const evt = hydrateObj2(new Event(event, {
              bubbles,
              cancelable: true
            }), args);
            if (defaultPrevented) {
              evt.preventDefault();
            }
            if (nativeDispatch) {
              element.dispatchEvent(evt);
            }
            if (evt.defaultPrevented && jQueryEvent) {
              jQueryEvent.preventDefault();
            }
            return evt;
          }
        };
        function hydrateObj2(obj, meta = {}) {
          for (const [key, value] of Object.entries(meta)) {
            try {
              obj[key] = value;
            } catch (_unused) {
              Object.defineProperty(obj, key, {
                configurable: true,
                get() {
                  return value;
                }
              });
            }
          }
          return obj;
        }
        return EventHandler2;
      }));
    })(eventHandler$1);
    return eventHandler$1.exports;
  }
  var config$1 = { exports: {} };
  var manipulator$1 = { exports: {} };
  /*!
    * Bootstrap manipulator.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var manipulator = manipulator$1.exports;
  var hasRequiredManipulator;
  function requireManipulator() {
    if (hasRequiredManipulator) return manipulator$1.exports;
    hasRequiredManipulator = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory();
      })(manipulator, (function() {
        function normalizeData2(value) {
          if (value === "true") {
            return true;
          }
          if (value === "false") {
            return false;
          }
          if (value === Number(value).toString()) {
            return Number(value);
          }
          if (value === "" || value === "null") {
            return null;
          }
          if (typeof value !== "string") {
            return value;
          }
          try {
            return JSON.parse(decodeURIComponent(value));
          } catch (_unused) {
            return value;
          }
        }
        function normalizeDataKey2(key) {
          return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
        }
        const Manipulator2 = {
          setDataAttribute(element, key, value) {
            element.setAttribute(`data-bs-${normalizeDataKey2(key)}`, value);
          },
          removeDataAttribute(element, key) {
            element.removeAttribute(`data-bs-${normalizeDataKey2(key)}`);
          },
          getDataAttributes(element) {
            if (!element) {
              return {};
            }
            const attributes = {};
            const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
            for (const key of bsKeys) {
              let pureKey = key.replace(/^bs/, "");
              pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
              attributes[pureKey] = normalizeData2(element.dataset[key]);
            }
            return attributes;
          },
          getDataAttribute(element, key) {
            return normalizeData2(element.getAttribute(`data-bs-${normalizeDataKey2(key)}`));
          }
        };
        return Manipulator2;
      }));
    })(manipulator$1);
    return manipulator$1.exports;
  }
  /*!
    * Bootstrap config.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var config = config$1.exports;
  var hasRequiredConfig;
  function requireConfig() {
    if (hasRequiredConfig) return config$1.exports;
    hasRequiredConfig = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory(requireManipulator(), requireUtil());
      })(config, (function(Manipulator2, index_js) {
        class Config2 {
          // Getters
          static get Default() {
            return {};
          }
          static get DefaultType() {
            return {};
          }
          static get NAME() {
            throw new Error('You have to implement the static method "NAME", for each component!');
          }
          _getConfig(config2) {
            config2 = this._mergeConfigObj(config2);
            config2 = this._configAfterMerge(config2);
            this._typeCheckConfig(config2);
            return config2;
          }
          _configAfterMerge(config2) {
            return config2;
          }
          _mergeConfigObj(config2, element) {
            const jsonConfig = index_js.isElement(element) ? Manipulator2.getDataAttribute(element, "config") : {};
            return {
              ...this.constructor.Default,
              ...typeof jsonConfig === "object" ? jsonConfig : {},
              ...index_js.isElement(element) ? Manipulator2.getDataAttributes(element) : {},
              ...typeof config2 === "object" ? config2 : {}
            };
          }
          _typeCheckConfig(config2, configTypes = this.constructor.DefaultType) {
            for (const [property, expectedTypes] of Object.entries(configTypes)) {
              const value = config2[property];
              const valueType = index_js.isElement(value) ? "element" : index_js.toType(value);
              if (!new RegExp(expectedTypes).test(valueType)) {
                throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
              }
            }
          }
        }
        return Config2;
      }));
    })(config$1);
    return config$1.exports;
  }
  /*!
    * Bootstrap base-component.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var baseComponent = baseComponent$1.exports;
  var hasRequiredBaseComponent;
  function requireBaseComponent() {
    if (hasRequiredBaseComponent) return baseComponent$1.exports;
    hasRequiredBaseComponent = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory(requireData(), requireEventHandler(), requireConfig(), requireUtil());
      })(baseComponent, (function(Data2, EventHandler2, Config2, index_js) {
        const VERSION2 = "5.3.8";
        class BaseComponent2 extends Config2 {
          constructor(element, config2) {
            super();
            element = index_js.getElement(element);
            if (!element) {
              return;
            }
            this._element = element;
            this._config = this._getConfig(config2);
            Data2.set(this._element, this.constructor.DATA_KEY, this);
          }
          // Public
          dispose() {
            Data2.remove(this._element, this.constructor.DATA_KEY);
            EventHandler2.off(this._element, this.constructor.EVENT_KEY);
            for (const propertyName of Object.getOwnPropertyNames(this)) {
              this[propertyName] = null;
            }
          }
          // Private
          _queueCallback(callback, element, isAnimated = true) {
            index_js.executeAfterTransition(callback, element, isAnimated);
          }
          _getConfig(config2) {
            config2 = this._mergeConfigObj(config2, this._element);
            config2 = this._configAfterMerge(config2);
            this._typeCheckConfig(config2);
            return config2;
          }
          // Static
          static getInstance(element) {
            return Data2.get(index_js.getElement(element), this.DATA_KEY);
          }
          static getOrCreateInstance(element, config2 = {}) {
            return this.getInstance(element) || new this(element, typeof config2 === "object" ? config2 : null);
          }
          static get VERSION() {
            return VERSION2;
          }
          static get DATA_KEY() {
            return `bs.${this.NAME}`;
          }
          static get EVENT_KEY() {
            return `.${this.DATA_KEY}`;
          }
          static eventName(name) {
            return `${name}${this.EVENT_KEY}`;
          }
        }
        return BaseComponent2;
      }));
    })(baseComponent$1);
    return baseComponent$1.exports;
  }
  var sanitizer$1 = { exports: {} };
  /*!
    * Bootstrap sanitizer.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var sanitizer = sanitizer$1.exports;
  var hasRequiredSanitizer;
  function requireSanitizer() {
    if (hasRequiredSanitizer) return sanitizer$1.exports;
    hasRequiredSanitizer = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        factory(exports3);
      })(sanitizer, (function(exports4) {
        const ARIA_ATTRIBUTE_PATTERN2 = /^aria-[\w-]*$/i;
        const DefaultAllowlist2 = {
          // Global attributes allowed on any supplied element below.
          "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN2],
          a: ["target", "href", "title", "rel"],
          area: [],
          b: [],
          br: [],
          col: [],
          code: [],
          dd: [],
          div: [],
          dl: [],
          dt: [],
          em: [],
          hr: [],
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          i: [],
          img: ["src", "srcset", "alt", "title", "width", "height"],
          li: [],
          ol: [],
          p: [],
          pre: [],
          s: [],
          small: [],
          span: [],
          sub: [],
          sup: [],
          strong: [],
          u: [],
          ul: []
        };
        const uriAttributes2 = /* @__PURE__ */ new Set(["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"]);
        const SAFE_URL_PATTERN2 = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
        const allowedAttribute2 = (attribute, allowedAttributeList) => {
          const attributeName = attribute.nodeName.toLowerCase();
          if (allowedAttributeList.includes(attributeName)) {
            if (uriAttributes2.has(attributeName)) {
              return Boolean(SAFE_URL_PATTERN2.test(attribute.nodeValue));
            }
            return true;
          }
          return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
        };
        function sanitizeHtml2(unsafeHtml, allowList, sanitizeFunction) {
          if (!unsafeHtml.length) {
            return unsafeHtml;
          }
          if (sanitizeFunction && typeof sanitizeFunction === "function") {
            return sanitizeFunction(unsafeHtml);
          }
          const domParser = new window.DOMParser();
          const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
          const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
          for (const element of elements) {
            const elementName = element.nodeName.toLowerCase();
            if (!Object.keys(allowList).includes(elementName)) {
              element.remove();
              continue;
            }
            const attributeList = [].concat(...element.attributes);
            const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
            for (const attribute of attributeList) {
              if (!allowedAttribute2(attribute, allowedAttributes)) {
                element.removeAttribute(attribute.nodeName);
              }
            }
          }
          return createdDocument.body.innerHTML;
        }
        exports4.DefaultAllowlist = DefaultAllowlist2;
        exports4.sanitizeHtml = sanitizeHtml2;
        Object.defineProperty(exports4, Symbol.toStringTag, { value: "Module" });
      }));
    })(sanitizer$1, sanitizer$1.exports);
    return sanitizer$1.exports;
  }
  var templateFactory$1 = { exports: {} };
  var selectorEngine$1 = { exports: {} };
  /*!
    * Bootstrap selector-engine.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var selectorEngine = selectorEngine$1.exports;
  var hasRequiredSelectorEngine;
  function requireSelectorEngine() {
    if (hasRequiredSelectorEngine) return selectorEngine$1.exports;
    hasRequiredSelectorEngine = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory(requireUtil());
      })(selectorEngine, (function(index_js) {
        const getSelector2 = (element) => {
          let selector = element.getAttribute("data-bs-target");
          if (!selector || selector === "#") {
            let hrefAttribute = element.getAttribute("href");
            if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
              return null;
            }
            if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
              hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
            }
            selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
          }
          return selector ? selector.split(",").map((sel) => index_js.parseSelector(sel)).join(",") : null;
        };
        const SelectorEngine2 = {
          find(selector, element = document.documentElement) {
            return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
          },
          findOne(selector, element = document.documentElement) {
            return Element.prototype.querySelector.call(element, selector);
          },
          children(element, selector) {
            return [].concat(...element.children).filter((child) => child.matches(selector));
          },
          parents(element, selector) {
            const parents = [];
            let ancestor = element.parentNode.closest(selector);
            while (ancestor) {
              parents.push(ancestor);
              ancestor = ancestor.parentNode.closest(selector);
            }
            return parents;
          },
          prev(element, selector) {
            let previous = element.previousElementSibling;
            while (previous) {
              if (previous.matches(selector)) {
                return [previous];
              }
              previous = previous.previousElementSibling;
            }
            return [];
          },
          // TODO: this is now unused; remove later along with prev()
          next(element, selector) {
            let next = element.nextElementSibling;
            while (next) {
              if (next.matches(selector)) {
                return [next];
              }
              next = next.nextElementSibling;
            }
            return [];
          },
          focusableChildren(element) {
            const focusables = ["a", "button", "input", "textarea", "select", "details", "[tabindex]", '[contenteditable="true"]'].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
            return this.find(focusables, element).filter((el) => !index_js.isDisabled(el) && index_js.isVisible(el));
          },
          getSelectorFromElement(element) {
            const selector = getSelector2(element);
            if (selector) {
              return SelectorEngine2.findOne(selector) ? selector : null;
            }
            return null;
          },
          getElementFromSelector(element) {
            const selector = getSelector2(element);
            return selector ? SelectorEngine2.findOne(selector) : null;
          },
          getMultipleElementsFromSelector(element) {
            const selector = getSelector2(element);
            return selector ? SelectorEngine2.find(selector) : [];
          }
        };
        return SelectorEngine2;
      }));
    })(selectorEngine$1);
    return selectorEngine$1.exports;
  }
  /*!
    * Bootstrap template-factory.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var templateFactory = templateFactory$1.exports;
  var hasRequiredTemplateFactory;
  function requireTemplateFactory() {
    if (hasRequiredTemplateFactory) return templateFactory$1.exports;
    hasRequiredTemplateFactory = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory(requireSelectorEngine(), requireConfig(), requireSanitizer(), requireUtil());
      })(templateFactory, (function(SelectorEngine2, Config2, sanitizer_js, index_js) {
        const NAME2 = "TemplateFactory";
        const Default2 = {
          allowList: sanitizer_js.DefaultAllowlist,
          content: {},
          // { selector : text ,  selector2 : text2 , }
          extraClass: "",
          html: false,
          sanitize: true,
          sanitizeFn: null,
          template: "<div></div>"
        };
        const DefaultType2 = {
          allowList: "object",
          content: "object",
          extraClass: "(string|function)",
          html: "boolean",
          sanitize: "boolean",
          sanitizeFn: "(null|function)",
          template: "string"
        };
        const DefaultContentType2 = {
          entry: "(string|element|function|null)",
          selector: "(string|element)"
        };
        class TemplateFactory2 extends Config2 {
          constructor(config2) {
            super();
            this._config = this._getConfig(config2);
          }
          // Getters
          static get Default() {
            return Default2;
          }
          static get DefaultType() {
            return DefaultType2;
          }
          static get NAME() {
            return NAME2;
          }
          // Public
          getContent() {
            return Object.values(this._config.content).map((config2) => this._resolvePossibleFunction(config2)).filter(Boolean);
          }
          hasContent() {
            return this.getContent().length > 0;
          }
          changeContent(content) {
            this._checkContent(content);
            this._config.content = {
              ...this._config.content,
              ...content
            };
            return this;
          }
          toHtml() {
            const templateWrapper = document.createElement("div");
            templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
            for (const [selector, text] of Object.entries(this._config.content)) {
              this._setContent(templateWrapper, text, selector);
            }
            const template = templateWrapper.children[0];
            const extraClass = this._resolvePossibleFunction(this._config.extraClass);
            if (extraClass) {
              template.classList.add(...extraClass.split(" "));
            }
            return template;
          }
          // Private
          _typeCheckConfig(config2) {
            super._typeCheckConfig(config2);
            this._checkContent(config2.content);
          }
          _checkContent(arg) {
            for (const [selector, content] of Object.entries(arg)) {
              super._typeCheckConfig({
                selector,
                entry: content
              }, DefaultContentType2);
            }
          }
          _setContent(template, content, selector) {
            const templateElement = SelectorEngine2.findOne(selector, template);
            if (!templateElement) {
              return;
            }
            content = this._resolvePossibleFunction(content);
            if (!content) {
              templateElement.remove();
              return;
            }
            if (index_js.isElement(content)) {
              this._putElementInTemplate(index_js.getElement(content), templateElement);
              return;
            }
            if (this._config.html) {
              templateElement.innerHTML = this._maybeSanitize(content);
              return;
            }
            templateElement.textContent = content;
          }
          _maybeSanitize(arg) {
            return this._config.sanitize ? sanitizer_js.sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
          }
          _resolvePossibleFunction(arg) {
            return index_js.execute(arg, [void 0, this]);
          }
          _putElementInTemplate(element, templateElement) {
            if (this._config.html) {
              templateElement.innerHTML = "";
              templateElement.append(element);
              return;
            }
            templateElement.textContent = element.textContent;
          }
        }
        return TemplateFactory2;
      }));
    })(templateFactory$1);
    return templateFactory$1.exports;
  }
  /*!
    * Bootstrap tooltip.js v5.3.8 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  var tooltip = tooltip$1.exports;
  var hasRequiredTooltip;
  function requireTooltip() {
    if (hasRequiredTooltip) return tooltip$1.exports;
    hasRequiredTooltip = 1;
    (function(module2, exports3) {
      (function(global, factory) {
        module2.exports = factory(require$$0, requireBaseComponent(), requireEventHandler(), requireManipulator(), requireUtil(), requireSanitizer(), requireTemplateFactory());
      })(tooltip, (function(Popper, BaseComponent2, EventHandler2, Manipulator2, index_js, sanitizer_js, TemplateFactory2) {
        function _interopNamespaceDefault(e) {
          const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
          if (e) {
            for (const k in e) {
              if (k !== "default") {
                const d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                  enumerable: true,
                  get: () => e[k]
                });
              }
            }
          }
          n.default = e;
          return Object.freeze(n);
        }
        const Popper__namespace = /* @__PURE__ */ _interopNamespaceDefault(Popper);
        const NAME2 = "tooltip";
        const DISALLOWED_ATTRIBUTES2 = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
        const CLASS_NAME_FADE2 = "fade";
        const CLASS_NAME_MODAL2 = "modal";
        const CLASS_NAME_SHOW2 = "show";
        const SELECTOR_TOOLTIP_INNER2 = ".tooltip-inner";
        const SELECTOR_MODAL2 = `.${CLASS_NAME_MODAL2}`;
        const EVENT_MODAL_HIDE2 = "hide.bs.modal";
        const TRIGGER_HOVER2 = "hover";
        const TRIGGER_FOCUS2 = "focus";
        const TRIGGER_CLICK2 = "click";
        const TRIGGER_MANUAL2 = "manual";
        const EVENT_HIDE2 = "hide";
        const EVENT_HIDDEN2 = "hidden";
        const EVENT_SHOW2 = "show";
        const EVENT_SHOWN2 = "shown";
        const EVENT_INSERTED2 = "inserted";
        const EVENT_CLICK2 = "click";
        const EVENT_FOCUSIN2 = "focusin";
        const EVENT_FOCUSOUT2 = "focusout";
        const EVENT_MOUSEENTER2 = "mouseenter";
        const EVENT_MOUSELEAVE2 = "mouseleave";
        const AttachmentMap2 = {
          AUTO: "auto",
          TOP: "top",
          RIGHT: index_js.isRTL() ? "left" : "right",
          BOTTOM: "bottom",
          LEFT: index_js.isRTL() ? "right" : "left"
        };
        const Default2 = {
          allowList: sanitizer_js.DefaultAllowlist,
          animation: true,
          boundary: "clippingParents",
          container: false,
          customClass: "",
          delay: 0,
          fallbackPlacements: ["top", "right", "bottom", "left"],
          html: false,
          offset: [0, 6],
          placement: "top",
          popperConfig: null,
          sanitize: true,
          sanitizeFn: null,
          selector: false,
          template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          title: "",
          trigger: "hover focus"
        };
        const DefaultType2 = {
          allowList: "object",
          animation: "boolean",
          boundary: "(string|element)",
          container: "(string|element|boolean)",
          customClass: "(string|function)",
          delay: "(number|object)",
          fallbackPlacements: "array",
          html: "boolean",
          offset: "(array|string|function)",
          placement: "(string|function)",
          popperConfig: "(null|object|function)",
          sanitize: "boolean",
          sanitizeFn: "(null|function)",
          selector: "(string|boolean)",
          template: "string",
          title: "(string|element|function)",
          trigger: "string"
        };
        class Tooltip2 extends BaseComponent2 {
          constructor(element, config2) {
            if (typeof Popper__namespace === "undefined") {
              throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org/docs/v2/)");
            }
            super(element, config2);
            this._isEnabled = true;
            this._timeout = 0;
            this._isHovered = null;
            this._activeTrigger = {};
            this._popper = null;
            this._templateFactory = null;
            this._newContent = null;
            this.tip = null;
            this._setListeners();
            if (!this._config.selector) {
              this._fixTitle();
            }
          }
          // Getters
          static get Default() {
            return Default2;
          }
          static get DefaultType() {
            return DefaultType2;
          }
          static get NAME() {
            return NAME2;
          }
          // Public
          enable() {
            this._isEnabled = true;
          }
          disable() {
            this._isEnabled = false;
          }
          toggleEnabled() {
            this._isEnabled = !this._isEnabled;
          }
          toggle() {
            if (!this._isEnabled) {
              return;
            }
            if (this._isShown()) {
              this._leave();
              return;
            }
            this._enter();
          }
          dispose() {
            clearTimeout(this._timeout);
            EventHandler2.off(this._element.closest(SELECTOR_MODAL2), EVENT_MODAL_HIDE2, this._hideModalHandler);
            if (this._element.getAttribute("data-bs-original-title")) {
              this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
            }
            this._disposePopper();
            super.dispose();
          }
          show() {
            if (this._element.style.display === "none") {
              throw new Error("Please use show on visible elements");
            }
            if (!(this._isWithContent() && this._isEnabled)) {
              return;
            }
            const showEvent = EventHandler2.trigger(this._element, this.constructor.eventName(EVENT_SHOW2));
            const shadowRoot = index_js.findShadowRoot(this._element);
            const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
            if (showEvent.defaultPrevented || !isInTheDom) {
              return;
            }
            this._disposePopper();
            const tip = this._getTipElement();
            this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
            const {
              container
            } = this._config;
            if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
              container.append(tip);
              EventHandler2.trigger(this._element, this.constructor.eventName(EVENT_INSERTED2));
            }
            this._popper = this._createPopper(tip);
            tip.classList.add(CLASS_NAME_SHOW2);
            if ("ontouchstart" in document.documentElement) {
              for (const element of [].concat(...document.body.children)) {
                EventHandler2.on(element, "mouseover", index_js.noop);
              }
            }
            const complete = () => {
              EventHandler2.trigger(this._element, this.constructor.eventName(EVENT_SHOWN2));
              if (this._isHovered === false) {
                this._leave();
              }
              this._isHovered = false;
            };
            this._queueCallback(complete, this.tip, this._isAnimated());
          }
          hide() {
            if (!this._isShown()) {
              return;
            }
            const hideEvent = EventHandler2.trigger(this._element, this.constructor.eventName(EVENT_HIDE2));
            if (hideEvent.defaultPrevented) {
              return;
            }
            const tip = this._getTipElement();
            tip.classList.remove(CLASS_NAME_SHOW2);
            if ("ontouchstart" in document.documentElement) {
              for (const element of [].concat(...document.body.children)) {
                EventHandler2.off(element, "mouseover", index_js.noop);
              }
            }
            this._activeTrigger[TRIGGER_CLICK2] = false;
            this._activeTrigger[TRIGGER_FOCUS2] = false;
            this._activeTrigger[TRIGGER_HOVER2] = false;
            this._isHovered = null;
            const complete = () => {
              if (this._isWithActiveTrigger()) {
                return;
              }
              if (!this._isHovered) {
                this._disposePopper();
              }
              this._element.removeAttribute("aria-describedby");
              EventHandler2.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN2));
            };
            this._queueCallback(complete, this.tip, this._isAnimated());
          }
          update() {
            if (this._popper) {
              this._popper.update();
            }
          }
          // Protected
          _isWithContent() {
            return Boolean(this._getTitle());
          }
          _getTipElement() {
            if (!this.tip) {
              this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
            }
            return this.tip;
          }
          _createTipElement(content) {
            const tip = this._getTemplateFactory(content).toHtml();
            if (!tip) {
              return null;
            }
            tip.classList.remove(CLASS_NAME_FADE2, CLASS_NAME_SHOW2);
            tip.classList.add(`bs-${this.constructor.NAME}-auto`);
            const tipId = index_js.getUID(this.constructor.NAME).toString();
            tip.setAttribute("id", tipId);
            if (this._isAnimated()) {
              tip.classList.add(CLASS_NAME_FADE2);
            }
            return tip;
          }
          setContent(content) {
            this._newContent = content;
            if (this._isShown()) {
              this._disposePopper();
              this.show();
            }
          }
          _getTemplateFactory(content) {
            if (this._templateFactory) {
              this._templateFactory.changeContent(content);
            } else {
              this._templateFactory = new TemplateFactory2({
                ...this._config,
                // the `content` var has to be after `this._config`
                // to override config.content in case of popover
                content,
                extraClass: this._resolvePossibleFunction(this._config.customClass)
              });
            }
            return this._templateFactory;
          }
          _getContentForTemplate() {
            return {
              [SELECTOR_TOOLTIP_INNER2]: this._getTitle()
            };
          }
          _getTitle() {
            return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
          }
          // Private
          _initializeOnDelegatedTarget(event) {
            return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
          }
          _isAnimated() {
            return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE2);
          }
          _isShown() {
            return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW2);
          }
          _createPopper(tip) {
            const placement = index_js.execute(this._config.placement, [this, tip, this._element]);
            const attachment = AttachmentMap2[placement.toUpperCase()];
            return Popper__namespace.createPopper(this._element, tip, this._getPopperConfig(attachment));
          }
          _getOffset() {
            const {
              offset: offset2
            } = this._config;
            if (typeof offset2 === "string") {
              return offset2.split(",").map((value) => Number.parseInt(value, 10));
            }
            if (typeof offset2 === "function") {
              return (popperData) => offset2(popperData, this._element);
            }
            return offset2;
          }
          _resolvePossibleFunction(arg) {
            return index_js.execute(arg, [this._element, this._element]);
          }
          _getPopperConfig(attachment) {
            const defaultBsPopperConfig = {
              placement: attachment,
              modifiers: [{
                name: "flip",
                options: {
                  fallbackPlacements: this._config.fallbackPlacements
                }
              }, {
                name: "offset",
                options: {
                  offset: this._getOffset()
                }
              }, {
                name: "preventOverflow",
                options: {
                  boundary: this._config.boundary
                }
              }, {
                name: "arrow",
                options: {
                  element: `.${this.constructor.NAME}-arrow`
                }
              }, {
                name: "preSetPlacement",
                enabled: true,
                phase: "beforeMain",
                fn: (data2) => {
                  this._getTipElement().setAttribute("data-popper-placement", data2.state.placement);
                }
              }]
            };
            return {
              ...defaultBsPopperConfig,
              ...index_js.execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
            };
          }
          _setListeners() {
            const triggers = this._config.trigger.split(" ");
            for (const trigger of triggers) {
              if (trigger === "click") {
                EventHandler2.on(this._element, this.constructor.eventName(EVENT_CLICK2), this._config.selector, (event) => {
                  const context = this._initializeOnDelegatedTarget(event);
                  context._activeTrigger[TRIGGER_CLICK2] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK2]);
                  context.toggle();
                });
              } else if (trigger !== TRIGGER_MANUAL2) {
                const eventIn = trigger === TRIGGER_HOVER2 ? this.constructor.eventName(EVENT_MOUSEENTER2) : this.constructor.eventName(EVENT_FOCUSIN2);
                const eventOut = trigger === TRIGGER_HOVER2 ? this.constructor.eventName(EVENT_MOUSELEAVE2) : this.constructor.eventName(EVENT_FOCUSOUT2);
                EventHandler2.on(this._element, eventIn, this._config.selector, (event) => {
                  const context = this._initializeOnDelegatedTarget(event);
                  context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS2 : TRIGGER_HOVER2] = true;
                  context._enter();
                });
                EventHandler2.on(this._element, eventOut, this._config.selector, (event) => {
                  const context = this._initializeOnDelegatedTarget(event);
                  context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS2 : TRIGGER_HOVER2] = context._element.contains(event.relatedTarget);
                  context._leave();
                });
              }
            }
            this._hideModalHandler = () => {
              if (this._element) {
                this.hide();
              }
            };
            EventHandler2.on(this._element.closest(SELECTOR_MODAL2), EVENT_MODAL_HIDE2, this._hideModalHandler);
          }
          _fixTitle() {
            const title = this._element.getAttribute("title");
            if (!title) {
              return;
            }
            if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
              this._element.setAttribute("aria-label", title);
            }
            this._element.setAttribute("data-bs-original-title", title);
            this._element.removeAttribute("title");
          }
          _enter() {
            if (this._isShown() || this._isHovered) {
              this._isHovered = true;
              return;
            }
            this._isHovered = true;
            this._setTimeout(() => {
              if (this._isHovered) {
                this.show();
              }
            }, this._config.delay.show);
          }
          _leave() {
            if (this._isWithActiveTrigger()) {
              return;
            }
            this._isHovered = false;
            this._setTimeout(() => {
              if (!this._isHovered) {
                this.hide();
              }
            }, this._config.delay.hide);
          }
          _setTimeout(handler, timeout) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(handler, timeout);
          }
          _isWithActiveTrigger() {
            return Object.values(this._activeTrigger).includes(true);
          }
          _getConfig(config2) {
            const dataAttributes = Manipulator2.getDataAttributes(this._element);
            for (const dataAttribute of Object.keys(dataAttributes)) {
              if (DISALLOWED_ATTRIBUTES2.has(dataAttribute)) {
                delete dataAttributes[dataAttribute];
              }
            }
            config2 = {
              ...dataAttributes,
              ...typeof config2 === "object" && config2 ? config2 : {}
            };
            config2 = this._mergeConfigObj(config2);
            config2 = this._configAfterMerge(config2);
            this._typeCheckConfig(config2);
            return config2;
          }
          _configAfterMerge(config2) {
            config2.container = config2.container === false ? document.body : index_js.getElement(config2.container);
            if (typeof config2.delay === "number") {
              config2.delay = {
                show: config2.delay,
                hide: config2.delay
              };
            }
            if (typeof config2.title === "number") {
              config2.title = config2.title.toString();
            }
            if (typeof config2.content === "number") {
              config2.content = config2.content.toString();
            }
            return config2;
          }
          _getDelegateConfig() {
            const config2 = {};
            for (const [key, value] of Object.entries(this._config)) {
              if (this.constructor.Default[key] !== value) {
                config2[key] = value;
              }
            }
            config2.selector = false;
            config2.trigger = "manual";
            return config2;
          }
          _disposePopper() {
            if (this._popper) {
              this._popper.destroy();
              this._popper = null;
            }
            if (this.tip) {
              this.tip.remove();
              this.tip = null;
            }
          }
          // Static
          static jQueryInterface(config2) {
            return this.each(function() {
              const data2 = Tooltip2.getOrCreateInstance(this, config2);
              if (typeof config2 !== "string") {
                return;
              }
              if (typeof data2[config2] === "undefined") {
                throw new TypeError(`No method named "${config2}"`);
              }
              data2[config2]();
            });
          }
        }
        index_js.defineJQueryPlugin(Tooltip2);
        return Tooltip2;
      }));
    })(tooltip$1);
    return tooltip$1.exports;
  }
  var tooltipExports = requireTooltip();
  const BootstrapTooltip = /* @__PURE__ */ getDefaultExportFromCjs(tooltipExports);
  var eventHandlerExports = requireEventHandler();
  const EventHandler = /* @__PURE__ */ getDefaultExportFromCjs(eventHandlerExports);
  const CLASS_TOOLTIP_CONTAINER = "tooltip-container";
  const CLASS_TOOLTIP_INTERACTIVE = "tooltip-interactive";
  const _Tooltip = class _Tooltip extends BootstrapTooltip {
    // Used for interactive tooltips
    _isTriggerHovered = false;
    _isTooltipHovered = false;
    _hideTimeout = null;
    constructor(element, config2 = {}) {
      if (_Tooltip._isInteractive(element)) {
        config2 = { ...config2, ...{
          trigger: "manual",
          customClass: CLASS_TOOLTIP_INTERACTIVE,
          html: true
        } };
      }
      config2.template = config2.template ?? _Tooltip.defaultTooltipTemplate;
      super(element, config2);
      if (_Tooltip._isInteractive(element)) {
        this._enableInteractivity();
      }
    }
    _enableInteractivity() {
      let listenersAttached = false;
      EventHandler.on(this._element, "mouseenter", () => {
        this._isTriggerHovered = true;
        if (this._hideTimeout) {
          this._clearHideTimeout();
          this._isHovered = true;
          return;
        }
        if (this._isShown()) {
          return;
        }
        this.show();
      });
      EventHandler.on(this._element, "mouseleave", () => {
        this._isTriggerHovered = false;
        this._scheduleHide();
      });
      EventHandler.on(this._element, "shown.bs.tooltip", () => {
        if (listenersAttached) {
          return;
        }
        const tipElement = this._getTipElement();
        EventHandler.on(tipElement, "mouseenter", () => {
          this._isTooltipHovered = true;
          this._clearHideTimeout();
          this._isHovered = true;
        });
        EventHandler.on(tipElement, "mouseleave", () => {
          this._isTooltipHovered = false;
          this._scheduleHide();
        });
        listenersAttached = true;
      });
      EventHandler.on(this._element, "hidden.bs.tooltip", () => {
        listenersAttached = false;
      });
    }
    _scheduleHide() {
      this._clearHideTimeout();
      this._hideTimeout = setTimeout(() => {
        if (!this._isTriggerHovered && !this._isTooltipHovered) {
          this._isHovered = false;
          this.hide();
          this._hideTimeout = null;
        } else {
          this._isHovered = true;
          this._hideTimeout = null;
        }
      }, 100);
    }
    _clearHideTimeout() {
      if (this._hideTimeout) {
        clearTimeout(this._hideTimeout);
        this._hideTimeout = null;
      }
    }
  };
  __publicField(_Tooltip, "selector", '[data-bs-toggle="tooltip"]');
  __publicField(_Tooltip, "defaultTooltipTemplate", `
        <div class="tooltip" role="tooltip">
            <div class="${CLASS_TOOLTIP_CONTAINER}">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner"></div>
            </div>
        </div>
    `);
  __publicField(_Tooltip, "_isInteractive", (element) => element.getAttribute("data-bs-interactive") !== null);
  dynamicObserver.add(_Tooltip);
  let Tooltip = _Tooltip;
  const Bravo = {
    // Spread Bootstrap's components as a base
    ...BootstrapComponents,
    // Override with Bravo's enhanced components
    Alert,
    Button,
    Carousel,
    Collapse,
    Dropdown,
    Modal,
    ModalNavigation: Navigation,
    Offcanvas,
    Popover,
    Scrollspy: ScrollSpy,
    Tab,
    Toast,
    Tooltip,
    // Add version info
    VERSION: packageJson.version,
    _bravo: true
  };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        console.log("Bravo bundle loaded and components initialized");
      });
    } else {
      console.log("Bravo bundle loaded and components initialized");
    }
  }
  exports2.Alert = Alert;
  exports2.Button = Button;
  exports2.Carousel = Carousel;
  exports2.Collapse = Collapse;
  exports2.Dropdown = Dropdown;
  exports2.Modal = Modal;
  exports2.ModalNavigation = Navigation;
  exports2.Offcanvas = Offcanvas;
  exports2.Popover = Popover;
  exports2.Scrollspy = ScrollSpy;
  exports2.Tab = Tab;
  exports2.Toast = Toast;
  exports2.Tooltip = Tooltip;
  exports2.default = Bravo;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
  window.bootstrap = Bravo;
}));
//# sourceMappingURL=bravo.bundle.umd.js.map
