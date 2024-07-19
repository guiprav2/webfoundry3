import ActionHandler from '../other/ActionHandler.js';
import ChangeSrcDialog from '../components/dialogs/ChangeSrcDialog.js';
import CodeDialog from '../components/dialogs/CodeDialog.js';
import ComponentsDialog from '../components/dialogs/ComponentsDialog.js';
import DesignerContextMenu from '../components/DesignerContextMenu.js';
import EventHandlersDialog from '../components/dialogs/EventHandlersDialog.js';
import ImageGalleryDialog from '../components/dialogs/ImageGalleryDialog.js';
import MagicGloves from '../other/MagicGloves.js';
import PromptDialog from '../components/dialogs/PromptDialog.js';
import d from '../other/dominant.js';
import emmet from 'https://cdn.skypack.dev/emmet';
import html2canvas from 'https://cdn.skypack.dev/html2canvas';
import lf from 'https://cdn.skypack.dev/localforage';
import rfiles from '../repositories/FilesRepository.js';
import { clearComponents, setComponents, showModal } from '../other/util.js';

class EditorCtrl {
  state = {
    designerWidth: '100%',
    designerHeight: '100vh',
    preview: false,

    buildFrameSrc: () => {
      if (!state.app.currentSite || !state.app.currentFile) { return '' }
      let src = `${this.state.preview ? 'preview' : 'files'}/${state.app.currentSite}/${!this.state.preview ? state.app.currentFile : state.app.currentFile.replace('pages/', '')}`
      if (this.state.qsPreview) { src += `?${this.state.qsPreview}` }
      return src;
    },

    hasActionHandler: key => this.state.actions && Boolean(this.state.actions.kbds[key]),
    s: null,

    get styles() {
      let { s } = this;

      if (s instanceof Set) {
        return [...[...s].map(x => new Set([...x.classList, ...getWfClass(x)])).reduce((a, b) => a.intersection(b))];
      } else {
        let styles = s ? [...s.classList] : [];
        if (s?.tagName === 'BODY' && styles.includes('min-h-screen')) { styles.splice(styles.indexOf('min-h-screen'), 1) }
        s && styles.push(...getWfClass(s));
        return styles;
      }
    },

    get isComponent() { return this.editorWindow.location.pathname.split('/')[3] === 'components' }
  };

