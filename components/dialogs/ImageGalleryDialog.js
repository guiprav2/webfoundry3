import d from '../../other/dominant.js';
import useCtrl from '../../controllers/useCtrl.js';

class ImageGalleryDialog {
  constructor() {
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
    post('imageGallery.reset');
  }

  close(btn, detail) { this.root.returnDetail = detail; this.root.close(btn) }

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 bg-[#262626] rounded text-white text-sm shadow-xl w-[70vw] max-h-[70vh]">
      <div class="border-b border-neutral-900">
        <div class="px-3 py-2 flex items-center gap-3">
          Image gallery:
          <select class="outline-none bg-transparent" ${{ onChange: ev => this.post('imageGallery.changeFolder', ev.target.value) }}>
            ${d.usePlaceholderTag('option', d.map(() => this.state.imageGallery.folders, x => d.html`
              <option ${{ value: x, selected: () => this.state.imageGallery.currentFolder === x }}>${x || '/'}</option>
            `))}
          </select>
          ${d.if(() => this.state.imageGallery.images.length, d.html`
            <button class="nf nf-fa-cloud_upload font-lg" ${{ onClick: () => this.post('imageGallery.upload') }}></button>
          `)}
        </div>
      </div>
      ${d.if(() => !this.state.imageGallery.images.length, d.html`
        <a href="#" class="flex-1 flex flex-col justify-center items-center gap-4 my-24" ${{ onClick: () => this.post('imageGallery.upload') }}>
          <i class="nf nf-fa-cloud_upload font-5xl"></i>
          <div class="italic">Folder empty. Select a different folder or upload an image here.</div>
        </a>
      `, d.html`
        <div class="flex-1 grid grid-cols-4 gap-6 overflow-auto p-6">
          ${d.map(() => this.state.imageGallery.images, x => d.html`
            <a class="aspect-square flex justify-center items-center" ${{ onClick: () => this.post('imageGallery.selectImage', x) }}>
              <img ${{
                class: [
                  'border border-transparent outline rounded max-h-full',
                  () => this.state.imageGallery.selectedImage === x ? 'outline-4 outline-blue-500' : 'outline-2 outline-neutral-500',
                ],
                src: `/files/${this.state.app.currentSite}/${x}`,
              }}>
            </a>
          `)}
        </div>
      `)}
      <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
        <button ${{
          class: ['px-3 py-1 bg-[#4f46e5] rounded flex-1', () => !this.state.imageGallery.selectedImage && 'opacity-50'],
          onClick: () => this.close('ok', this.state.imageGallery.selectedImage),
          disabled: () => !this.state.imageGallery.selectedImage,
        }}>OK</button>
        <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" ${{ onClick: () => this.close('cancel') }}>Cancel</button>
      </div>
    </dialog>
  `;
}

export default ImageGalleryDialog;
