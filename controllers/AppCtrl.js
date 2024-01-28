import rfiles from '../repositories/FilesRepository.js';
import rsites from '../repositories/SitesRepository.js';
import structuredFiles from '../other/structuredFiles.js';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';

class AppCtrl {
  state = {
    currentTab: 'sites',
    currentSite: null,
    currentFile: null,

    sites: {
      1: { name: 'Welcome' },
      2: { name: 'Home' },
    },

    files: [],
    expandedPath: x => !x,
  };

  constructor(post) { this.post = post }

  actions = {
    loadSites: () => this.state.sites = rsites.loadSites(),
    changeTab: x => this.state.currentTab = x,

    openSite: x => {
      this.state.currentSite = x;
      this.post('app.changeTab', 'files');
      this.post('app.loadFiles');
    },

    loadFiles: async () => this.state.files = structuredFiles(await rfiles.loadFiles(this.state.currentSite)),
    openFile: x => this.state.currentFile = x,

    saveFile: async (path, content) => {
      content = new Blob([content], { type: mimeLookup(path) });
      await rfiles.saveFile(this.state.currentSite, path, content);
      this.post('app.loadFiles');
    },
  };
}

export default AppCtrl;
