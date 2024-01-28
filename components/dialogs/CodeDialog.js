import d from '../../other/dominant.js';

class CodeDialog {
  constructor(props) { this.props = props }
  get title() { return d.resolve(this.props.title) }
  get value() { return this.props.value }

  onAttach = () => {
    this.editor = ace.edit(this.editorNode);
    this.editor.setTheme('ace/theme/monokai');
    this.editor.session.setMode('ace/mode/html');
    this.value && this.editor.session.setValue(this.value);
    ace.require("ace/ext/beautify").beautify(this.editor.session);
    this.editor.focus();
  };

  onKeyDown = ev => {
    if (!ev.ctrlKey || ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.stopPropagation();
    this.okBtn.click()
  };

  onSubmit = () => this.root.returnDetail = this.editor.getValue();

  render = () => this.root = d.html`
    <dialog class="w-[40vw] rounded p-0 text-white text-sm sans bg-[#262626]" ${{ onAttach: this.onAttach }}>
      <form method="dialog" ${{ onSubmit: this.onSubmit }}>
        ${d.if(() => this.title, d.html`<div class="border-b border-neutral-900 px-3 pt-2 pb-1">${d.text(() => this.title)}</div>`)}
        <div class="p-3">${this.editorNode = d.html`<div class="h-96 text-base" ${{ onKeyDown: this.onKeyDown }}>`}</div>
        <div class="flex gap-2 px-3 py-2 border-t border-neutral-900">
          ${this.okBtn = d.html`<button class="px-3 py-1 bg-[#4f46e5] rounded flex-1" type="submit" value="ok">OK</button>`}
          <button class="px-3 py-1 bg-[#2b2d31] rounded flex-1" value="cancel">Cancel</button>
        </div>
      </form>
    </dialog>
  `;
}

export default CodeDialog;