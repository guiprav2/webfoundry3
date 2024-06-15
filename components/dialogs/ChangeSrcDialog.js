import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class ChangeSrcDialog {
  constructor(props) { this.props = props; this.srcValue = this.props.initialSrcValue; this.exprValue = this.props.initialExprValue }

  onKeyDown = ev => {
    if (ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.target.closest('form').querySelector('[value="ok"]').click();
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = [this.srcValue, this.exprValue]; this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3 pt-2">
      <form method="dialog" ${{ onKeyDown: this.onKeyDown, onSubmit: this.onSubmit }}>
        <div>Change src</div>
        <input placeholder="src" class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
          value: d.binding({ get: () => this.srcValue, set: x => this.srcValue = x }),
        }}>
        <input placeholder="src expression" class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
          value: d.binding({ get: () => this.exprValue, set: x => this.exprValue = x }),
        }}>
        <div class="flex gap-1.5 mt-3">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: styles.fullPrimaryBtn }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default ChangeSrcDialog;
