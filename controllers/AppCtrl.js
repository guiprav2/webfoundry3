class AppCtrl {
  state = {
    currentPanel: 'sites',
    sites: [{ id: 1, name: 'webfoundry.app' }],
    currentSite: 1,
    files: [{ lv: 0, name: 'components', isDir: true }, { lv: 0, name: 'controllers', isDir: true }, { lv: 0, name: 'pages', isDir: true }, { lv: 1, name: 'index.html' }],
    currentFile: 'index.js',
    styles: ['flex', 'justify-center', 'items-center'],
    designerWidth: 'calc(1471px - 1rem)',
    designerHeight: '100vh',
    preview: false,
  };

  actions = {
    selectPanel: x => this.state.currentPanel = x,
  };
}

export default AppCtrl;
