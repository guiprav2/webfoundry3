import d from '../../other/dominant.js';

class ZipDialog {
  render = () => d.html`
    <dialog class="p-0 bg-[#262626] rounded text-white text-sm shadow-xl max-w-xs">
      <form method="dialog">
        <div class="border-b border-neutral-900">
          <div class="px-3 py-2 flex items-center gap-3">ZIP options</div>
        </div>
        <div class="flex p-3 gap-3">
          <button class="flex-1 border rounded px-6 py-3 border-neutral-900 hover:bg-neutral-900/50" value="export">
            <div class="nf nf-fa-cloud_download mx-auto w-min font-7xl"></div>
            <div class="text-center mt-2">Export</div>
          </button>
          <button class="flex-1 border rounded px-6 py-3 border-neutral-900 hover:bg-neutral-900/50" value="import">
            <div class="nf mx-auto w-min font-7xl nf-fa-cloud_upload"></div>
            <div class="text-center mt-2">Import</div>
          </button>
        </div>
        <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
          <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" value="cancel">Cancel</button>
        </div>
      </form>
    </dialog>
  `;
}

export default ZipDialog;