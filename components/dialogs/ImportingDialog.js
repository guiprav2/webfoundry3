import d from '../../other/dominant.js';

class ImportingDialog {
  constructor(props) { this.props = props }
  onAttach = () => d.effect(() => this.done, x => x && this.root.close());
  get done() { return d.resolve(this.props.done) }

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 rounded text-sm text-white bg-[#262626] outline-none shadow-xl" ${{
      onAttach: this.onAttach,
      onKeyDown: ev => ev.preventDefault(),
     }}>
      <form method="dialog">
        <div class="border-b border-neutral-900">
          <div class="px-3 py-2 flex items-center gap-3">Import in progress, please wait...</div>
        </div>
        <div class="flex justify-center py-8">
          <i class="nf nf-fae-spin_double spinning font-6xl"></i>
        </div>
      </form>
    </dialog>
  `;
}

export default ImportingDialog;