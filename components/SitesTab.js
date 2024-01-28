import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class SitesTab {
  constructor() {
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
  }

  render = () => d.html`
    <div class="flex-1 overflow-auto">
      <div class="flex flex-col gap-1 p-3 text-sm">
        ${d.if(() => !Object.keys(this.state.app.sites).length, d.html`
          <div class="px-3 py-1 italic">Create a new site to start designing it.</div>
        `)}
        ${d.map(() => Object.keys(this.state.app.sites), x => d.html`
          <a href="#" ${{
            class: ['flex gap-2 justify-between items-center rounded px-3 py-1', () => this.state.app.currentSite === x && 'text-neutral-300 bg-black/25'],
            onClick: ev => !ev.target.closest('button') && this.post('app.openSite', x),
          }}>
            <div class="flex gap-2 items-center">
              <i class="nf nf-fa-sitemap"></i>
              ${d.text(() => this.state.app.sites[x].name)}
            </div>
            <div class="relative top-[-1px] flex gap-2">
              <button class="nf nf-fa-pencil outline-none" ${{ onClick: () => this.post('app.renameSite', x) }}></button>
              <button class="nf nf-fa-trash outline-none" ${{ onClick: () => this.post('app.deleteSite', x) }}></button>
            </div>
          </a>
        `)}
      </div>
    </div>
  `;
}

export default SitesTab;
