import ChangeSrcDialog from '../components/dialogs/ChangeSrcDialog.js';
import CodeDialog from '../components/dialogs/CodeDialog.js';
import ComponentsDialog from '../components/dialogs/ComponentsDialog.js';
import EventHandlersDialog from '../components/dialogs/EventHandlersDialog.js';
import ImageGalleryDialog from '../components/dialogs/ImageGalleryDialog.js';
import PromptDialog from '../components/dialogs/PromptDialog.js';
import d from './dominant.js';
import emmet from 'https://cdn.skypack.dev/emmet';
import lf from 'https://cdn.skypack.dev/localforage';
import { clearComponents, setComponents, showModal } from './util.js';

class ActionHandler {
  get isComponent() { return this.editorWindow.location.pathname.split('/')[3] === 'components' }
  get sidebarNode() { return this.designer.sidebarNode }
  get toolbarNode() { return this.designer.editor.toolbarNode }
  get editorWindow() { return state.app.editorWindow }
  get editorDocument() { return state.app.editorDocument }
  get s() { return state.app.s }
  set s(x) { post('app.changeSelected', x) }
  
  sToggle = () => {
    let pe = this.s && this.s.closest('[contenteditable="true"]');
    if (pe) { pe.removeAttribute('contenteditable') }
    if (this.s) { this.sPrev = this.s; this.s = null }
    else if (this.editorDocument.contains(this.sPrev)) { this.s = this.sPrev; this.sPrev = null }
    d.update();
  };

  changeMeta = async () => {
    let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Change meta tag', initialValue: this.editorDocument.head.outerHTML }));
    if (btn !== 'ok') { return }
    this.editorDocument.head.outerHTML = x;
    [...this.editorDocument.head.querySelectorAll('[data-twind]')].forEach(x => x.remove());
  };
  
  scrollIntoView = () => { this.s && this.s.scrollIntoView() };
  scrollIntoViewBottom = () => { this.s && this.s.scrollIntoView({ block: 'end' }) };
  
  selectParent = () => this.select('parentElement');
  selectNext = () => this.select('nextElementSibling');
  selectPrev = () => this.select('previousElementSibling');
  selectFirstChild = () => this.select('firstElementChild');
  selectLastChild = () => this.select('lastElementChild');
  
  select = x => {
    if (!this.s) { return }
    let y = this.s[x];
    if (this.isComponent && !this.editorDocument.body.firstElementChild.contains(y)) { return }
    let closestComponentRoot = y && y.closest('[wf-component]');
    if (closestComponentRoot) { y = closestComponentRoot }
    y && this.editorDocument.contains(y) && this.editorDocument.documentElement !== y && this.editorDocument.head !== y && (this.s = y);
    d.update();
  };
  
  mvUp = () => { this.mv(-1) };
  mvDown = () => { this.mv(1) };
  
  mv = i => {
    let p = this.s.parentElement, j = [...p.childNodes].indexOf(this.s), k = 1, pv;
    while (true) {
    pv = p.childNodes[j + (i * k)];
    if (!pv || (pv.nodeType !== Node.COMMENT_NODE && pv.nodeType !== Node.TEXT_NODE) || pv.textContent.trim()) { break }
    k++;
    }
    pv && p.insertBefore(this.s, i < 1 ? pv : pv.nextSibling);
  };
  
  createAfter = () => { this.create('afterend') };
  createBefore = () => { this.create('beforebegin') };
  createInsideFirst = () => { this.create('afterbegin') };
  createInsideLast = () => { this.create('beforeend') };
  
  create = pos => {
    if (this.isComponent && this.s === this.editorDocument.body.firstElementChild && (pos === 'beforebegin' || pos === 'afterend')) { return }
    if (this.s.tagName === 'BODY' && (pos === 'beforebegin' || pos === 'afterend')) { return }
    let x = d.html`<div class="min-h-[16px]">`;
    this.s.insertAdjacentElement(pos, x);
    this.s = x;
    d.update();
    post('app.pushHistory');
  };
  
