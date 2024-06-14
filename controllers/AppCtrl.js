import PromptDialog from '../components/dialogs/PromptDialog.js';
import d from '../other/dominant.js';
import rsites from '../repositories/SitesRepository.js';
import { showModal, loadman } from '../other/util.js';

class AppCtrl {
  state = {
    currentPanel: 'sites',
    sites: [],
    currentSite: 1,
    files: [{ lv: 0, name: 'components', isDir: true }, { lv: 0, name: 'controllers', isDir: true }, { lv: 0, name: 'pages', isDir: true }, { lv: 1, name: 'index.html' }],
    currentFile: 'index.js',
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
      //await post('app.injectBuiltins', id, true);
      await post('app.loadSites');
      await post('app.selectSite', id);
      return id;
    },

    selectSite: async x => {
      this.state.currentSite = x;
      this.state.currentFile = null;
      //await post('app.injectBuiltins', x);
      //await post('app.loadFiles');
      await post('app.selectPanel', 'files');
    },

    renameSite: async x => {
      let [btn, y] = await showModal(d.el(PromptDialog, { title: 'Rename site', placeholder: 'Site name', allowEmpty: false, initialValue: this.state.sites.find(y => y.id === x).name }));
      if (btn !== 'ok') { return }
      alert(y);
    },
  };
}

export default AppCtrl;
