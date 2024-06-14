import { nanoid } from 'https://cdn.skypack.dev/nanoid';

class SitesRepository {
  loadSites() {
    let keys = Object.keys(localStorage).filter(x => x.startsWith('webfoundry:site:'));
    return keys.map(x => x.split(':')[2])
      .map(x => ({ id: x, ...this.loadSite(x) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  loadSite(x) { return JSON.parse(localStorage.getItem(`webfoundry:site:${x}`) || '{}') }
  saveSite(x, data) { localStorage.setItem(`webfoundry:site:${x}`, JSON.stringify(data)) }
  deleteSite(x) { localStorage.removeItem(`webfoundry:site:${x}`) }
}

let rsites = new SitesRepository();
export { SitesRepository };
export default rsites;