  actions = {
    togglePreview: () => {
      this.state.preview = !this.state.preview;
      if (this.state.preview) {
        post('editor.changeSelected', null);
        if (this.state.currentPanel === 'styles') { this.state.currentPanel = 'files' }
      }
    },

    loadDesigner: async ev => {
      let iframe = ev.target;
      let contents = iframe.closest('.Designer-contents');
      this.state.gloves?.destroy?.();
      this.state.actions = null;
      if (this.state.preview) { this.state.designerLoading = false; return }
      this.state.gloves = new MagicGloves(iframe);
      await setComponents(state.app.currentSite, iframe.contentDocument.documentElement);
      this.state.editorWindow = iframe.contentWindow;
      this.state.editorDocument = iframe.contentDocument;
      this.state.actions = new ActionHandler();
      //this.state.editorDocument.querySelectorAll('*').forEach(x => { !x.id && x.setAttribute('id', nanoid()) });
      this.state.designerLoading = false;
      post('editor.pushHistory');
      let mutobs = new MutationObserver(() => post('app.saveFile', state.app.currentFile, `<!doctype html>\n${this.state.editorDocument.documentElement.outerHTML}`));
      mutobs.observe(this.state.editorDocument.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
      setTimeout(() => post('editor.snapshot'), 1000);
    },

    snapshot: async () => {
      if (state.app.currentFile !== 'pages/index.html') { return }
      let canvas = await html2canvas(this.state.editorDocument.body, { height: 720 });
      canvas.toBlob(blob => rfiles.saveFile(state.app.currentSite, 'webfoundry/snapshot.png', blob));
    },

    resizeDesigner: ev => {
      ev.target.setPointerCapture(ev.pointerId);
      ev.target.addEventListener('pointermove', this.onResizeDesignerPointerMove);
      ev.target.addEventListener('pointerup', this.onResizeDesignerPointerUp, { once: true });
    },

    changeSelected: x => {
      this.state.s = x;
      if (x && this.state.prevPanel) { this.state.currentPanel = this.state.prevPanel }
      if (!x && (this.state.currentPanel === 'styles' || this.state.currentPanel === 'actions')) {
        this.state.prevPanel = this.state.currentPanel;
        this.state.currentPanel = 'files';
      }
    },

    addSelection: x => {
      if (!(this.state.s instanceof Set)) { this.state.s = new Set([this.state.s]) }
      this.state.s.add(x);
      if (x && this.state.prevPanel) { this.state.currentPanel = this.state.prevPanel }
      if (!x && (this.state.currentPanel === 'styles' || this.state.currentPanel === 'actions')) {
        this.state.prevPanel = this.state.currentPanel;
        this.state.currentPanel = 'files';
      }
    },

    kbdAction: x => this.kbdActions[x](),

    addStyleKeyDown: async ev => {
      if (ev.key !== 'Enter') { return }
      await post('editor.addStyle', ev.target.value.trim());
      ev.target.value = '';
    },

    editStyle: x => this.state.replacingStyle = x,
    replaceStyleKeyDown: ev => ev.key === 'Enter' && ev.target.blur(),

    replaceStyleBlur: async ev => {
      await post('editor.deleteStyle', this.state.replacingStyle);
      await post('editor.addStyle', ev.target.value.trim());
      this.state.replacingStyle = null;
      ev.target.value = '';
    },

    addStyle: async x => {
      if (/^{{.+?}}$/.test(x)) { this.state.s instanceof Set ? this.state.s.forEach(sx => addWfClass(sx, x)) : addWfClass(this.state.s, x)}
      else { this.state.s instanceof Set ? this.state.s.forEach(sx => sx.classList.add(x)) : this.state.s.classList.add(x)}
      await post('editor.pushHistory');
    },

    deleteStyle: async x => {
      if (/^{{.+?}}$/.test(x)) { this.state.s instanceof Set ? this.state.s.forEach(sx => rmWfClass(sx, x)) : rmWfClass(this.state.s, x)}
      else { this.state.s instanceof Set ? this.state.s.forEach(sx => sx.classList.remove(x)) : this.state.s.classList.remove(x)}
      await post('editor.pushHistory');
    },

    contextMenu: where => {
      let iframe = document.querySelector('.Designer iframe');
      let onNestedContextMenu = ev => ev.preventDefault();

      let closeContextMenu = () => {
        removeEventListener('click', onClick);
        removeEventListener('contextmenu', onNestedContextMenu);
        this.state.contextMenu = null;
        iframe.classList.remove('pointer-events-none');
        d.updateSync();
        iframe.focus();
      };

      let onClick = ev => !this.state.contextMenu.contains(ev.target) && closeContextMenu();
      addEventListener('click', onClick);

      iframe.blur();
      addEventListener('contextmenu', onNestedContextMenu);
      let { x, y } = where;
      let iframeRect = iframe.getBoundingClientRect();
      x += iframeRect.left - 10;
      y += iframeRect.top - 10;
      iframe.classList.add('pointer-events-none');
      this.state.contextMenu = d.html`
        <div class="fixed z-[1000]" ${{ style: { left: `${x}px`, top: `${y}px` } }}>
          ${d.el(DesignerContextMenu, { state, post, close: closeContextMenu })}
        </div>
      `;
      d.update();
    },

    pushHistory: () => {
      let iframe = document.querySelector('.Designer iframe');
      let html = iframe.contentDocument.documentElement.outerHTML;
      let { history } = this.state;
      history.entries.splice(history.i + 1, 99999);
      history.entries.push(html);
      history.i++;
    },

    undo: () => {
      let iframe = document.querySelector('.Designer iframe');
      let { history } = this.state;
      if (!history.i) { return }
      this.state.s && post('editor.changeSelected', null);
      history.i--;
      let doc = new DOMParser().parseFromString(history.entries[history.i], 'text/html');
      let dt = doc.querySelector('head > title');
      let ft = iframe.contentDocument.querySelector('head > title');
      if (dt) {
        if (!ft) { ft = document.createElement('title'); iframe.contentDocument.head.append(ft) }
        ft.textContent = dt.textContent;
      }
      iframe.contentDocument.body.outerHTML = doc.body.outerHTML;
    },

    redo: () => {
      let iframe = document.querySelector('.Designer iframe');
      let { history } = this.state;
      if (history.i >= history.entries.length - 1) { return }
      this.state.s && post('editor.changeSelected', null);
      history.i++;
      let doc = new DOMParser().parseFromString(history.entries[history.i], 'text/html');
      iframe.contentDocument.body.outerHTML = doc.body.outerHTML;
    },

    changeCodeEditor: async (site, path, x) => await rfiles.saveFile(site, path, new Blob([x], { type: mimeLookup(state.app.currentFile) })),

    // ---

    sToggle: () => {
      if (this.state.s instanceof Set || this.state.sPrev instanceof Set) {
        if (this.state.s) { this.state.sPrev = this.state.s; this.state.s = null }
        else { this.state.s = new Set([...this.state.sPrev].filter(x => this.state.editorDocument.contains(x))) }
      } else {
        if (this.state.s) { this.state.sPrev = this.state.s; this.state.s = null }
        else if (this.state.editorDocument.contains(this.state.sPrev)) { this.state.s = this.state.sPrev; this.state.sPrev = null }
      }
    },

    select: x => {
      if (!this.state.s || this.state.s instanceof Set) { return }
      let y = this.state.s[x];
      if (this.state.isComponent && !this.state.editorDocument.body.firstElementChild.contains(y)) { return }
      let closestComponentRoot = y && y.closest('[wf-component]');
      if (closestComponentRoot) { y = closestComponentRoot }
      y && this.state.editorDocument.contains(y) && this.state.editorDocument.documentElement !== y && this.state.editorDocument.head !== y && (this.state.s = y);
    },
    
    mv: i => {
      if (!this.state.s || this.state.s instanceof Set) { return }
      let p = this.state.s.parentElement, j = [...p.childNodes].indexOf(this.state.s), k = 1, pv;
      while (true) {
        pv = p.childNodes[j + (i * k)];
        if (!pv || (pv.nodeType !== Node.COMMENT_NODE && pv.nodeType !== Node.TEXT_NODE) || pv.textContent.trim()) { break }
        k++;
      }
      pv && p.insertBefore(this.state.s, i < 1 ? pv : pv.nextSibling);
    },

    create: async pos => {
      if (!this.state.s || this.state.s instanceof Set) { return }
      let p = this.state.s.parentElement, j = [...p.childNodes].indexOf(this.state.s), k = 1, pv;
      if (this.state.isComponent && this.state.s === this.state.editorDocument.body.firstElementChild && (pos === 'beforebegin' || pos === 'afterend')) { return }
      if (this.state.s.tagName === 'BODY' && (pos === 'beforebegin' || pos === 'afterend')) { return }
      let x = d.html`<div>`;
      this.state.s.insertAdjacentElement(pos, x);
      this.state.s = x;
      await post('editor.pushHistory');
    },

    cp: async () => {
      if (!this.state.s || this.state.s instanceof Set) { return }
      this.state.s && await lf.setItem('webfoundry.copy', this.state.s.outerHTML);
    },
    
    paste: async pos => {
      if (!this.state.s || this.state.s instanceof Set) { return }
      if (this.state.isComponent && this.state.s === this.state.editorDocument.body.firstElementChild && (pos === 'beforebegin' || pos === 'afterend')) { return }
      if (this.state.s.tagName === 'BODY' && (pos === 'beforebegin' || pos === 'afterend')) { return }
      let x = d.html`<div>`;
      x.innerHTML = await lf.getItem('webfoundry.copy');
      let y = x.firstElementChild;
      this.state.s.insertAdjacentElement(pos, y);
      this.state.s = y;
      await post('editor.pushHistory');
    },

    rm: async () => {
      let { editorDocument } = this.state;
      if (this.state.s === editorDocument.documentElement || this.state.s === editorDocument.body || this.state.s === editorDocument.head) { return }
      await post('editor.cp');
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      this.state.s.remove();
      this.state.s = p.children[i] || p.children[i - 1] || p;
      await post('editor.pushHistory');
    },
    
    wrap: async x => {
      if (!this.state.s || this.state.s.tagName === 'BODY') { return }
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      this.state.s.outerHTML = `<${x}>${this.state.s.outerHTML}</${x}>`;
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },
    
    unwrap: async () => {
      if (!this.state.s || this.state.s.tagName === 'BODY') { return }
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      this.state.s.outerHTML = this.state.s.innerHTML;
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },
    
    changeTag: async () => {
      if (!this.state.s || this.state.s.tagName === 'BODY') { return }
      let tagName = this.state.s.tagName.toLowerCase();
      let [btn, x] = await showModal(d.el(PromptDialog, { short: true, title: 'Change tag', placeholder: 'Tag name', initialValue: tagName }));
      if (btn !== 'ok') { return }
      if (this.state.s.tagName === 'DIALOG' && x !== 'dialog') { this.state.s.open = false }
      await post('editor.changeTagName', x);
      if (x === 'dialog') { this.state.s.open = false; this.state.s.showModal() }
      await post('editor.pushHistory');
    },
    
    changeTagName: async x => {
      if (!this.state.s || this.state.s.tagName === 'BODY') { return }
      let tagName = this.state.s.tagName.toLowerCase();
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      if (x === 'img' || x === 'video' || x === 'br' || x === 'hr') { this.state.s.innerHTML = '' }
      this.state.s.outerHTML = this.state.s.outerHTML.replace(tagName, x);
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },
    
    changeText: async () => {
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change text', placeholder: 'Text', initialValue: this.state.s.textContent }));
      if (btn !== 'ok') { return }
      this.state.s.textContent = x;
      await post('editor.pushHistory');
    },
    
    changeMultilineText: async () => {
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change multiline text', placeholder: 'Text', multiline: true, initialValue: this.state.s.textContent }));
      if (btn !== 'ok') { return }
      this.state.s.textContent = x;
      await post('editor.pushHistory');
    },

    changeHref: async () => {
      let [btn, x] = await showModal(d.el(PromptDialog, { short: true, title: 'Change href', placeholder: 'URL', initialValue: this.state.s.getAttribute('href') }));
      if (btn !== 'ok') { return }
      if (this.state.s.tagName === 'DIV' || this.state.s.tagName === 'SPAN') { await post('editor.changeTagName', 'a') }
      else if (this.state.s.tagName !== 'A') { await post('editor.wrap', 'a') }
      if (x) { this.state.s.href = x } else { this.state.s.removeAttribute('href') }
      await post('editor.pushHistory');
    },

    changeSrcUrl: async () => {
      if (!this.state.s) { return }
      let [btn, src, expr] = await showModal(d.el(ChangeSrcDialog, { initialSrcValue: this.state.s.getAttribute('src'), initialExprValue: this.state.s.getAttribute('wf-src') }));
      if (btn !== 'ok') { return }
      this.state.s.tagName !== 'VIDEO' && this.state.s.tagName !== 'AUDIO' && this.state.s.tagName !== 'IFRAME' && await post('editor.changeTagName', 'img');
      if (src) { this.state.s.src = src } else { this.state.s.removeAttribute('src') }
      if (expr) { this.state.s.setAttribute('wf-src', expr) } else { this.state.s.removeAttribute('wf-src') }
      await post('editor.pushHistory');
    },

    changeSrcUpload: async () => {
      if (!this.state.s) { return }
      let [btn, detail] = await showModal(d.el(ImageGalleryDialog));
      if (btn !== 'ok') { return }
      this.state.s.tagName !== 'IMG' && await post('editor.changeTagName', 'img');
      let pagePath = state.app.currentFile.split('/').slice(0, -1);
      let imgPath = detail.split('/').slice(0, -1);
      let commonSegments = 0;
      while (commonSegments < pagePath.length && imgPath[commonSegments] === pagePath[commonSegments]) { commonSegments++ }
      let backsteps = pagePath.length - commonSegments;
      this.state.s.src = new Array(backsteps).fill('../').join('') + detail;
      await post('editor.pushHistory');
    },

    changeBgUrl: async () => {
      if (!this.state.s) { return }
      let current = this.state.s.style.backgroundImage;
      let [btn, x] = await showModal(d.el(PromptDialog, {
        short: true,
        title: 'Change background image',
        placeholder: 'URL',
        initialValue: current.startsWith('url("') ? current.slice(5, -2) : current,
      }));
      if (btn !== 'ok') { return }
      if (x) { this.state.s.style.backgroundImage = `url(${JSON.stringify(x)})` }
      else { this.state.s.style.backgroundImage = '' }
      await post('editor.pushHistory');
    },

    changeBgUpload: async () => {
      if (!this.state.s) { return }
      let [btn, detail] = await showModal(d.el(ImageGalleryDialog));
      if (btn !== 'ok') { return }
      let pagePath = state.app.currentFile.split('/').slice(0, -1);
      let imgPath = detail.split('/').slice(0, -1);
      let commonSegments = 0;
      while (commonSegments < pagePath.length && imgPath[commonSegments] === pagePath[commonSegments]) { commonSegments++ }
      let backsteps = pagePath.length - commonSegments;
      this.state.s.style.backgroundImage = `url(${JSON.stringify(new Array(backsteps).fill('../').join('') + detail)})`;
      await post('editor.pushHistory');
    },

    changeHtml: async () => {
      let clone = this.state.s.cloneNode(true);
      clearComponents(clone);
      let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Change HTML', initialValue: clone.outerHTML }));
      if (btn !== 'ok') { return }
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      this.state.s.outerHTML = x;
      await setComponents(state.app.currentSite, p.children[i]);
      if (p.children[i].outerHTML === '<head></head>') { p.children[i].remove() } // Workaround for weird Firefox bug
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },

    changeInnerHtml: async () => {
      let clone = this.state.s.cloneNode(true);
      clearComponents(clone);
      let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Change inner HTML', initialValue: clone.innerHTML }));
      if (btn !== 'ok') { return }
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      this.state.s.innerHTML = x;
      await setComponents(state.app.currentSite, p.children[i]);
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },

    toggleHidden: async ev => {
      if (!this.state.s || this.state.s.tagName === 'BODY') { return }
      this.state.s.hidden = !this.state.s.hidden;
      if (!this.state.s.hidden && this.state.s.tagName === 'DIALOG') { this.state.s.open = false; this.state.s.showModal() }
      await post('editor.pushHistory');
    },

    setEventHandlers: async () => {
      if (!this.state.s) { return }

      let handlers = [];
      for (let x of this.state.s.attributes) {
        if (!x.name.startsWith('wf-on')) { continue }
        handlers.push({ name: x.name.slice('wf-on'.length), expr: x.value });
      }

      let [btn, ...newHandlers] = await showModal(d.el(EventHandlersDialog, { handlers }));
      if (btn !== 'ok') { return }

      let toBeRemoved = [];
      for (let x of this.state.s.attributes) {
        if (!x.name.startsWith('wf-on')) { continue }
        toBeRemoved.push(x.name);
      }

      toBeRemoved.forEach(x => this.state.s.removeAttribute(x));

      for (let x of newHandlers) { this.state.s.setAttribute(`wf-on${x.name}`, x.expr) }
      await post('editor.pushHistory');
    },

    setIfExpression: async () => {
      if (!this.state.s) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set if expression', placeholder: 'Expression', initialValue: this.state.s.getAttribute('wf-if') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('wf-if', x.trim()) : this.state.s.removeAttribute('wf-if');
      await post('editor.pushHistory');
    },

    setMapExpression: async () => {
      if (!this.state.s) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set map expression', placeholder: 'Expression', initialValue: this.state.s.getAttribute('wf-map') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('wf-map', x.trim()) : this.state.s.removeAttribute('wf-map');
      await post('editor.pushHistory');
    },

    setPlaceholder: async () => {
      if (!this.state.s || (this.state.s.tagName !== 'INPUT' && this.state.s.tagName !== 'TEXTAREA')) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set input placeholder', initialValue: this.state.s.getAttribute('placeholder') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('placeholder', x.trim()) : this.state.s.removeAttribute('placeholder');
      await post('editor.pushHistory');
    },

    changeDisabledExpression: async () => {
      if (!this.state.s || (this.state.s.tagName !== 'INPUT' && this.state.s.tagName !== 'TEXTAREA' && this.state.s.tagName !== 'BUTTON')) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change disabled expression', initialValue: this.state.s.getAttribute('wf-disabled') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('wf-disabled', x.trim()) : this.state.s.removeAttribute('wf-disabled');
      await post('editor.pushHistory');
    },

    changeType: async () => {
      if (!this.state.s || (this.state.s.tagName !== 'INPUT' && this.state.s.tagName !== 'BUTTON')) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change input type', initialValue: this.state.s.getAttribute('type') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('type', x.trim()) : this.state.s.removeAttribute('type');
      await post('editor.pushHistory');
    },

    changeFormMethod: async () => {
      if (!this.state.s || this.state.s.tagName !== 'FORM') { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change form method', initialValue: this.state.s.getAttribute('method') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('method', x.trim()) : this.state.s.removeAttribute('method');
      await post('editor.pushHistory');
    },

    changeId: async () => {
      if (!this.state.s) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change ID', initialValue: this.state.s.getAttribute('id') }));
      if (btn !== 'ok') { return }
      x.trim() ? this.state.s.setAttribute('id', x.trim()) : this.state.s.removeAttribute('id');
      await post('editor.pushHistory');
    },

    setComponent: async () => {
      if (!this.state.s) { return }
      let [btn, component, props] = await showModal(d.el(ComponentsDialog, { component: this.state.s.getAttribute('wf-component'), props: this.state.s.getAttribute('wf-props') }));
      if (btn !== 'ok') { return }
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      let templRoot = d.el('div');
      templRoot.setAttribute('wf-component', component);
      props && templRoot.setAttribute('wf-props', props);
      this.state.s.replaceWith(templRoot);
      await setComponents(state.app.currentSite, p.children[i]);
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },

    setInnerHtmlExpression: async () => {
      if (!this.state.s || this.state.s.tagName === 'INPUT' || this.state.s.tagName === 'TEXTAREA') { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set inner HTML expression', initialValue: this.state.s.getAttribute('wf-innerhtml') }));
      if (btn !== 'ok') { return }
      x = x.trim();
      x ? this.state.s.setAttribute('wf-innerhtml', x) : this.state.s.removeAttribute('wf-innerhtml');
      await post('editor.pushHistory');
    },

    evalJs: async () => {
      let lastEval = localStorage.getItem('webfoundry:lastEval');
      let [btn, x] = await showModal(d.el(CodeDialog, { title: 'Evaluate JavaScript', mode: 'javascript', initialValue: lastEval }));
      if (btn !== 'ok') { return }
      localStorage.setItem('webfoundry:lastEval', x);
      try { new Function(x).call(this.state.s) }
      finally { await post('editor.pushHistory') }
    },
    
    changeName: async () => {
      if (!this.state.s || (this.state.s.tagName !== 'INPUT' && this.state.s.tagName !== 'TEXTAREA' && this.state.s.tagName !== 'BUTTON')) { return }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change form name', initialValue: this.state.s.name }));
      if (btn !== 'ok') { return }
      this.state.s.name = x;
      await post('editor.pushHistory');
    },

    changeEmmet: async () => {
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Change Emmet', initialValue: localStorage.getItem('webfoundry:lastEmmet') || '' }));
      if (btn !== 'ok') { return }
      let p = this.state.s.parentElement, i = [...p.children].indexOf(this.state.s);
      this.state.s.outerHTML = emmet(x);
      this.state.s = p.children[i];
      await post('editor.pushHistory');
    },

    normalizeStylesUnion: async () => {
      if (!(state.editor.s instanceof Set)) { return }
      new Set([...state.editor.s].flatMap(x => [...x.classList])).forEach(x => state.editor.s.forEach(y => y.classList.add(x)));
      await post('editor.pushHistory');
    },

    normalizeStylesIntersect: async () => {
      if (!(state.editor.s instanceof Set)) { return }
      let xs = new Set([...state.editor.s].map(x => new Set([...x.classList])).reduce((a, b) => a.intersection(b)));
      for (let y of state.editor.s) {
        for (let z of y.classList) {
          if (!xs.has(z)) { y.classList.remove(z) }
        }
      }
      await post('editor.pushHistory');
    },

    setPageTitle: async () => {
      let title = this.state.editorDocument.querySelector('head > title');
      if (!title) { title = document.createElement('title'); this.state.editorDocument.head.append(title) }
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Set page title', initialValue: title.textContent || '' }));
      if (btn !== 'ok') { return }
      title.textContent = x;
      await post('editor.pushHistory');
    },
  };

  onResizeDesignerPointerMove = ev => {
    let w = Math.max(320, ev.clientX - document.querySelector('.Designer-padder').getBoundingClientRect().right);
    this.state.designerWidth = `min(100%, ${w}px)`;
    this.state.designerHeight = w >= 640 ? '100vh' : `${w * 1.777}px`;
    d.update();
  };

  onResizeDesignerPointerUp = ev => {
    ev.target.removeEventListener('pointermove', this.onResizeDesignerPointerMove);
    ev.target.releasePointerCapture(ev.pointerId);
  };

  kbdActions = {
    Escape: () => post('editor.sToggle'),
    ArrowLeft: () => post('editor.select', 'parentElement'),
    h: () => post('editor.select', 'parentElement'),
    ArrowDown: () => post('editor.select', 'nextElementSibling'),
    j: () => post('editor.select', 'nextElementSibling'),
    'Ctrl-ArrowDown': () => post('editor.mv', 1),
    J: () => post('editor.mv', 1),
    ArrowUp: () => post('editor.select', 'previousElementSibling'),
    k: () => post('editor.select', 'previousElementSibling'),
    'Ctrl-ArrowUp': () => post('editor.mv', -1),
    K: () => post('editor.mv', -1),
    ArrowRight: () => post('editor.select', 'firstElementChild'),
    l: () => post('editor.select', 'firstElementChild'),
    'Ctrl-ArrowRight': () => post('editor.select', 'lastElementChild'),
    L: () => post('editor.select', 'lastElementChild'),
    a: () => post('editor.create', 'afterend'),
    A: () => post('editor.create', 'beforebegin'),
    i: () => post('editor.create', 'beforeend'),
    I: () => post('editor.create', 'afterbegin'),
    Backspace: () => post('editor.rm'),
    Delete: () => post('editor.rm'),
    d: () => post('editor.rm'),
    c: () => post('editor.cp'),
    p: () => post('editor.paste', 'afterend'),
    P: () => post('editor.paste', 'beforebegin'),
    o: () => post('editor.paste', 'beforeend'),
    O: () => post('editor.paste', 'afterbegin'),
    w: () => post('editor.wrap', 'div'),
    W: () => post('editor.unwrap'),
    e: () => post('editor.changeTag'),
    t: () => post('editor.changeText'),
    T: () => post('editor.changeMultilineText'),
    H: () => post('editor.changeHref'),
    s: () => post('editor.changeSrcUrl'),
    S: () => post('editor.changeSrcUpload'),
    b: () => post('editor.changeBgUrl'),
    B: () => post('editor.changeBgUpload'),
    m: () => post('editor.changeHtml'),
    M: () => post('editor.changeInnerHtml'),
    x: () => post('editor.toggleHidden'),
    D: () => post('app.netlifyDeploy'),
    'Ctrl-z': () => post('editor.undo'),
    'Ctrl-y': () => post('editor.redo'),
    'Ctrl-o': () => post('editor.setEventHandlers'),
    'Ctrl-i': () => post('editor.setIfExpression'),
    'Ctrl-m': () => post('editor.setMapExpression'),
    'Ctrl-p': () => post('editor.setPlaceholder'),
    'Ctrl-D': () => post('editor.changeDisabledExpression'),
    'Ctrl-e': () => post('editor.changeType'),
    'Ctrl-M': () => post('editor.changeFormMethod'),
    'Ctrl-I': () => post('editor.changeId'),
    'Ctrl-c': () => post('editor.setComponent'),
    'Ctrl-M': () => post('editor.setInnerHtmlExpression'),
    'Ctrl-x': () => post('editor.evalJs'),
    'Ctrl-b': () => post('editor.changeName'),
    'Ctrl-C': () => post('editor.changeEmmet'),
    'Ctrl-u': () => post('editor.normalizeStylesUnion'),
    'Ctrl-U': () => post('editor.normalizeStylesIntersect'),
    'Ctrl-T': () => post('editor.setPageTitle'),
  };
}

function getWfClass(x) { return (x.getAttribute('wf-class') || '').split(/({{.+?}})/g).filter(x => x.trim()) }

function addWfClass(x, y) {
  let attr = getWfClass(x);
  attr.push(y);
  attr = attr.join(' ');
  attr ? x.setAttribute('wf-class', attr) : x.removeAttribute('wf-class');
}

function rmWfClass(x, y) {
  let attr = getWfClass(x);
  let i = attr.indexOf(y);
  i !== -1 && attr.splice(i, 1);
  attr = attr.join(' ');
  attr ? x.setAttribute('wf-class', attr) : x.removeAttribute('wf-class');
}

export default EditorCtrl;
