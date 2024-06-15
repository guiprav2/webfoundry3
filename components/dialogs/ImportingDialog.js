import d from '../../other/dominant.js';

class ImportingDialog {
  constructor(props) { this.props = props }
  onAttach = () => d.effect(() => d.resolve(this.props.done), x => x && this.root.close());

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3" ${{ onAttach: this.onAttach, onKeyDown: ev => ev.preventDefault() }}>
      <div class="text-center">Import in progress</div>
      <svg class="animate-spin text-white mx-auto w-16 h-16 my-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div class="text-center">Please wait...</div>
    </dialog>
  `;
}

export default ImportingDialog;