  copy = async () => { this.s && await lf.setItem('copy', this.s.outerHTML) };
  
  pasteAfter = () => { this.paste('afterend') };
  pasteBefore = () => { this.paste('beforebegin') };
  pasteInsideFirst = () => { this.paste('afterbegin') };
  pasteInsideLast = () => { this.paste('beforeend') };
  
  paste = async pos => {
    if (this.isComponent && this.s === this.editorDocument.body.firstElementChild && (pos === 'beforebegin' || pos === 'afterend')) { return }
    if (this.s.tagName === 'BODY' && (pos === 'beforebegin' || pos === 'afterend')) { return }
    let x = d.html`<div>`;
    x.innerHTML = await lf.getItem('copy');
    let y = x.firstElementChild;
    this.s.insertAdjacentElement(pos, y);
    this.s = y;
    d.update();
    post('app.pushHistory');
  };
  
  rm = () => {
    let { editorDocument } = this;
    if (this.s === editorDocument.documentElement || this.s === editorDocument.body || this.s === editorDocument.head) { return }
    this.copy();
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.remove();
    this.s = p.children[i] || p.children[i - 1] || p;
    d.update();
    post('app.pushHistory');
  };
  
  wrap = () => { this.wrapTagName('div') };
  
  wrapTagName = x => {
    if (!this.s || this.s.tagName === 'BODY') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = `<${x}>${this.s.outerHTML}</${x}>`;
    this.s = p.children[i];
    d.update();
    post('app.pushHistory');
  };
  
  unwrap = () => {
    if (!this.s || this.s.tagName === 'BODY') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = this.s.innerHTML;
    this.s = p.children[i];
    d.update();
    post('app.pushHistory');
  };
  
  changeTag = async () => {
    if (!this.s || this.s.tagName === 'BODY') { return }
    let tagName = this.s.tagName.toLowerCase();
    let [btn, x] = await showModal(d.el(PromptDialog, { short: true, title: 'Change tag', placeholder: 'Tag name', initialValue: tagName }));
    if (btn !== 'ok') { return }
    if (this.s.tagName === 'DIALOG' && x !== 'dialog') { this.s.open = false }
    this.changeTagName(x);
    if (x === 'dialog') { this.s.open = false; this.s.showModal() }
    post('app.pushHistory');
  };
  
  changeTagName = x => {
    if (!this.s || this.s.tagName === 'BODY') { return }
    let tagName = this.s.tagName.toLowerCase();
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    if (x === 'img' || x === 'video' || x === 'br' || x === 'hr') { this.s.innerHTML = '' }
    this.s.outerHTML = this.s.outerHTML.replace(tagName, x);
    this.s = p.children[i];
    d.update();
    post('app.pushHistory');
  };
  
  changeText = async () => {
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change text', placeholder: 'Text', initialValue: this.s.textContent }));
    if (btn !== 'ok') { return }
    this.s.textContent = x;
    post('app.pushHistory');
  };
  
  changeMultilineText = async () => {
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change multiline text', placeholder: 'Text', multiline: true, initialValue: this.s.textContent }));
    if (btn !== 'ok') { return }
    this.s.textContent = x;
    post('app.pushHistory');
  };
  
  changeHref = async () => {
    let [btn, x] = await showModal(d.el(PromptDialog, { short: true, title: 'Change href', placeholder: 'URL', initialValue: this.s.getAttribute('href') }));
    if (btn !== 'ok') { return }
    if (this.s.tagName === 'DIV' || this.s.tagName === 'SPAN') { this.changeTagName('a') }
    else if (this.s.tagName !== 'A') { this.wrapTagName('a') }
    if (x) { this.s.href = x } else { this.s.removeAttribute('href') }
    post('app.pushHistory');
  };
  
