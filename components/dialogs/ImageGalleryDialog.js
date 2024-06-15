import d from '../../other/dominant.js';
import rfiles from '../../repositories/FilesRepository.js';
import styles from '../../other/styles.js';
import { isImage, selectFile } from '../../other/util.js';

class ImageGalleryDialog {
  folders = [];
  selectedFolder = '';
  images = [];

  constructor(props) {
    (async () => { this.folders = await this.loadFolders(); await this.selectFolder(this.folders[0]) })();
  }

  async loadFolders() {
    let files = await rfiles.loadFiles(state.app.currentSite);
    return [...new Set(files.map(x => x.split('/').slice(0, -1).join('/')))];
  }

  async getImages(path) {
    let files = await rfiles.loadFiles(state.app.currentSite);
    return files.filter(x => x.split('/').slice(0, -1).join('/') === path && isImage(x)).sort((a, b) => a.localeCompare(b));
  }

  async loadImages() { this.images = await this.getImages(this.selectedFolder); d.update() }
  async selectFolder(path) { this.selectedFolder = path; this.images = await this.getImages(path); d.update() }

  upload = async () => {
    let f = await selectFile('image/*');
    await rfiles.saveFile(state.app.currentSite, [this.selectedFolder, f.name].filter(Boolean).join('/'), f);
    await this.loadImages();
    await post('app.loadFiles');
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = this.selected; this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017]" ${{ class: () => this.images.length && 'w-[70vw]' }}>
      <form method="dialog" ${{ onSubmit: this.onSubmit }}>
        <div class="flex items-center gap-3 px-3">
          <div>Image Gallery:</div>
          <select class="outline-none bg-transparent *:bg-[#121212] *:text-neutral-100">
            ${d.usePlaceholderTag('option', d.map(() => this.folders, x => d.html`<option ${{ value: x, selected: () => this.selectedFolder === x }}>${x}</option>`))}
          </select>
          <div>
            ${d.if(() => this.images.length, d.html`<button class="nf nf-fa-cloud_upload text-2xl hover:bg-black/70 rounded-b px-3 pt-1 pb-2"></button>`)}
            <button class="nf text-2xl hover:bg-black/70 nf-md-robot_happy rounded-b px-3 pt-1 pb-2"></button>
          </div>
        </div>
        ${d.if(() => !this.images.length, d.html`
          <a href="#" class="flex-1 flex flex-col justify-center items-center gap-4 p-24" ${{ onClick: this.upload, onDrop: this.drop, onDragOver: ev => ev.preventDefault() }}>
            <i class="nf nf-fa-cloud_upload text-5xl"></i>
            <div class="italic">Folder empty. Select a different folder or upload an image here.</div>
          </a>
        `, d.html`
          <div class="overflow-auto grid grid-cols-4 gap-6 px-4 pt-3 pb-1">
            ${d.map(() => this.images, x => d.html`
              <a href="#" class="aspect-square flex justify-center items-center outline rounded overflow-hidden" ${{
                class: () => this.selected === x ? 'outline-4 outline-blue-500' : 'outline-2 outline-neutral-500',
                onClick: () => this.selected = x,
              }}>
                <img class="border border-transparent max-h-full rounded" ${{ src: `/files/${state.app.currentSite}/${x}` }}>
              </a>
            `)}
          </div>
        `)}
        <div class="flex gap-1.5 justify-end p-3">
          <button value="cancel" ${{ class: styles.secondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: styles.primaryBtn, disabled: () => !this.selected }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default ImageGalleryDialog;
