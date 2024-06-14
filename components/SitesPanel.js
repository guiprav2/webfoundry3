import d from '../other/dominant.js';

class SitesPanel {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="SitesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50 select-none">
      <button class="SitesPanel-createBtn outline-none border-b border-black/50 transition-all h-12 text-xl bg-[#0071b2] transition-colors hover:bg-[#008ad9]" ${{ onClick: () => this.props.onCreate() }}>
        Create
      </button>
      <div class="SitesPanel-siteList flex flex-col gap-2 p-4">
        ${d.if(() => !this.props.sites.length, d.html`<div class="italic">You don't have any sites created yet. Click the button above to create your first site.</div>`)}
        ${d.map(() => this.props.sites, x => d.html`
          <a href="#" class="SitesPanel-site flex items-center gap-3 rounded outline-none py-1 justify-between px-2" ${{
            class: () => this.props.currentSite === x.id && 'bg-black/70',
            onClick: () => this.props.onSelect(x.id),
          }}>
            <div class="flex items-center gap-3">
              <div class="nf nf-fa-sitemap p-2"></div>
              <div class="SitesPanel-siteName">${d.text(() => x.name)}</div>
            </div>
            <div class="flex">
              <button class="SitesPanel-renameBtn outline-none nf nf-fa-pencil p-2" ${{ onClick: ev => { ev.stopPropagation(); this.props.onRename(x.id) } }}></button>
              <button class="SitesPanel-deleteBtn outline-none nf nf-fa-trash p-2" ${{ onClick: ev => { ev.stopPropagation(); this.props.onDelete(x.id) } }}></button>
            </div>
          </a>
        `)}
      </div>
    </div>
  `;
}

export default SitesPanel;
