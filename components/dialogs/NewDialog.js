import d from '../../other/dominant.js';

class NewDialog {
  render = () => this.root = d.html`
    <dialog class="p-0 bg-[#262626] rounded text-white text-sm shadow-xl">
      <form ${{ onSubmit: ev => ev.preventDefault() }}>
        <div class="border-b border-neutral-900">
          <div class="px-3 py-2 flex items-center gap-3">
            New:
            ${this.typeSelect = d.html`
              <select class="bg-transparent">
                <option value="file" selected="">File</option>
                <option value="folder">Folder</option>
              </select>
            `}
          </div>
        </div>
        <div class="p-3">
          <div class="flex gap-3 items-center">
            Name: ${this.nameInput = d.html`<input class="w-full bg-[#2b2d31] rounded px-2 py-1 outline-none">`}
          </div>
        </div>
        <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
          <button class="px-3 py-1 rounded flex-1 bg-[#4f46e5]" type="submit" ${{ onClick: this.ok }}>OK</button>
          <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" ${{ onClick: () => this.root.close('cancel') }}>Cancel</button>
        </div>
      </form>
    </dialog>
  `;

  ok = () => {
    this.root.returnDetail = [this.typeSelect.value, this.nameInput.value];
    this.root.close('ok');
  };
}

export default NewDialog;