  changeSrcUrl = async () => {
    if (!this.s) { return }
    let [btn, src, expr] = await showModal(d.el(ChangeSrcDialog, { initialSrcValue: this.s.getAttribute('src'), initialExprValue: this.s.getAttribute('wf-src') }));
    if (btn !== 'ok') { return }
    this.s.tagName !== 'VIDEO' && this.s.tagName !== 'AUDIO' && this.s.tagName !== 'IFRAME' && this.changeTagName('img');
    if (src) { this.s.src = src } else { this.s.removeAttribute('src') }
    if (expr) { this.s.setAttribute('wf-src', expr) } else { this.s.removeAttribute('wf-src') }
    post('app.pushHistory');
  };
  
  changeBgUrl = async () => {
    if (!this.s) { return }
    let current = this.s.style.backgroundImage;
    let [btn, x] = await showModal(d.el(PromptDialog, {
      short: true,
      title: 'Change background image',
      placeholder: 'URL',
      initialValue: current.startsWith('url("') ? current.slice(5, -2) : current,
    }));
    if (btn !== 'ok') { return }
    if (x) { this.s.style.backgroundImage = `url(${JSON.stringify(x)})` }
    else { this.s.style.backgroundImage = '' }
    post('app.pushHistory');
  };
  
  changeSrcUpload = async () => {
    if (!this.s) { return }
    let [btn, detail] = await showModal(d.el(ImageGalleryDialog));
    if (btn !== 'ok') { return }
    this.s.tagName !== 'VIDEO' && this.changeTagName('img');
    let pagePath = state.app.currentFile.split('/').slice(0, -1);
    let imgPath = detail.split('/').slice(0, -1);
    let commonSegments = 0;
    while (commonSegments < pagePath.length && imgPath[commonSegments] === pagePath[commonSegments]) { commonSegments++ }
    let backsteps = pagePath.length - commonSegments;
    this.s.src = new Array(backsteps).fill('../').join('') + detail;
    post('app.pushHistory');
  };
  
  changeBgUpload = async () => {
    if (!this.s) { return }
    let [btn, detail] = await showModal(d.el(ImageGalleryDialog));
    if (btn !== 'ok') { return }
    let pagePath = state.app.currentFile.split('/').slice(0, -1);
    let imgPath = detail.split('/').slice(0, -1);
    let commonSegments = 0;
    while (commonSegments < pagePath.length && imgPath[commonSegments] === pagePath[commonSegments]) { commonSegments++ }
    let backsteps = pagePath.length - commonSegments;
    this.s.style.backgroundImage = `url(${JSON.stringify(new Array(backsteps).fill('../').join('') + detail)})`;
    post('app.pushHistory');
  };
  
  changeHtml = async () => {
    let clone = this.s.cloneNode(true);
    clearComponents(clone);
    let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Change HTML', initialValue: clone.outerHTML }));
    if (btn !== 'ok') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = x;
    await setComponents(state.app.currentSite, p.children[i]);
    this.s = p.children[i];
    d.update();
    post('app.pushHistory');
  };
  
  changeInnerHtml = async () => {
    let clone = this.s.cloneNode(true);
    clearComponents(clone);
    let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Change inner HTML', initialValue: clone.innerHTML }));
    if (btn !== 'ok') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.innerHTML = x;
    await setComponents(state.app.currentSite, p.children[i]);
    this.s = p.children[i];
    d.update();
    post('app.pushHistory');
  };
  
  toggleHidden = ev => {
    if (!this.s || this.s.tagName === 'BODY') { return }
    this.s.hidden = !this.s.hidden;
    if (!this.s.hidden && this.s.tagName === 'DIALOG') { this.s.open = false; this.s.showModal() }
    post('app.pushHistory');
  };

  netlifyDeploy = () => post('app.netlifyDeploy');

  undo = () => {
    if (this.s?.tagName === 'INPUT' || this.s?.tagName === 'TEXTAREA') { return }
    post('app.undo');
  };

