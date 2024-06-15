import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class PromptDialog {
  constructor(props) { this.props = props; this.value = this.props.initialValue }
  get valid() { return this.props.allowEmpty || this.value }

  onKeyDown = ev => {
    if (ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.target.closest('form').querySelector('[value="ok"]').click();
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = this.value; this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3 pt-2" ${{ class: this.props.short ? 'w-64' : 'w-[30vw]' }}>
      <form method="dialog" ${{ onKeyDown: this.onKeyDown, onSubmit: this.onSubmit }}>
        <div>${d.text(() => this.props.title)}</div>
        ${d.if(() => !this.props.multiline, d.html`
          <input class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
            onAttach: x => x.select(),
            placeholder: () => this.props.placeholder || 'Value',
            value: d.binding({ get: () => this.value, set: x => this.value = x }),
          }}>
        `, d.html`
          <textarea class="outline-none mt-2 w-full min-h-64 rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
            onAttach: x => x.select(),
            placeholder: () => this.props.placeholder || 'Value',
            value: d.binding({ get: () => this.value, set: x => this.value = x }),
          }}></textarea>
        `)}
        <div class="flex gap-1.5 mt-3">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: styles.fullPrimaryBtn, disabled: () => !this.valid }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default PromptDialog;
