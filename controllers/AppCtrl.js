import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.js';
import CreateFileDialog from '../components/dialogs/CreateFileDialog.js';
import FileExtensionWarningDialog from '../components/dialogs/FileExtensionWarningDialog.js';
import PromptDialog from '../components/dialogs/PromptDialog.js';
import RenameFileDialog from '../components/dialogs/RenameFileDialog.js';
import d from '../other/dominant.js';
import rfiles from '../repositories/FilesRepository.js';
import rsites from '../repositories/SitesRepository.js';
import structuredFiles from '../other/structuredFiles.js';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';
import { joinPath, showModal, loadman } from '../other/util.js';

let defaultHtml = `<!doctype html>
<meta charset="utf-8">
<head>
  <link class="wf-nf-link" rel="stylesheet" href="https://www.nerdfonts.com/assets/css/webfont.css">
  <script class="wf-tw-script" src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script class="wf-tw-setup">
    tailwind.config = {
      darkMode: location.href.includes('/preview/') ? 'media' : 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'hsl(222.2, 47.4%, 11.2%)',
              foreground: 'hsl(210, 40%, 98%)',
            },
            secondary: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(222.2, 47.4%, 11.2%)',
            },
            muted: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(215.4, 16.3%, 46.9%)',
            },
          },
        },
      },
    };
  </script>
  <script class="wf-gfonts-script">
    let observer = new MutationObserver(muts => {
      let gfonts = [];
      for (let mut of muts) {
        if (mut.type === 'childList') {
          for (let x of mut.addedNodes) {
            if (x.nodeType !== 1) { continue }
            for (let y of [x, ...x.querySelectorAll('*')]) {
              gfonts.push(...[...y.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
            }
          }
        } else if (mut.type === 'attributes') {
          gfonts.push(...[...mut.target.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
        }
      }

      for (let x of gfonts) {
        let id = \`gfont-[\${x}]\`;
        let style = document.getElementById(id);
        if (style) { continue }
        style = document.createElement('style');
        style.id = id;
        style.textContent = \`
          @import url('https://fonts.googleapis.com/css2?family=\${x.replace(/_/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          .gfont-\\\\[\${x}\\\\] { font-family: "\${x.replace(/_/g, ' ')}" }
        \`;
        document.head.append(style);
      }
    });

    observer.observe(document, { attributes: true, childList: true, subtree: true });
  </script>
  <style class="wf-preflight">
    [hidden] { display: none !important }
  </style>
</head>
<body class="min-h-screen">
  <div class="p-16 text-center font-sm italic">Page intentionally left blank.</div>
</body>`;

let defaultComponentHtml = `<!doctype html>
<meta charset="utf-8">
<head>
  <link class="wf-nf-link" rel="stylesheet" href="https://www.nerdfonts.com/assets/css/webfont.css">
  <script class="wf-tw-script" src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script class="wf-tw-setup">
    tailwind.config = {
      darkMode: location.href.includes('/preview/') ? 'media' : 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'hsl(222.2, 47.4%, 11.2%)',
              foreground: 'hsl(210, 40%, 98%)',
            },
            secondary: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(222.2, 47.4%, 11.2%)',
            },
            muted: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(215.4, 16.3%, 46.9%)',
            },
          },
        },
      },
    };
  </script>
  <script class="wf-gfonts-script">
    let observer = new MutationObserver(muts => {
      let gfonts = [];
      for (let mut of muts) {
        if (mut.type === 'childList') {
          for (let x of mut.addedNodes) {
            if (x.nodeType !== 1) { continue }
            for (let y of [x, ...x.querySelectorAll('*')]) {
              gfonts.push(...[...y.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
            }
          }
        } else if (mut.type === 'attributes') {
          gfonts.push(...[...mut.target.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
        }
      }

      for (let x of gfonts) {
        let id = \`gfont-[\${x}]\`;
        let style = document.getElementById(id);
        if (style) { continue }
        style = document.createElement('style');
        style.id = id;
        style.textContent = \`
          @import url('https://fonts.googleapis.com/css2?family=\${x.replace(/_/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          .gfont-\\\\[\${x}\\\\] { font-family: "\${x.replace(/_/g, ' ')}" }
        \`;
        document.head.append(style);
      }
    });

    observer.observe(document, { attributes: true, childList: true, subtree: true });
  </script>
  <style class="wf-preflight">
    [hidden] { display: none !important }
  </style>
  <style class="wf-component-preflight">
    body{
      background-color: #06c;
      background-image: linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px),
        linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
      background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
      background-position:-2px -2px, -2px -2px, -1px -1px, -1px -1px;
    }
  </style>
</head>
<body class="flex justify-center items-center min-h-screen">
  <div class="border border-neutral-200 rounded-md bg-white shadow-xl">
    <div class="p-16 text-center font-sm italic">Component intentionally left blank.</div>
  </div>
</body>`;

