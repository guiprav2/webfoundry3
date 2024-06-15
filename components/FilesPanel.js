import d from '../other/dominant.js';
import { joinPath } from '../other/util.js';

class FilesPanel {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="FilesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50">
      <div class="FilesPanel-fileList flex flex-col gap-2 p-4">
        ${d.map(() => this.props.files, ([name, path, isDir]) => d.html`
          <a href="#" class="FilesPanel-file flex items-center gap-3 rounded outline-none py-1 justify-between px-2" ${{
            class: [
              () => !state.app.expandedPath(path) && 'hidden',
              () => `ml-[${(path.split('/').length - 1) * 1.25}rem]`, () => this.props.currentFile === joinPath(path, name) && 'bg-black/70',
            ],
            onClick: () => this.props.onSelect(joinPath(path, name), isDir),
          }}>
            <div class="flex items-center gap-3">
              <div class="nf p-2" ${{ class: () => `nf-fa-${isDir ? (state.app.expandedPath(path + name + '/.keep') ? 'folder_open' : 'folder') : 'file'}` }}></div>
              <div class="SitesPanel-fileName">${name}</div>
            </div>
            <div class="flex">
              ${d.if(() => isDir, d.html`
                <button class="FilesPanel-createInsideBtn outline-none nf p-2 nf-fa-plus" ${{ onClick: ev => { ev.stopPropagation(); this.props.onCreate(joinPath(path, name), isDir) } }}></button>`
              )}
              ${d.if(() => !['components', 'controllers', 'pages'].includes(joinPath(path, name)), d.html`
                <button class="FilesPanel-renameBtn outline-none nf p-2 nf-fa-pencil" ${{ onClick: ev => { ev.stopPropagation(); this.props.onRename(joinPath(path, name), isDir) } }}></button>
                <button class="FilesPanel-deleteBtn outline-none nf p-2 nf-fa-trash" ${{ onClick: ev => { ev.stopPropagation(); this.props.onDelete(joinPath(path, name), isDir) } }}></button>
              `)}
            </div>
          </a>
        `)}
      </div>
    </div>
  `;
}

export default FilesPanel;
