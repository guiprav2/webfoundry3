import AIImageDialog from './AIImageDialog.js';
import d from '../../other/dominant.js';
import rfiles from '../../repositories/FilesRepository.js';
import styles from '../../other/styles.js';
import { isImage, selectFile, showModal } from '../../other/util.js';

class ImageGalleryDialog {
  folders = [];
  selectedFolder = '';
  images = [];

  constructor(props) {
    (async () => { this.folders = await this.loadFolders(); await this.selectFolder(this.folders[0]) })();
  }

  async loadFolders() {
    let files = await rfiles.loadFiles(state.app.currentSite);
    return [...new Set(files.filter(x => x.startsWith('images/')).map(x => x.split('/').slice(0, -1).join('/')).filter(Boolean))];
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

  ai = async () => {
    let [btn, name, file] = await showModal(d.el(AIImageDialog));
    if (btn !== 'ok') { return }
    await rfiles.saveFile(state.app.currentSite, [this.selectedFolder, name].filter(Boolean).join('/'), file);
    await this.loadImages();
    post('app.loadFiles');
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
          <div class="flex">
            ${d.if(() => this.images.length, d.html`<button type="button" class="nf nf-fa-cloud_upload text-2xl hover:bg-black/70 outline-none rounded-b px-3 pt-1 pb-2" ${{
              onClick: this.upload,
            }}>`)}
            <button type="button" class="text-2xl hover:bg-black/70 outline-none rounded-b px-3 pt-1 pb-2" ${{ onClick: this.ai }}>
              <svg viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="m9 4l2.5 5.5L17 12l-5.5 2.5L9 20l-2.5-5.5L1 12l5.5-2.5zm0 4.83L8 11l-2.17 1L8 13l1 2.17L10 13l2.17-1L10 11zM19 9l-1.26-2.74L15 5l2.74-1.25L19 1l1.25 2.75L23 5l-2.75 1.26zm0 14l-1.26-2.74L15 19l2.74-1.25L19 15l1.25 2.75L23 19l-2.75 1.26z"/>
              </svg>
            </button>
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
              <a href="#" class="aspect-square flex justify-center items-center outline rounded overflow-hidden bg-black/80" ${{
                class: () => this.selected === x ? 'outline-4 outline-blue-500' : 'outline-2 outline-neutral-500',
                onClick: () => this.selected = x,
              }}>
                <img class="border border-transparent max-h-full" ${{ src: `/files/${state.app.currentSite}/${x}` }}>
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
