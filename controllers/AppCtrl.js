import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.js';
import CreateFileDialog from '../components/dialogs/CreateFileDialog.js';
import FileExtensionWarningDialog from '../components/dialogs/FileExtensionWarningDialog.js';
import ImportingDialog from '../components/dialogs/ImportingDialog.js';
import NetlifyDeployDialog from '../components/dialogs/NetlifyDeployDialog.js';
import NetlifyDeployDoneDialog from '../components/dialogs/NetlifyDeployDoneDialog.js';
import PromptDialog from '../components/dialogs/PromptDialog.js';
import RenameFileDialog from '../components/dialogs/RenameFileDialog.js';
import d from '../other/dominant.js';
import rfiles from '../repositories/FilesRepository.js';
import rsites from '../repositories/SitesRepository.js';
import structuredFiles from '../other/structuredFiles.js';
import tarball from '../other/tarball.js';
import { isImage, joinPath, showModal, loadman, clearComponents } from '../other/util.js';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';
import { nanoid } from 'https://cdn.skypack.dev/nanoid';
import { playgroundHtml, defaultHtml, defaultComponentHtml } from '../other/html.js';
import { runTour } from '../other/tour.js';

class AppCtrl {
  state = {
    enabledSidebarIcons: {
      wf: true,
      sites: true,
      files: () => !!this.state.currentSite,
      styles: () => !state.editor.preview && state.editor.s,
      actions: () => !!this.state.currentSite,
      play: () => this.state.currentFile?.match?.(/^pages\/.+\.html$/) && !state.editor.preview,
      pause: () => state.editor.preview,
    },

    currentPanel: 'wf',
    sites: [],
    currentSite: null,
    files: [],
    expandedPaths: new Set(['pages/']),

    expandedPath: path => {
      if (!path) { return true }
      let paths = [];
      let currentPath = '';
      for (let part of path.split('/').slice(0, -1)) {
        currentPath += `${part}/`;
        paths.push(currentPath);
      }
      return paths.every(x => this.state.expandedPaths.has(x));
    },

    currentFile: null,
    tourDisable: new Set(),
  };

