import JSZip from 'https://cdn.skypack.dev/jszip';
import lf from 'https://cdn.skypack.dev/localforage';

class FilesRepository {
  async loadFiles(x) {
    let keys = await lf.keys();
    let prefix = `webfoundry:file:${x}:`;
    return keys.filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length));
  }

  async saveFile(site, path, content) { await lf.setItem(`webfoundry:file:${site}:${path}`, content) }
  async loadFile(site, path) { return await lf.getItem(`webfoundry:file:${site}:${path}`) }

  async renameFile(site, path, newPath) {
    await this.saveFile(site, newPath, await this.loadFile(site, path));
    await this.deleteFile(site, path);
  }

  async renameFolder(site, path, newPath) {
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

  async exportZip(site) {
    let zip = new JSZip();

    for (let file of ['other/preflight.css', 'other/windy.js']) {
      let res = await fetch(file);
      if (!res.ok) { throw new Error(`Error fetching file: ${file}`) }
      zip.file(file, await res.blob());
    }

    for (let file of await this.loadFiles(site)) {
      let blob = await this.loadFile(site, file);
      if (file.endsWith('.html')) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(await blob.text(), 'text/html');
        let preflightLink = doc.querySelector('.wf-preflight');
        let windyScript = doc.querySelector('.wf-windy');
        let prefix = file.split('/').slice(0, -1).map(x => '../').join('') + 'other/';
        if (preflightLink) { preflightLink.href = `${prefix}preflight.css` }
        if (windyScript) { windyScript.src = `${prefix}windy.js` }
        doc.querySelectorAll('#windy').forEach(x => x.remove());
        let serializer = new XMLSerializer();
        zip.file(file, new Blob([serializer.serializeToString(doc)], { type: 'text/html' }));
      } else {
        zip.file(file, blob);
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  async importZip(site, blob) {
    let zip = await JSZip.loadAsync(blob);
    for (let [path, entry] of Object.entries(zip.files)) {
      if (path.endsWith('/') || path === 'other/preflight.css' || path === 'other/windy.js') { continue }
      let blob = await entry.async('blob');
      if (path.endsWith('.html')) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(await blob.text(), 'text/html');
        let preflightLink = doc.querySelector('.wf-preflight');
        let windyScript = doc.querySelector('.wf-windy');
        if (preflightLink) { preflightLink.href = `${location.pathname}other/preflight.css` }
        if (windyScript) { windyScript.src = `${location.pathname}other/windy.js` }
        let serializer = new XMLSerializer();
        await this.saveFile(site, path, new Blob([serializer.serializeToString(doc)], { type: 'text/html' }));
      } else {
        await this.saveFile(site, path, blob);
      }
    }
  }
}

export default new FilesRepository();
