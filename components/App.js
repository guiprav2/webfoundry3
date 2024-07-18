import ActionsPanel from './ActionsPanel.js';
import CodeEditor from './CodeEditor.js';
import Designer from './Designer.js';
import FilesPanel from './FilesPanel.js';
import IconsSidebar from './IconsSidebar.js';
import MediaViewer from './MediaViewer.js';
import SitesPanel from './SitesPanel.js';
import StylesPanel from './StylesPanel.js';
import WfPanel from './WfPanel.js';
import d from '../other/dominant.js';
import { isImage, isVideo, isAudio } from '../other/util.js';

window.tap = x => (console.log(x), x);

class App {
  render = () => d.html`
    <div class="App min-h-screen flex" ${{ onAttach: () => post('app.reset') }}>
      ${d.el(IconsSidebar)}
      ${d.if(() => state.app.currentPanel === 'wf', d.el(WfPanel))}
      ${d.if(() => state.app.currentPanel === 'sites', d.el(SitesPanel))}
      ${d.if(() => state.app.currentPanel === 'files', d.el(FilesPanel))}
      ${d.if(() => state.app.currentPanel === 'actions', d.el(ActionsPanel))}
      ${d.if(() => state.app.currentPanel === 'styles', d.el(StylesPanel))}
      ${d.if(() => state.app.currentPanel !== 'wf' && !state.app.currentFile, d.html`
        <div class="flex-1 bg-[#060a0f] flex justify-center items-center">
          <div class="text-7xl gfont-[Pacifico] text-black/50 select-none">Webfoundry</div>
        </div>
      `, d.if(
        () => state.app.currentPanel !== 'wf' && state.app.currentFile.endsWith('.html'),
        d.el(Designer),
        d.if(
          () => state.app.currentPanel !== 'wf' && (isImage(state.app.currentFile) || isVideo(state.app.currentFile) || isAudio(state.app.currentFile)),
          d.el(MediaViewer),
          d.if(() => state.app.currentPanel !== 'wf', d.el(CodeEditor)),
        ),
      ))}
    </div>
  `;
}

addEventListener('click', ev => ev.target.closest('[disabled], [wf-disabled]') && (ev.preventDefault(), ev.stopPropagation()), true);

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

export default App;
