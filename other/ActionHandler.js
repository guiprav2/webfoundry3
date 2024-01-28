import CodeDialog from '../components/dialogs/CodeDialog.js';
import ImageGalleryDialog from '../components/dialogs/ImageGalleryDialog.js';
import InputDialog from '../components/dialogs/InputDialog.js';
import d from './dominant.js';
import lf from 'https://cdn.skypack.dev/localforage';
import { showModal } from './util.js';
import { useAppCtrl } from '../controllers/AppCtrl.js';

class ActionHandler {
  constructor(designer) {
    this.designer = designer;
    let [state, post] = useAppCtrl();
    Object.assign(this, { state, post });
  }

  get sidebarNode() { return this.designer.sidebarNode }
  get toolbarNode() { return this.designer.editor.toolbarNode }
  get editorWindow() { return this.designer.editorWindow }
  get editorDocument() { return this.designer.editorDocument }
  get s() { return this.state.s }
  set s(x) { this.post('changeSelected', x) }
  
  sToggle = () => {
    let pe = this.s && this.s.closest('[contenteditable="true"]');
    if (pe) { pe.removeAttribute('contenteditable') }
    if (this.s) { this.sPrev = this.s; this.s = null }
    else { this.s = this.sPrev; this.sPrev = null }
    d.update();
  };

  changeMeta = async () => {
    let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Change meta tag', value: this.editorDocument.head.outerHTML }));
    if (btn !== 'ok') { return }
    this.editorDocument.head.outerHTML = x;
  };
  
  scrollIntoView = () => { this.s && this.s.scrollIntoView() };
  scrollIntoViewBottom = () => { this.s && this.s.scrollIntoView({ block: 'end' }) };
  
  selectParent = () => this.select('parentElement');
  selectNext = () => this.select('nextElementSibling');
  selectPrev = () => this.select('previousElementSibling');
  selectFirstChild = () => this.select('firstElementChild');
  selectLastChild = () => this.select('lastElementChild');
  
  select = x => {
    let y = this.s[x];
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
    if (this.s.classList.contains('Placeholder') && (pos === 'afterbegin' || pos === 'beforeend')) { return }
    let x = d.html`<div class="Placeholder">`;
    this.s.insertAdjacentElement(pos, x);
    this.s = x;
    d.update();
  };
  
  copy = async () => { await lf.setItem('copy', this.s.outerHTML) };
  
  pasteAfter = () => { this.paste('afterend') };
  pasteBefore = () => { this.paste('beforebegin') };
  pasteInsideFirst = () => { this.paste('afterbegin') };
  pasteInsideLast = () => { this.paste('beforeend') };
  
  paste = async pos => {
    if (this.s.classList.contains('Placeholder') && (pos === 'afterbegin' || pos === 'beforeend')) { return }
    let x = d.html`<div>`;
    x.innerHTML = await lf.getItem('copy');
    let y = x.firstElementChild;
    this.s.insertAdjacentElement(pos, y);
    this.s = y;
    d.update();
  };
  
  rm = () => {
    let { editorDocument } = this;
    if (this.s === editorDocument.documentElement || this.s === editorDocument.body || this.s === editorDocument.head) { return }
    this.copy();
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.remove();
    this.s = p.children[i] || p.children[i - 1] || p;
    d.update();
  };
  
  wrap = () => { this.wrapTagName('div') };
  
  wrapTagName = x => {
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = `<${x}>${this.s.outerHTML}</${x}>`;
    this.s = p.children[i];
    d.update();
  };
  
  unwrap = () => {
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = this.s.innerHTML;
    this.s = p.children[i];
    d.update();
  };
  
  changeTag = async () => {
    let tagName = this.s.tagName.toLowerCase();
    let [btn, x] = await showModal(d.el(InputDialog, {
    short: true, title: 'Change tag', value: tagName,
    }));
    if (btn !== 'ok') { return }
    if (this.s.tagName === 'DIALOG' && x !== 'dialog') { this.s.open = false }
    this.changeTagName(x);
    if (x === 'dialog') { this.s.open = false; this.s.showModal() }
  };
  
  changeTagName = x => {
    let tagName = this.s.tagName.toLowerCase();
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    if (x === 'img' || x === 'video' || x === 'br' || x === 'hr') { this.s.innerHTML = '' }
    this.s.outerHTML = this.s.outerHTML.replace(tagName, x);
    this.s = p.children[i];
    d.update();
  };
  
  changeText = async () => {
    let [btn, x] = await showModal(d.el(InputDialog, {
    title: 'Change text', value: this.s.textContent,
    }));
    if (btn !== 'ok') { return }
    this.s.classList.remove('Placeholder');
    this.s.textContent = x;
  };
  
