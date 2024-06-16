import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class CreateFileDialog {
  type = 'file';
  constructor(props) { this.props = props }
  onChangeType = ev => this.type = ev.target.value;
  get valid() { return !!this.value?.trim?.() && !this.value.match(/[:\/]/) && !this.value.endsWith('.jsx') }

  onKeyDown = ev => {
    if (ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.target.closest('form').querySelector('[value="ok"]').click();
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = [this.type.trim(), this.value]; this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3 pt-2">
      <form method="dialog" ${{ onKeyDown: this.onKeyDown, onSubmit: this.onSubmit }}>
        <div class="flex items-center gap-3">
          <div>New:</div>
          <select class="outline-none bg-transparent *:bg-[#121212] *:text-neutral-100" ${{ onChange: this.onChangeType }}>
            <option value="file" selected>File</option>
            <option value="folder">Folder</option>
          </select>
        </div>
        <input class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
          placeholder: 'Name',
          value: d.binding({ get: () => this.value, set: x => this.value = x }),
        }}>
        ${d.if(() => this.value?.trim?.() && !this.valid, d.html`
          <div class="text-yellow-500 mt-2">
            <span class="nf nf-fa-warning"></span> Name cannot contain colons or slashes, and cannot end in <span class="font-bold">.jsx</span> (unsupported format).
          </div>
        `)}
        <div class="flex gap-1.5 mt-3">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn, disabled: () => state.app.tourDisable.has('cancelBtns') }}>Cancel</button>
          <button value="ok" ${{ class: styles.fullPrimaryBtn, disabled: () => !this.valid }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default CreateFileDialog;
