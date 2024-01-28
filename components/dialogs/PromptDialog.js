import d from '../../other/dominant.js';

class PromptDialog {
  constructor(props) { this.props = props }
  get prompt() { return this.props.prompt }
  get initialValue() { return this.props.initialValue || '' }
  close(btn, detail) { this.root.returnDetail = detail; this.root.close(btn) }

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 rounded text-sm text-white bg-[#262626] shadow-xl">
      <form ${{ onSubmit: ev => ev.preventDefault() }}>
        <div class="border-b border-neutral-900">
          <div class="px-3 py-2 flex items-center gap-3">${this.prompt}</div>
        </div>
        <div class="flex p-3">
          ${this.input = d.html`<input class="flex-1 outline-none rounded px-2 py-1 bg-[#2b2d31]" ${{ value: this.initialValue }}>`}
        </div>
        <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
          <button class="px-3 py-1 bg-[#4f46e5] rounded flex-1" type="submit" ${{ onClick: () => this.close('ok', this.input.value) }}>OK</button>
          <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" ${{ onClick: () => this.close('cancel') }}>Cancel</button>
        </div>
      </form>
    </dialog>
  `;
}

export default PromptDialog;