  changeMultilineText = async () => {
    let [btn, x] = await showModal(d.el(InputDialog, { title: 'Change multiline text', multiline: true, value: this.s.textContent }));
    if (btn !== 'ok') { return }
    this.s.classList.remove('Placeholder');
    this.s.textContent = x;
  };
  
  changeHref = async () => {
    let [btn, x] = await showModal(d.el(InputDialog, {
    short: true, title: 'Change href', value: this.s.getAttribute('href'),
    }));
    if (btn !== 'ok') { return }
    if (this.s.tagName === 'DIV' || this.s.tagName === 'SPAN') { this.changeTagName('a') }
    else if (this.s.tagName !== 'A') { this.wrapTagName('a') }
    if (x) { this.s.href = x } else { this.s.removeAttribute('href') }
  };
  
  changeSrcUrl = async () => {
    let [btn, x] = await showModal(d.el(InputDialog, {
    short: true, title: 'Change src', value: this.s.src,
    }));
    if (btn !== 'ok') { return }
    this.s.classList.toggle('Placeholder', false);
    this.s.tagName !== 'VIDEO' && this.s.tagName !== 'IFRAME' && this.changeTagName('img');
    if (x) { this.s.src = x } else { this.s.removeAttribute('src') }
  };
  
  changeBgUrl = async () => {
    let current = this.s.style.backgroundImage;
    let [btn, x] = await showModal(d.el(InputDialog, {
    short: true, title: 'Change background image',
    value: current.startsWith('url("') ? current.slice(5, -2) : current,
    }));
    if (btn !== 'ok') { return }
    this.s.classList.toggle('Placeholder', false);
    if (x) { this.s.style.backgroundImage = `url(${JSON.stringify(x)})` }
    else { this.s.style.backgroundImage = '' }
  };
  
  changeSrcUpload = async () => {
    let [btn, detail] = await showModal(d.el(ImageGalleryDialog));
    if (btn !== 'ok') { return }
    this.s.classList.remove('Placeholder');
    this.s.tagName !== 'VIDEO' && this.changeTagName('img');
    let pagePath = this.state.currentFile.split('/').slice(0, -1);
    let imgPath = detail.split('/').slice(0, -1);
    let commonSegments = 0;
    while (commonSegments < pagePath.length && imgPath[commonSegments] === pagePath[commonSegments]) { commonSegments++ }
    let backsteps = pagePath.length - commonSegments;
    this.s.src = new Array(backsteps).fill('../').join('') + detail;
  };
  
  changeBgUpload = async () => {
    let [btn, detail] = await showModal(d.el(ImageGalleryDialog));
    if (btn !== 'ok') { return }
    this.s.classList.remove('Placeholder');
    let pagePath = this.state.currentFile.split('/').slice(0, -1);
    let imgPath = detail.split('/').slice(0, -1);
    let commonSegments = 0;
    while (commonSegments < pagePath.length && imgPath[commonSegments] === pagePath[commonSegments]) { commonSegments++ }
    let backsteps = pagePath.length - commonSegments;
    this.s.style.backgroundImage = `url(${JSON.stringify(new Array(backsteps).fill('../').join('') + detail)})`;
  };
  
  changeHtml = async () => {
    let [btn, x] = await showModal(d.el(CodeDialog, {
    title: 'Change HTML', value: this.s.outerHTML,
    }));
    if (btn !== 'ok') { return }
    let p = this.s.parentElement, i = [...p.children].indexOf(this.s);
    this.s.outerHTML = x;
    this.s = p.children[i];
    d.update();
  };
  
  changeInnerHtml = async () => {
    let [btn, x] = await showModal(d.el(CodeDialog, {
    title: 'Change inner HTML', value: this.s.innerHTML,
    }));
    if (btn !== 'ok') { return }
    this.s.innerHTML = x;
  };
  
  toggleEditable = ev => {
    let pe = this.s.closest('[contenteditable="true"]');
    if (!pe || pe === this.s) {
    let t = pe || this.s;
    if ([...this.s.querySelectorAll('*')].every(x => x.matches('span, button, input, ul, ol, li, br'))) { t = t.parentElement }
    if (!JSON.parse(pe?.contentEditable || false)) { t.contentEditable = true }
    else { t.removeAttribute('contenteditable') }
    ev && ev.preventDefault();
    }
  };
  
  kbds = {
    Escape: this.sToggle,
    '{': this.changeMeta,
    ';': this.scrollIntoView,
    ':': this.scrollIntoViewBottom,
    h: this.selectParent,
    j: this.selectNext,
    J: this.mvDown,
    k: this.selectPrev,
    K: this.mvUp,
    l: this.selectFirstChild,
    L: this.selectLastChild,
    a: this.createAfter,
    A: this.createBefore,
    i: this.createInsideLast,
    I: this.createInsideFirst,
    d: this.rm,
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
    v: this.toggleEditable,
  };
}

export default ActionHandler;