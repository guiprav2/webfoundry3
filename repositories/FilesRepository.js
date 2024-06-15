import JSZip from 'https://cdn.skypack.dev/jszip';
import lf from 'https://cdn.skypack.dev/localforage';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';

class FilesRepository {
  async loadFiles(x) {
    let keys = await lf.keys();
    let prefix = `webfoundry:file:${x}:`;
    return keys.filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length));
  }

  async saveFile(site, path, content) { await lf.setItem(`webfoundry:file:${site}:${path}`, content) }
  async loadFile(site, path) { return await lf.getItem(`webfoundry:file:${site}:${path}`) }

  async renameFile(site, path, newPath) {
    if (path === newPath || newPath === 'index.html' || newPath.startsWith('webfoundry/')) { return }
    if (path.startsWith('components/') && !newPath.startsWith('components/')) { return }
    if (path.startsWith('controllers/') && !newPath.startsWith('controllers/')) { return }
    if (path.startsWith('pages/') && !newPath.startsWith('pages/')) { return }
    await this.saveFile(site, newPath, await this.loadFile(site, path));
    await this.deleteFile(site, path);
  }

  async renameFolder(site, path, newPath) {
    if (path === newPath || newPath === 'index.html' || newPath.startsWith('webfoundry/')) { return }
    if (path.startsWith('components/') && !newPath.startsWith('components/')) { return }
    if (path.startsWith('controllers/') && !newPath.startsWith('controllers/')) { return }
    if (path.startsWith('pages/') && !newPath.startsWith('pages/')) { return }
    let keys = await lf.keys();
    let prefix = `webfoundry:file:${site}:${path}/`;
    let files = keys.filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length));
    await Promise.all(files.map(x => this.renameFile(site, `${path}/${x}`, `${newPath}/${x}`)));
  }

  async deleteFile(site, path) { await lf.removeItem(`webfoundry:file:${site}:${path}`) }

  async deleteFolder(site, path) {
    let keys = await lf.keys();
    let prefix = `webfoundry:file:${site}:${path}/`;
    let files = keys.filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length));
    await Promise.all(files.map(x => this.deleteFile(site, `${path}/${x}`)));
  }

  async exportZip(site, extraFiles = {}) {
    let zip = new JSZip();
    for (let file of await this.loadFiles(site)) { zip.file(file, await this.loadFile(site, file)) }
    for (let [k, v] of Object.entries(extraFiles)) { zip.file(k, v) }
    return await zip.generateAsync({ type: 'blob' });
  }

  async importZip(site, blob) {
    let zip = await JSZip.loadAsync(blob);
    for (let [path, entry] of Object.entries(zip.files)) {
      if (path.endsWith('/')) { continue }
      let blob = await entry.async('blob');
      await this.saveFile(site, path, new Blob([await blob.arrayBuffer()], { type: mimeLookup(path) }));
    }
  }
}

let rfiles = new FilesRepository();
export { FilesRepository };
export default rfiles;