class AppCtrl {
  state = {
    currentPanel: 'sites',
    sites: [],
    currentSite: null,
    files: [],
    expandedPaths: new Set(),

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
    styles: ['flex', 'justify-center', 'items-center'],
    designerWidth: 'calc(1471px - 1rem)',
    designerHeight: '100vh',
    preview: false,
  };

  actions = {
    reset: () => post('app.loadSites'),
    selectPanel: x => this.state.currentPanel = x,

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
      let id = crypto.randomUUID();
      await rsites.saveSite(id, { name: x });
      await post('app.injectBuiltins', id, true);
      await post('app.loadSites');
      await post('app.selectSite', id);
      return id;
    },

    selectSite: async x => {
      this.state.currentSite = x;
      this.state.currentFile = null;
      await post('app.injectBuiltins', x);
      await post('app.loadFiles');
      await post('app.selectPanel', 'files');
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
      if (this.state.currentSite === x) { this.state.currentSite = this.state.currentFile = this.state.replacingClass = null }
      post('app.loadSites');
    },

    injectBuiltins: async (id, wf) => {
      let files = Object.fromEntries(await Promise.all([
        //'webfoundry/app.js',
        //'webfoundry/dominant.js',
        //'index.html',
      ].map(async x => [x, await fetchFile(`builtin/${x}`)])));

      await rfiles.saveFile(id, 'components/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'controllers/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'pages/.keep', new Blob([''], { type: 'text/plain' }));
      for (let [k, v] of Object.entries(files)) { await rfiles.saveFile(id, k, v) }

      if (wf) {
        await rfiles.saveFile(id, 'webfoundry/templates.json', new Blob(['{}'], { type: 'application/json' }));
        await rfiles.saveFile(id, 'webfoundry/scripts.json', new Blob(['[]'], { type: 'application/json' }));
      }
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
        this.state.currentFile = x;
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
        //(path.startsWith('controllers/') || path.endsWith('.html')) && await post('app.generateReflections');
        await post('app.loadFiles');
        await post('app.selectFile', path);
      } else {
        await rfiles.saveFile(this.state.currentSite, `${path}/.keep`, '');
        await post('app.loadFiles')
      }

      // TODO: Toggle path
    },

    renameFile: async (x, isDir) => {
      let [btn, name] = await showModal(d.el(RenameFileDialog, { initialValue: x.split('/').at(-1) }));
      if (btn !== 'ok') { return }

      let newPath = [...x.split('/').slice(0, -1), name].join('/');
      if (isDir) {
        await rfiles.renameFolder(this.state.currentSite, x, newPath);
        if (this.state.currentFile?.startsWith?.(`${x}/`)) { this.state.currentFile = this.state.currentFile.replace(x, newPath) }
      } else {
        await rfiles.renameFile(this.state.currentSite, x, newPath);
        if (this.state.currentFile === x) { this.state.currentFile = newPath }
      }

      await post('app.loadFiles');
    },

    deleteFile: async (x, isDir) => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { title: 'Delete this file or folder?' }));
      if (btn !== 'yes') { return }

      if (isDir) {
        await rfiles.deleteFolder(this.state.currentSite, x);
        if (this.state.currentFile?.startsWith?.(`${x}/`)) { this.state.currentFile = null }
      } else {
        await rfiles.deleteFile(this.state.currentSite, x);
        if (this.state.currentFile === x) { this.state.currentFile = null }
      }

      await post('app.loadFiles');
    },
  };
}

export default AppCtrl;
