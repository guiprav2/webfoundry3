import d from '../../other/dominant.js';

class ConfirmationDialog {
  constructor(props) { this.props = props }
  get prompt() { return this.props.prompt }
  close(btn, detail) { this.root.returnDetail = detail; this.root.close(btn) }

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 rounded text-sm text-white bg-[#262626] shadow-xl">
      <div class="border-b border-neutral-900">
        <div class="px-3 py-2 flex items-center gap-3">${this.prompt}</div>
      </div>
      <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
        <button class="px-3 py-1 bg-[#4f46e5] rounded flex-1" ${{ onClick: () => this.close('ok') }}>OK</button>
        <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" ${{ onClick: () => this.close('cancel') }}>Cancel</button>
      </div>
    </dialog>
  `;
}

export default ConfirmationDialog;