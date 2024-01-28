import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.js';
import HelpDialog from '../components/dialogs/HelpDialog.js';
import ImportingDialog from '../components/dialogs/ImportingDialog.js';
import NewDialog from '../components/dialogs/NewDialog.js';
import NotificationDialog from '../components/dialogs/NotificationDialog.js';
import PromptDialog from '../components/dialogs/PromptDialog.js';
import ZipDialog from '../components/dialogs/ZipDialog.js';
import rfiles from '../repositories/FilesRepository.js';
import rsites from '../repositories/SitesRepository.js';
import structuredFiles from '../other/structuredFiles.js';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';
import { nanoid } from 'https://cdn.skypack.dev/nanoid';
import { showModal } from '../other/util.js';

let defaultHtml = `<!doctype html>
<meta charset="utf-8">
<body class="min-h-screen">
  <div class="p-32 text-center font-sm italic">Page intentionally left blank.</div>
</body>`;

class AppCtrl {
  state = {
    sidebarCollapsed: false,
    currentTab: 'sites',
    currentSite: null,
    currentFile: null,
    sites: {},
    files: [],
    expandedPaths: new Set(),

    expandedPath: x => {
      if (!x) { return true }
      let paths = [];
      let currentPath = '';
      for (let part of x.split('/').slice(0, -1)) {
        currentPath += `${part}/`;
        paths.push(currentPath);
      }
      return paths.every(x => this.state.expandedPaths.has(x));
    },
  };

  constructor(post) { this.post = post }

