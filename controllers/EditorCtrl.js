import ActionHandler from '../other/ActionHandler.js';
import DesignerContextMenu from '../components/DesignerContextMenu.js';
import MagicGloves from '../other/MagicGloves.js';
import d from '../other/dominant.js';
import html2canvas from 'https://cdn.skypack.dev/html2canvas';
import morphdom from 'https://cdn.skypack.dev/morphdom/dist/morphdom-esm.js';
import rfiles from '../repositories/FilesRepository.js';
import { setComponents } from '../other/util.js';

class EditorCtrl {
  state = {
    designerWidth: '100%',
    designerHeight: '100vh',
    preview: false,

    buildFrameSrc: () => {
      if (!state.app.currentSite || !state.app.currentFile) { return '' }
      let src = `${this.state.preview ? 'preview' : 'files'}/${state.app.currentSite}/${!state.app.preview ? state.app.currentFile : state.app.currentFile.replace('pages/', '')}`
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
        if (s.tagName === 'BODY' && styles.includes('min-h-screen')) { styles.splice(styles.indexOf('min-h-screen'), 1) }
        s && styles.push(...getWfClass(s));
        return styles;
      }
    },
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

    action: x => this.state.actions.kbds[x](),

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
      morphdom(iframe.contentDocument.documentElement, history.entries[history.i]);
    },

    redo: () => {
      let iframe = document.querySelector('.Designer iframe');
      let { history } = this.state;
      if (history.i >= history.entries.length - 1) { return }
      this.state.s && post('editor.changeSelected', null);
      history.i++;
      morphdom(iframe.contentDocument.documentElement, history.entries[history.i]);
    },

    changeCodeEditor: async (site, path, x) => await rfiles.saveFile(site, path, new Blob([x], { type: mimeLookup(state.app.currentFile) })),
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