  actions = {
    reset: async () => {
      await post('app.loadSites');

      let url = new URL(location.href);
      if (url.searchParams.get('import')) {
        history.replaceState(null, '', location.href.split('?')[0]);
        await post('app.importZipFromUrl', url.searchParams.get('import'));
      }
    },

    tourDisable: (...xs) => xs.forEach(x => this.state.tourDisable.add(x)),
    tourEnable: (...xs) => xs.forEach(x => this.state.tourDisable.delete(x)),
    clearTourDisable: () => this.state.tourDisable = new Set(),

    selectIcon: x => {
      this.state.prevPanel = null;
      if (x !== 'play' && x !== 'pause') { this.state.currentPanel = x } else { post('editor.togglePreview') }
    },

    loadSites: async () => {
      if (loadman.has('app.loadSites')) { return }

      try {
        loadman.add('app.loadSites');
        this.state.sites = await rsites.loadSites();
      } finally {
        loadman.rm('app.loadSites');
      }
    },

    createSite: async () => {
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Create site', placeholder: 'Site name', allowEmpty: false }));
      if (btn !== 'ok') { return }
      let id = await post('app.doCreateSite', x);
      await post('app.selectFile', 'pages/index.html');
      return id;
    },

    doCreateSite: async x => {
      let id = crypto.randomUUID();
      await rsites.saveSite(id, { name: x });
      await post('app.injectBuiltins', id, true, true);
      await post('app.loadSites');
      await post('app.selectSite', id);
      await post('app.generateReflections');
      return id;
    },

    selectSite: async x => {
      try {
        loadman.add('app.selectSite');
        this.state.currentSite = x;
        this.state.currentFile = null;
        this.state.replacingStyle = null;
        this.state.preview = false;
        await post('editor.changeSelected', null);
        await post('app.injectBuiltins', x);
        await post('app.loadFiles');
        await post('app.selectIcon', 'files');
      } finally {
        loadman.rm('app.selectSite');
      }
    },

    renameSite: async x => {
      let [btn, name] = await showModal(d.el(PromptDialog, { title: 'Rename site', placeholder: 'Site name', allowEmpty: false, initialValue: this.state.sites.find(y => y.id === x).name }));
      if (btn !== 'ok') { return }
      rsites.saveSite(x, { ...rsites.loadSite(x), name });
      post('app.loadSites');
    },

    deleteSite: async x => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { title: 'Delete site?' }));
      if (btn !== 'yes') { return }
      await Promise.all((await rfiles.loadFiles(x)).map(y => rfiles.deleteFile(x, y)));
      rsites.deleteSite(x);
      if (this.state.currentSite === x) { this.state.currentSite = this.state.currentFile = this.state.replacingClass = null; await post('editor.changeSelected', null) }
      await post('app.loadSites');
    },

    injectBuiltins: async (id, wf, firstTime) => {
      let files = Object.fromEntries(await Promise.all([
        'webfoundry/app.js',
        'webfoundry/dominant.js',
        'index.html',
      ].map(async x => [x, await fetchFile(`builtin/${x}`)])));

      await rfiles.saveFile(id, 'components/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'controllers/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'images/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'pages/.keep', new Blob([''], { type: 'text/plain' }));
      for (let [k, v] of Object.entries(files)) { await rfiles.saveFile(id, k, v) }

      if (wf) {
        await rfiles.saveFile(id, 'webfoundry/templates.json', new Blob(['{}'], { type: 'application/json' }));
        await rfiles.saveFile(id, 'webfoundry/scripts.json', new Blob(['[]'], { type: 'application/json' }));
      }

      if (firstTime) { await rfiles.saveFile(id, 'pages/index.html', new Blob([playgroundHtml], { type: 'text/html' })) }
    },

    generateReflections: async () => {
      let templ = {};
      let files = await rfiles.loadFiles(this.state.currentSite);
      for (let x of files.filter(x => x.endsWith('.html'))) { templ[x] = await (await rfiles.loadFile(this.state.currentSite, x)).text() }
      await rfiles.saveFile(this.state.currentSite, 'webfoundry/templates.json', new Blob([JSON.stringify(templ)], { type: 'application/json' }));
      let scripts = files.filter(x => x.endsWith('.js'));
      await rfiles.saveFile(this.state.currentSite, 'webfoundry/scripts.json', new Blob([JSON.stringify(scripts)], { type: 'application/json' }));
    },

    loadFiles: async () => {
      let files = await rfiles.loadFiles(this.state.currentSite);
      this.state.files = structuredFiles(files.filter(x => localStorage.getItem('webfoundry:showInternal') || (!x.startsWith('webfoundry/') && x !== 'index.html')));
    },

    selectFile: async (x, isDir) => {
      if (isDir) {
        let path = x + '/';
        if (this.state.expandedPaths.has(path)) { this.state.expandedPaths.delete(path) } else { this.state.expandedPaths.add(path) }
      } else {
        this.state.currentFile = this.state.replacingStyle = null;
        await d.update();
        await post('editor.changeSelected', null);
        if (!isImage(x) && !x.endsWith('.html')) { let blob = await rfiles.loadFile(this.state.currentSite, x); this.state.editorText = await blob.text() }
        this.state.currentFile = x;
        this.state.preview = false;
        this.state.designerLoading = true;
        state.editor.history = { entries: [], i: -1 };
      }
    },

    createFile: async x => {
      let [btn, type, name] = await showModal(d.el(CreateFileDialog));
      if (btn !== 'ok') { return }

      if (type === 'file' && !name.includes('.')) {
        let [choice] = await showModal(d.el(FileExtensionWarningDialog));
        if (!choice) { return }
        if (choice === 'html') { name += '.html' }
      }

      let path = joinPath(x, name);
      if (await rfiles.loadFile(this.state.currentSite, path)) {
        let [btn2] = await showModal(d.el(ConfirmationDialog, { title: 'File exists. Overwrite?' }));
        if (btn2 !== 'yes') { return }
      }

      if (type === 'file') {
        let content = new Blob([path.endsWith('.html') ? (path.startsWith('components/') ? defaultComponentHtml : defaultHtml) : ''], { type: mimeLookup(path) });
        await rfiles.saveFile(this.state.currentSite, path, content);
        (path.startsWith('controllers/') || path.endsWith('.html')) && await post('app.generateReflections');
        await post('app.loadFiles');
        await post('app.selectFile', path);
      } else {
        await rfiles.saveFile(this.state.currentSite, `${path}/.keep`, '');
        await post('app.loadFiles')
      }

      // TODO: Toggle path
    },

    createRootFolder: async () => {
      let [btn,, name] = await showModal(d.el(CreateFileDialog, { fileDisabled: true }));
      if (btn !== 'ok') { return }
      await rfiles.saveFile(this.state.currentSite, `${name}/.keep`, new Blob([''], { type: 'text/plain' }));
      await post('app.loadFiles')
    },

    renameFile: async (x, isDir) => {
      let [btn, name] = await showModal(d.el(RenameFileDialog, { initialValue: x.split('/').at(-1) }));
      if (btn !== 'ok') { return }
      let newPath = [...x.split('/').slice(0, -1), name].join('/');
      if (isDir) { await post('app.doRenameFolder', x, newPath) }
      else { await post('app.doRenameFile', x, newPath) }
    },

    doRenameFile: async (x, newPath) => {
      await rfiles.renameFile(this.state.currentSite, x, newPath);
      if (this.state.currentFile === x) { await post('app.selectFile', newPath) }
      await post('app.loadFiles');
    },

    doRenameFolder: async (x, newPath) => {
      await rfiles.renameFolder(this.state.currentSite, x, newPath);
      if (this.state.currentFile?.startsWith?.(`${x}/`)) { await post('app.selectFile', this.state.currentFile.replace(x, newPath)) }
      await post('app.loadFiles');
    },

    deleteFile: async (x, isDir) => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { title: 'Delete this file or folder?' }));
      if (btn !== 'yes') { return }

      if (isDir) {
        await rfiles.deleteFolder(this.state.currentSite, x);
        if (this.state.currentFile?.startsWith?.(`${x}/`)) { this.state.currentFile = this.state.replacingStyle = null; await post('editor.changeSelected', null) }
      } else {
        await rfiles.deleteFile(this.state.currentSite, x);
        if (this.state.currentFile === x) { this.state.currentFile = this.state.replacingStyle = null; await post('editor.changeSelected', null) }
      }

      await post('app.loadFiles');
    },

    dragStartFile: (ev, path) => {
      if (ev.target.closest('[disabled], [wf-disabled]')) { return }
      ev.dataTransfer.effectAllowed = 'move';
      this.state.draggedFile = path;
    },

    dragOverFile: ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move' },
    dropFile: (ev, path) => { ev.preventDefault(); ev.stopPropagation(); post('app.mvFile', this.state.draggedFile, path) },

    mvFile: async (path, newPath) => {
      if (newPath.startsWith(`${path}/`)) { return }
      let isDir = await rfiles.loadFile(this.state.currentSite, `${path}/.keep`) != null;
      let isNewPathDir = await rfiles.loadFile(this.state.currentSite, `${newPath}/.keep`) != null;
      if (!isNewPathDir) { newPath = newPath.split('/').slice(0, -1).join('/') }
      let leaf = path.split('/').at(-1);
      if (isDir) { await post('app.doRenameFolder', path, [newPath, leaf].filter(Boolean).join('/')) }
      else { await post('app.doRenameFile', path, [newPath, leaf].filter(Boolean).join('/')) }
    },

    saveFile: async (x, content) => {
      if (x.endsWith('.html')) {
        let doc = new DOMParser().parseFromString(content, 'text/html');
        clearComponents(doc);
        content = new Blob([`<!doctype html>\n<html>${doc.head.outerHTML}\n${doc.body.outerHTML}\n</html>`], { type: 'text/html' });
      } else {
        content = new Blob([content], { type: mimeLookup(x) });
      }
      await rfiles.saveFile(this.state.currentSite, x, content);
      (x.startsWith('controllers/') || x.endsWith('.html')) && await post('app.generateReflections');
      await post('app.loadFiles');
    },

    importZip: async () => {
      let input = d.html`<input class="hidden" type="file" accept=".zip">`;

      input.onchange = async () => {
        try {
          let [file] = input.files;
          if (!file) { return }
          this.state.importing = true;
          showModal(d.el(ImportingDialog, { done: () => !this.state.importing }));
          await rfiles.importZip(this.state.currentSite, file);
          await post('app.injectBuiltins', this.state.currentSite, true);
          await post('app.generateReflections');
          await post('app.loadFiles');
        } finally {
          this.state.importing = false;
        }
      }

      document.body.append(input);
      input.click();
      input.remove();
    },

    importZipFromUrl: async url => {
      try {
        this.state.importing = true;
        showModal(d.el(ImportingDialog, { done: () => !this.state.importing }));
        let res = await fetch(url);
        if (!res.ok) { throw new Error(`Error fetching ZIP file: ${res.statusText}`) }
        let name = atob(url.split('/').pop().split('.').slice(0, -1).join('.'));
        let id = await post('app.doCreateSite', name);
        await rfiles.importZip(id, await res.blob());
        this.state.currentSite = id;
        this.state.currentTab = 'files';
        await post('app.loadSites');
        await post('app.loadFiles');
      } finally {
        this.state.importing = false;
      }
    },

    exportZip: async () => {
      let blob = await rfiles.exportZip(this.state.currentSite);
      let a = d.html`<a class="hidden" ${{ download: `${this.state.sites.find(x => x.id === this.state.currentSite).name}.zip`, href: URL.createObjectURL(blob) }}>`;
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    },

    netlifyDeploy: async () => {
      let [btn, x] = await showModal(d.el(NetlifyDeployDialog));
      if (btn !== 'ok') { return }
      await showModal(d.el(NetlifyDeployDoneDialog, { url: x }));
    },

    exportDesktop: async () => {
      let program = await fetchFile('native/sfx.exe');
      let bundle = await fetchFile('native/windows-tauri-bundle.tar');
      let files = {};
      for (let file of await rfiles.loadFiles(this.state.currentSite)) { files[file] = await rfiles.loadFile(this.state.currentSite, file) }
      let blob = new Blob([program, '=== TARSTART ===', bundle, '=== TARSTART ===', await tarball(files)], { type: 'application/vnd.microsoft.portable-executable' });
      let a = d.html`<a class="hidden" ${{ download: `${this.state.sites.find(x => x.id === this.state.currentSite).name}.exe`, href: URL.createObjectURL(blob) }}>`;
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    },
  };
}

addEventListener('message', ev => ev.data.type === 'action' && post(ev.data.action, ...ev.data.args));

async function fetchFile(x) {
  let res = await fetch(x);
  if (!res.ok) { throw new Error('Fetch error') }
  return res.blob();
}

export default AppCtrl;
