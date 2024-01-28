import CodeEditor from './CodeEditor.js';
import Designer from './Designer.js';
import FilesTab from './FilesTab.js';
import ImageViewer from './ImageViewer.js';
import SitesTab from './SitesTab.js';
import StylesTab from './StylesTab.js';
import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';
import { isImage } from '../other/util.js';

class App {
  constructor() {
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
  }

  onAttach = () => {
    this.post('app.loadSites');

    d.effect(() => this.state.app.currentTab, x => this.tabContent = d.el({
      sites: SitesTab, files: FilesTab, styles: StylesTab,
    }[x]));

    d.effect(() => this.state.app.currentFile, x => {
      if (!x) { this.content = null; return }
      if (x.endsWith('.html')) { this.content = d.el(Designer, { path: x }) }
      else if (isImage(x)) { this.content = d.el(ImageViewer, { path: x }) }
      else { this.content = d.el(CodeEditor, { path: x }) }
    });

    let url = new URL(location.href);
    if (url.searchParams.get('import')) {
      history.replaceState(null, '', location.href.split('?')[0]);
      this.post('app.importZipFromUrl', url.searchParams.get('import'));
    }
  };

  render = () => d.html`
    <div class="w-80 h-screen shrink-0 flex flex-col bg-[#162031] text-[#949ba4] shadow-2xl" ${{ onAttach: this.onAttach }}>
      <div class="border-b border-[#1f2631] px-5 py-3 flex items-center justify-between">
        <div class="gfont-[Pacifico] text-gray-100">Webfoundry</div>
        <div class="flex gap-3">
          ${d.if(() => this.state.app.currentTab !== 'styles', d.html`
            <button class="nf nf-fa-plus outline-none" ${{ onClick: () => this.post('app.add') }}></button>
          `)}
          ${d.if(() => this.state.app.currentTab === 'files', d.html`
            <button class="nf nf-seti-zip outline-none" ${{ onClick: () => this.post('app.zipOptions') }}></button>
          `)}
          ${this.renderTabBtn({ key: 'sites', icon: 'nf-fa-sitemap' })}
          ${this.renderTabBtn({ key: 'files', icon: 'nf-fa-folder' })}
          ${this.renderTabBtn({ key: 'styles', icon: 'nf-fa-paint_brush' })}
          <button class="nf nf-fa-question outline-none" ${{ onClick: () => this.post('app.help') }}></button>
        </div>
      </div>
      ${d.portal(() => this.tabContent)}
    </div>
    ${d.portal(() => this.content)}
  `;

  renderTabBtn = ({ key, icon }) => d.html`
    <button ${{
      class: [
        'nf outline-none', icon,
        () => this.state.app.currentTab === key && 'text-neutral-200',
        () => ((key === 'files' && !this.state.app.currentSite) || (key === 'styles' && !this.state.app.currentFile)) && 'opacity-50',
      ],
      disabled: () => (key === 'files' && !this.state.app.currentSite) || (key === 'styles' && !this.state.app.currentFile),
      onClick: () => this.post('app.changeTab', key),
    }}></button>
  `;
}

export default App;