  redo = () => {
    if (this.s?.tagName === 'INPUT' || this.s?.tagName === 'TEXTAREA') { return }
    post('app.redo');
  };

  setEventHandlers = async () => {
    if (!this.s) { return }

    let handlers = [];
    for (let x of this.s.attributes) {
      if (!x.name.startsWith('wf-on')) { continue }
      handlers.push({ name: x.name.slice('wf-on'.length), expr: x.value });
    }

    let [btn, ...newHandlers] = await showModal(d.el(EventHandlersDialog, { handlers }));
    if (btn !== 'ok') { return }

    let toBeRemoved = [];
    for (let x of this.s.attributes) {
      if (!x.name.startsWith('wf-on')) { continue }
      toBeRemoved.push(x.name);
    }

    toBeRemoved.forEach(x => this.s.removeAttribute(x));

    for (let x of newHandlers) { this.s.setAttribute(`wf-on${x.name}`, x.expr) }
    post('app.pushHistory');
  };

  setIfExpression = async () => {
    if (!this.s) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set if expression', placeholder: 'Expression', initialValue: this.s.getAttribute('wf-if') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('wf-if', x.trim()) : this.s.removeAttribute('wf-if');
    post('app.pushHistory');
  };

  setMapExpression = async () => {
    if (!this.s) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set map expression', placeholder: 'Expression', initialValue: this.s.getAttribute('wf-map') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('wf-map', x.trim()) : this.s.removeAttribute('wf-map');
    post('app.pushHistory');
  };

  setPlaceholder = async () => {
    if (!this.s || (this.s.tagName !== 'INPUT' && this.s.tagName !== 'TEXTAREA')) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set input placeholder', initialValue: this.s.getAttribute('placeholder') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('placeholder', x.trim()) : this.s.removeAttribute('placeholder');
    post('app.pushHistory');
  };

  toggleDarkMode = () => this.editorDocument.documentElement.classList.toggle('dark');

  changeDisabledExpression = async () => {
    if (!this.s || (this.s.tagName !== 'INPUT' && this.s.tagName !== 'TEXTAREA' && this.s.tagName !== 'BUTTON')) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change disabled expression', initialValue: this.s.getAttribute('wf-disabled') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('wf-disabled', x.trim()) : this.s.removeAttribute('wf-disabled');
    post('app.pushHistory');
  };

  changeType = async () => {
    if (!this.s || (this.s.tagName !== 'INPUT' && this.s.tagName !== 'BUTTON')) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change input type', initialValue: this.s.getAttribute('type') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('type', x.trim()) : this.s.removeAttribute('type');
    post('app.pushHistory');
  };

