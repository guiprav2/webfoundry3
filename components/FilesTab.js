import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class FilesTab {
  constructor() {
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
  }

  render = () => d.html`
    <div class="flex-1 overflow-auto">
      <div class="h-full flex flex-col gap-1 p-3 text-sm">
        ${d.if(() => !Object.keys(this.state.app.files).length, d.html`
          <div class="px-3 py-1 italic">Create a new file to start designing it.</div>
        `)}
        ${d.map(() => this.state.app.files, ([name, path, isDir]) => d.html`
          <a href="#" ${{
            class: [
              'flex gap-2 justify-between items-center rounded px-3 py-1',
              () => `ml-${(path.split('/').length - 1) * 3}`,
              () => !this.state.app.expandedPath(path) && 'hidden',
              () => this.state.app.currentFile === (path ? `${path}${name}` : name) && 'text-neutral-300 bg-black/25',
            ],
            onClick: ev => {
              if (ev.target.tagName === 'BUTTON') { return }
              !isDir ? this.post('app.openFile', path ? `${path}${name}` : name) : this.post('app.togglePath', path ? `${path}${name}/` : `${name}/`)
            },
          }}>
            <div class="flex-1 flex gap-2 items-center overflow-hidden">
              <i ${{ class: ['nf', () => `nf-fa-${isDir ? 'folder' : 'file'}`] }}></i>
              <span class="overflow-hidden text-ellipsis">${name}</span>
            </div>
            <div class="relative top-[-1px] flex gap-2">
              ${isDir && d.html`<button class="nf nf-fa-plus outline-none" ${{ onClick: () => this.post('app.add', path ? `${path}${name}` : name) }}></button>`}
              <button class="nf nf-fa-pencil outline-none" ${{ onClick: () => this.post(isDir ? 'app.renameFolder' : 'app.renameFile', path ? `${path}${name}` : name) }}></button>
              <button class="nf nf-fa-trash outline-none" ${{ onClick: () => this.post(isDir ? 'app.deleteFolder' : 'app.deleteFile', path ? `${path}${name}` : name) }}></button>
            </div>
          </a>
        `)}
        <div class="flex-1"></div>
        <button ${{ class: ['border border-[#949ba4] rounded px-3 py-1'], disabled: () => this.sharing, onClick: () => this.post('app.shareUrl') }}>
          ${d.if(() => !this.state.app.sharing, 'Get share URL', 'Uploading...')}
        </button>
      </div>
    </div>
  `;
}

export default FilesTab;
