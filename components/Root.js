import App from './App.js';
import d from '../other/dominant.js';

window.tap = x => (console.log(x), x);

class Root {
  render = () => d.el(App, {
    onAttach: () => post('app.reset'),
    currentPanel: d.binding({ get: () => state.app.currentPanel }),
    onSelectIcon: x => post('app.selectPanel', x),
    sites: d.binding({ get: () => state.app.sites }),
    currentSite: d.binding({ get: () => state.app.currentSite }),
    onCreateSite: () => post('app.createSite'),
    onSelectSite: x => post('app.selectSite', x),
    onRenameSite: x => post('app.renameSite', x),
    onDeleteSite: x => post('app.deleteSite', x),
    files: d.binding({ get: () => state.app.files }),
    currentFile: d.binding({ get: () => state.app.currentFile }),
    onCreateFile: () => post('app.createFile'),
    onSelectFile: (x, isDir) => post('app.selectFile', x, isDir),
    onRenameFile: (x, isDir) => post('app.renameFile', x, isDir),
    onDeleteFile: (x, isDir) => post('app.deleteFile', x, isDir),
    styles: d.binding({ get: () => state.app.styles }),
    onEditStyle: x => post('app.editStyle', x),
    onDeleteStyle: x => post('app.deleteStyle', x),
    onAddStyleKeyDown: ev => post('app.addStyleKeyDown', ev),
    designerWidth: d.binding({ get: () => state.app.designerWidth }),
    designerHeight: d.binding({ get: () => state.app.designerHeight }),
    preview: d.binding({ get: () => state.app.preview }),
    onResizeDesigner: ev => post('app.resizeDesigner', ev),
    editorText: d.binding({ get: () => state.app.editorText }),
    onEditorChange: x => post('app.editorChange', x),
  });
}

let observer = new MutationObserver(muts => {
  let gfonts = [];
  for (let mut of muts) {
    if (mut.type === 'childList') {
      for (let x of mut.addedNodes) {
        if (x.nodeType !== 1) { continue }
        for (let y of [x, ...x.querySelectorAll('*')]) {
          gfonts.push(...[...y.classList].filter(x => x.match(/^gfont-\[.+?\]$/)).map(x => x.slice('gfont-['.length, -1)));
        }
      }
    } else if (mut.type === 'attributes') {
      gfonts.push(...[...mut.target.classList].filter(x => x.match(/^gfont-\[.+?\]$/)).map(x => x.slice('gfont-['.length, -1)));
    }
  }

  for (let x of gfonts) {
    let id = `gfont-[${x}]`;
    let existing = document.getElementById(id);
    if (existing) { continue }
    document.head.append(d.el('style', { id }, `
      @import url('https://fonts.googleapis.com/css2?family=${x.replace(/_/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
      .gfont-\\[${x}\\] { font-family: "${x.replace(/_/g, ' ')}" }
    `));
  }
});

observer.observe(document.body, { attributes: true, childList: true, subtree: true });

export default Root;