  actions = {
    toggleSidebar: () => this.state.sidebarCollapsed = !this.state.sidebarCollapsed,
    changeTab: x => this.state.currentTab = x,
    loadSites: () => this.state.sites = rsites.loadSites(),

    add: async path => {
      switch (this.state.currentTab) {
        case 'sites': {
          let [btn, detail] = await showModal(d.el(PromptDialog, { prompt: 'New site' }));
          if (btn !== 'ok') { break }
          this.post('app.newSite', detail);
          break;
        }

        case 'files': {
          let [btn, detail] = await showModal(d.el(NewDialog));
          if (btn !== 'ok') { break }
          let [type, name] = detail;
          this.post({ file: 'app.newFile', folder: 'app.newFolder' }[type], path ? `${path}/${name}` : name);
          break;
        }
      }
    },

    newSite: x => {
      let id = nanoid();
      rsites.saveSite(id, { name: x });
      this.post('app.loadSites');
      this.post('app.openSite', id);
    },

    renameSite: async x => {
      let [btn, detail] = await showModal(d.el(PromptDialog, { prompt: 'Rename site', initialValue: this.state.sites[x].name }));
      if (btn !== 'ok') { return }
      rsites.saveSite(x, { ...rsites.loadSite(x), name: detail });
      this.post('app.loadSites');
    },

    deleteSite: async x => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { prompt: 'Delete site?' }));
      if (btn !== 'ok') { return }
      await Promise.all((await rfiles.loadFiles(x)).map(y => rfiles.deleteFile(x, y)));
      rsites.deleteSite(x);
      if (this.state.currentSite === x) { this.state.currentSite = this.state.currentFile = null; this.post('designer.reset') }
      this.post('app.loadSites');
    },

    openSite: x => {
      this.state.currentSite = x;
      this.state.currentFile = null;
      this.post('app.changeTab', 'files');
      this.post('app.loadFiles');
    },

    loadFiles: async () => this.state.files = structuredFiles(await rfiles.loadFiles(this.state.currentSite)),
    openFile: x => this.state.currentFile = x,

    newFile: async x => {
      let content = new Blob([x.endsWith('.html') ? defaultHtml : ''], { type: mimeLookup(x) });
      await rfiles.saveFile(this.state.currentSite, x, content);
      let path = x.split('/').slice(0, -1).join('/');
      !this.state.expandedPaths.has(`${path}/`) && this.post('app.togglePath', `${path}/`);
      this.post('app.loadFiles');
      this.state.currentFile = x;
    },

    newFolder: async path => { await rfiles.saveFile(this.state.currentSite, `${path}/.keep`, ''); this.post('app.loadFiles') },

    renameFile: async x => {
      let [btn, detail] = await showModal(d.el(PromptDialog, { prompt: 'New name', initialValue: x.split('/').pop() }));
      if (btn !== 'ok') { return }
      await rfiles.renameFile(this.state.currentSite, x, `${[x.split('/').slice(0, -1).join('/'), detail].filter(Boolean).join('/')}`);
      this.post('app.loadFiles');
    },

    renameFolder: async x => {
      let [btn, detail] = await showModal(d.el(PromptDialog, { prompt: 'New name', initialValue: x.split('/').pop() }));
      if (btn !== 'ok') { return }
      await rfiles.renameFolder(this.state.currentSite, x, `${[x.split('/').slice(0, -1).join('/'), detail].filter(Boolean).join('/')}`);
      this.post('app.loadFiles');
    },

    deleteFile: async x => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { prompt: `Delete file?` }));
      if (btn !== 'ok') { return }
      await rfiles.deleteFile(this.state.currentSite, x);
      if (this.state.currentFile === x) { this.state.currentFile = null }
      this.post('app.loadFiles');
    },

    deleteFolder: async x => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { prompt: `Delete folder?` }));
      if (btn !== 'ok') { return }
      await rfiles.deleteFolder(this.state.currentSite, x);
      if (this.state.currentFile?.startsWith?.(`${x}/`)) { this.state.currentFile = null }
      this.post('app.loadFiles');
    },

    saveFile: async (path, content) => {
      content = new Blob([content], { type: mimeLookup(path) });
      await rfiles.saveFile(this.state.currentSite, path, content);
      this.post('app.loadFiles');
    },

    togglePath: x => {
      if (this.state.expandedPaths.has(x)) { this.state.expandedPaths.delete(x) }
      else { this.state.expandedPaths.add(x) }
    },

    zipOptions: async () => {
      let [btn] = await showModal(d.el(ZipDialog));
      if (btn === 'cancel') { return }
      this.post({ export: 'app.exportZip', import: 'app.importZip' }[btn]);
    },

    exportZip: async () => {
      let blob = await rfiles.exportZip(this.state.currentSite);
      let a = d.html`<a class="hidden" ${{ download: `${this.state.sites[this.state.currentSite].name}.zip`, href: URL.createObjectURL(blob) }}>`;
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    },

    shareUrl: async () => {
      try {
        this.state.sharing = true;
        let formData = new FormData();
        formData.append('file', await rfiles.exportZip(this.state.currentSite), btoa(this.state.sites[this.state.currentSite].name) + '.zip');
        let res = await fetch('https://filet.guiprav.com/webfoundry/upload', { method: 'POST', body: formData });
        this.state.sharing = false;
        d.update();
        if (!res.ok) { throw new Error(`Upload failed: ${res.statusText}`) }
        await showModal(d.el(NotificationDialog, { title: 'Copy to clipboard', text: 'Click OK to copy the URL to your clipboard.' }));
        navigator.clipboard.writeText(location.href + '?import=' + (await res.json()).url);
      } finally {
        this.state.sharing = false;
      }
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
          this.post('app.loadFiles');
        } finally {
          this.state.importing = false;
        }
      }
      document.body.append(input); input.click(); input.remove();
    },

    importZipFromUrl: async url => {
      try {
        this.state.importing = true;
        showModal(d.el(ImportingDialog, { done: () => !this.state.importing }));
        let res = await fetch(url);
        if (!res.ok) { throw new Error(`Error fetching ZIP file: ${res.statusText}`) }
        let name = atob(url.split('/').pop().split('.').slice(0, -1).join('.'));
        let id = nanoid();
        rsites.saveSite(id, { name });
        await rfiles.importZip(id, await res.blob());
        this.state.currentSite = id;
        this.state.currentTab = 'files';
        this.post('app.loadSites');
        this.post('app.loadFiles');
      } finally {
        this.state.importing = false;
      }
    },

    help: async () => await showModal(d.el(HelpDialog)),
  };
}

export default AppCtrl;
