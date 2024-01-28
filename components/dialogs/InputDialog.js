import d from '../../other/dominant.js';

class InputDialog {
  constructor(props) { this.props = props }
  get short() { return this.props.short }
  get title() { return this.props.title }
  get value() { return this.props.value }
  get multiline() { return this.props.multiline || this.value?.includes?.('\n') }
  onSubmit = () => this.root.returnDetail = this.input.value;

  onKeyDown = ev => {
    if ((!this.multiline || ev.ctrlKey) && ev.key === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
      this.okBtn.click()
    }
  };

  render = () => this.root = d.html`
    <dialog ${{ class: [!this.short && 'w-[40vw]', 'p-0 bg-[#262626] rounded text-white text-sm sans'] }}>
      <form method="dialog" ${{ onSubmit: this.onSubmit }}>
        ${d.if(() => this.title, d.html`<div class="px-3 pt-2 border-b border-neutral-900 pb-1">${d.text(() => this.title)}</div>`)}
        <div class="p-3">
          ${this.input = !this.multiline ? d.html`
            <input class="w-full bg-[#2b2d31] rounded px-2 py-1 outline-none" ${{ value: this.value || '', onKeyDown: this.onKeyDown }}>
          ` : d.html`
            <textarea class="w-full h-32 bg-[#2b2d31] rounded px-2 py-1 outline-none" ${{ value: this.value || '', onKeyDown: this.onKeyDown }}>
          `}
        </div>
        <div class="flex gap-2 px-3 py-2 border-t border-neutral-900">
          ${this.okBtn = d.html`<button class="px-3 py-1 bg-[#4f46e5] rounded flex-1" type="submit" value="ok">OK</button>`}
          <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" value="cancel">Cancel</button>
        </div>
      </form>
    </dialog>
  `;
}

export default InputDialog;