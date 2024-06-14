import rsites from '../repositories/SitesRepository.js';
import { loadman } from '../other/util.js';

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

    loadSites: async () => {
      if (loadman.has('app.loadSites')) { return }

      try {
        loadman.add('app.loadSites');
        this.state.sites = await rsites.loadSites();
      } finally {
        loadman.rm('app.loadSites');
      }
    },

    selectPanel: x => this.state.currentPanel = x,
  };
}

export default AppCtrl;
