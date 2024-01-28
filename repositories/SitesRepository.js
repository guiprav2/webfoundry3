import { nanoid } from 'https://cdn.skypack.dev/nanoid';

class SitesRepository {
  constructor() {
    if (!Object.keys(this.loadSites()).length) { this.saveSite(nanoid(), { name: 'Welcome' }) }
  }

  loadSites() {
    let keys = Object.keys(localStorage).filter(x => x.startsWith('webfoundry:site:'));
    return Object.fromEntries(keys.map(x => x.split(':')[2])
      .map(x => [x, this.loadSite(x)])
      .sort((a, b) => a[1].name.localeCompare(b[1].name)));
  }

  loadSite(x) { return JSON.parse(localStorage.getItem(`webfoundry:site:${x}`) || '{}') }
  saveSite(x, data) { localStorage.setItem(`webfoundry:site:${x}`, JSON.stringify(data)) }
  deleteSite(x) { localStorage.removeItem(`webfoundry:site:${x}`) }
}

export default new SitesRepository();
