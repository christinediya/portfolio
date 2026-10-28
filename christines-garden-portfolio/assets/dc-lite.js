/* dc-lite: a tiny renderer for the interactive case-study pages.
   It reads the page template, fills {{holes}}, repeats <sc-for> blocks,
   shows/hides <sc-if> blocks, and updates only what changed on each step
   so slide transitions stay smooth. No libraries needed. */
(function () {
  var tpl = document.getElementById('dc-template');
  var root = document.getElementById('dc-root');
  var src = document.getElementById('dc-logic').textContent;
  var pending = false, mounted = false, handlers = [];

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (u) {
    var next = typeof u === 'function' ? u(this.state) : u;
    this.state = Object.assign({}, this.state, next);
    if (!pending) { pending = true; Promise.resolve().then(update); }
  };
  // The page logic is written as an ES class that extends DCLogic.
  var Component = new Function('DCLogic', src + '\nreturn Component;')(DCLogic);
  var inst = new Component({});

  var ONE = /^\{\{\s*([^}]+?)\s*\}\}$/, ANY = /\{\{\s*([^}]+?)\s*\}\}/g;
  function val(expr, scope) {
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    var parts = expr.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function hole(str, scope) {
    var m = ONE.exec(str);
    if (m) return val(m[1], scope);
    return str.replace(ANY, function (_, e) { var v = val(e, scope); return v == null ? '' : String(v); });
  }
  function text(str, scope) { return str.indexOf('{{') < 0 ? str : String(hole(str, scope) == null ? '' : hole(str, scope)); }

  function build(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(text(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = hole(node.getAttribute('list'), scope) || [], as = node.getAttribute('as');
      for (var i = 0; i < list.length; i++) { var s = Object.create(scope); s[as] = list[i]; kids(node, s, out); }
      return;
    }
    if (tag === 'sc-if') { if (hole(node.getAttribute('value'), scope)) kids(node, scope, out); return; }
    var el = node.namespaceURI && node.namespaceURI !== 'http://www.w3.org/1999/xhtml'
      ? document.createElementNS(node.namespaceURI, node.localName)
      : document.createElement(tag);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name;
      if (name.indexOf('hint-') === 0) continue;
      if (name === 'onclick') {
        var fn = hole(at.value, scope);
        if (typeof fn === 'function') { handlers.push(fn); el.setAttribute('data-dc-click', handlers.length - 1); }
        continue;
      }
      var v = at.value.indexOf('{{') < 0 ? at.value : hole(at.value, scope);
      if (v === false || v == null) continue;
      if (at.namespaceURI) el.setAttributeNS(at.namespaceURI, name, String(v));
      else el.setAttribute(name, String(v));
    }
    if (tag === 'video' && el.hasAttribute('muted')) el.muted = true;
    kids(node, scope, el);
    out.appendChild(el);
  }
  function kids(node, scope, out) { for (var c = node.firstChild; c; c = c.nextSibling) build(c, scope, out); }

  function patch(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.parentNode.replaceChild(b, a); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    var i, at;
    for (i = 0; i < b.attributes.length; i++) {
      at = b.attributes[i];
      if (a.getAttribute(at.name) !== at.value) {
        if (at.namespaceURI) a.setAttributeNS(at.namespaceURI, at.name, at.value); else a.setAttribute(at.name, at.value);
      }
    }
    for (i = a.attributes.length - 1; i >= 0; i--) { at = a.attributes[i]; if (!b.hasAttribute(at.name)) a.removeAttribute(at.name); }
    patchKids(a, b);
  }
  function patchKids(a, b) {
    var ac = a.childNodes, bc = Array.prototype.slice.call(b.childNodes);
    for (var i = 0; i < bc.length; i++) { if (i < ac.length) patch(ac[i], bc[i]); else a.appendChild(bc[i]); }
    while (ac.length > bc.length) a.removeChild(a.lastChild);
  }

  function update() {
    pending = false;
    handlers = [];
    var scope = inst.renderVals ? inst.renderVals() : {};
    var frag = document.createElement('div');
    kids(tpl.content, scope, frag);
    if (!mounted) {
      while (frag.firstChild) root.appendChild(frag.firstChild);
      mounted = true;
      if (inst.componentDidMount) inst.componentDidMount();
    } else {
      patchKids(root, frag);
    }
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-dc-click]');
    if (!t || !root.contains(t)) return;
    var fn = handlers[+t.getAttribute('data-dc-click')];
    if (fn) fn(e);
  });

  update();
})();