  changeFormMethod = async () => {
    if (!this.s || this.s.tagName !== 'FORM') { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change form method', initialValue: this.s.getAttribute('method') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('method', x.trim()) : this.s.removeAttribute('method');
    post('app.pushHistory');
  };

  changeId = async () => {
    if (!this.s) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change ID', initialValue: this.s.getAttribute('id') }));
    if (btn !== 'ok') { return }
    x.trim() ? this.s.setAttribute('id', x.trim()) : this.s.removeAttribute('id');
    post('app.pushHistory');
  };

  setComponent = async () => {
    if (!this.s) { return }
    let [btn, component, props] = await showModal(d.el(ComponentsDialog, { component: this.s.getAttribute('wf-component'), props: this.s.getAttribute('wf-props') }));
    if (btn !== 'ok') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    let templRoot = d.el('div');
    templRoot.setAttribute('wf-component', component);
    props && templRoot.setAttribute('wf-props', props);
    this.s.replaceWith(templRoot);
    await setComponents(state.app.currentSite, p.children[i]);
    this.s = p.children[i];
    post('app.pushHistory');
  };

  setValue = async () => {
    if (!this.s || (this.s.tagName !== 'INPUT' && this.s.tagName !== 'BUTTON')) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set value', initialValue: this.s.value }));
    if (btn !== 'ok') { return }
    this.s.value = x;
    post('app.pushHistory');
  };

  setInnerHtmlExpression = async () => {
    if (!this.s || this.s.tagName === 'INPUT' || this.s.tagName === 'TEXTAREA') { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set inner HTML expression', initialValue: this.s.getAttribute('wf-innerhtml') }));
    if (btn !== 'ok') { return }
    x = x.trim();
    x ? this.s.setAttribute('wf-innerhtml', x) : this.s.removeAttribute('wf-innerhtml');
    post('app.pushHistory');
  };

  evalJs = async () => {
    let lastEval = localStorage.getItem('webfoundry:lastEval');
    let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Evaluate JavaScript', mode: 'javascript', initialValue: lastEval }));
    if (btn !== 'ok') { return }
    localStorage.setItem('webfoundry:lastEval', x);
    try { new Function(x).call(this.s) }
    finally { post('app.pushHistory') }
  };
  
  changeName = async () => {
    if (!this.s || (this.s.tagName !== 'INPUT' && this.s.tagName !== 'TEXTAREA' && this.s.tagName !== 'BUTTON')) { return }
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change form name', initialValue: this.s.name }));
    if (btn !== 'ok') { return }
    this.s.name = x;
    post('app.pushHistory');
  };

  changeEmmet = async () => {
    let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change Emmet', initialValue: localStorage.getItem('webfoundry:lastEmmet') || '' }));
    if (btn !== 'ok') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = emmet(x);
    this.s = p.children[i];
    post('app.pushHistory');
  };

  kbds = {
    Escape: this.sToggle,
    '{': this.changeMeta,
    ';': this.scrollIntoView,
    ':': this.scrollIntoViewBottom,
    ArrowLeft: this.selectParent,
    h: this.selectParent,
    ArrowDown: this.selectNext,
    j: this.selectNext,
    'Ctrl-ArrowDown': this.mvDown,
    J: this.mvDown,
    ArrowUp: this.selectPrev,
    k: this.selectPrev,
    'Ctrl-ArrowUp': this.mvUp,
    K: this.mvUp,
    ArrowRight: this.selectFirstChild,
    l: this.selectFirstChild,
    'Ctrl-ArrowRight': this.selectLastChild,
    L: this.selectLastChild,
    a: this.createAfter,
    A: this.createBefore,
    i: this.createInsideLast,
    I: this.createInsideFirst,
    d: this.rm,
    'Backspace': this.rm,
    'Delete': this.rm,
    c: this.copy,
    p: this.pasteAfter,
    P: this.pasteBefore,
    o: this.pasteInsideLast,
    O: this.pasteInsideFirst,
    w: this.wrap,
    W: this.unwrap,
    e: this.changeTag,
    t: this.changeText,
    T: this.changeMultilineText,
    H: this.changeHref,
    s: this.changeSrcUrl,
    b: this.changeBgUrl,
    S: this.changeSrcUpload,
    B: this.changeBgUpload,
    m: this.changeHtml,
    M: this.changeInnerHtml,
    x: this.toggleHidden,
    D: this.netlifyDeploy,
    'Ctrl-z': this.undo,
    'Ctrl-y': this.redo,
    'Ctrl-o': this.setEventHandlers,
    'Ctrl-i': this.setIfExpression,
    'Ctrl-m': this.setMapExpression,
    'Ctrl-p': this.setPlaceholder,
    'Alt-d': this.toggleDarkMode,
    'Ctrl-D': this.changeDisabledExpression,
    'Ctrl-e': this.changeType,
    'Ctrl-M': this.changeFormMethod,
    'Ctrl-I': this.changeId,
    'Ctrl-c': this.setComponent,
    'Ctrl-v': this.setValue,
    'Ctrl-M': this.setInnerHtmlExpression,
    'Ctrl-x': this.evalJs,
    'Ctrl-b': this.changeName,
    'Ctrl-C': this.changeEmmet,
  };
}

export default ActionHandler;
