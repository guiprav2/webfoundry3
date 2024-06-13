import d from '../other/dominant.js';
import { joinPaths } from '../other/util.js';

class FilesPanel {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="FilesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50">
      <button class="FilesPanel-createBtn outline-none border-b border-black/50 transition-all h-12 text-xl bg-[#0071b2] transition-colors hover:bg-[#008ad9]" ${{ onClick: () => this.props.onCreate() }}>
        Create
      </button>
      <div class="FilesPanel-fileList flex flex-col gap-2 p-4">
        ${d.map(() => this.props.files, x => d.html`
          <a href="#" class="FilesPanel-file flex items-center gap-3 rounded outline-none py-1 justify-between px-2" ${{
            class: [() => `ml-[${x.lv * 1.25}rem]`, () => this.props.currentFile === joinPaths(x.path, x.name) && 'bg-black/70'],
            onClick: () => this.props.onSelect(joinPaths(x.path, x.name)),
          }}>
            <div class="flex items-center gap-3">
              <div class="nf p-2 nf-fa-folder"></div>
              <div class="SitesPanel-fileName">${d.text(() => x.name)}</div>
            </div>
            <div class="flex">
              ${d.if(() => x.isDir, d.html`
                <button class="FilesPanel-createInsideBtn outline-none nf p-2 nf-fa-plus" ${{ onClick: ev => { ev.stopPropagation(); this.props.onCreate(joinPaths(x.path, x.name)) } }}></button>`
              )}
              ${d.if(() => !['components', 'controllers', 'pages'].includes(joinPaths(x.path, x.name)), d.html`
                <button class="FilesPanel-renameBtn outline-none nf p-2 nf-fa-pencil" ${{ onClick: ev => { ev.stopPropagation(); this.props.onRename(joinPaths(x.path, x.name)) } }}></button>
                <button class="FilesPanel-deleteBtn outline-none nf p-2 nf-fa-trash" ${{ onClick: ev => { ev.stopPropagation(); this.props.onDelete(joinPaths(x.path, x.name)) } }}></button>
              `)}
            </div>
          </a>
        `)}
      </div>
    </div>
  `;
}

export default FilesPanel;
