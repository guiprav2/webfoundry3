import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class PromptDialog {
  constructor(props) { this.props = props }
  onSubmit = ev => ev.submitter.value === 'open' && open(this.props.url);

  render = () => d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3 pt-2">
      <form method="dialog" ${{ onSubmit: this.onSubmit }}>
        <div>Deploy Finished</div>
        <div class="flex gap-1.5 mt-3">
          <button value="close" ${{ class: styles.fullSecondaryBtn }}>Close</button>
          <button value="open" ${{ class: styles.fullPrimaryBtn }}>Open Site</button>
        </div>
      </form>
    </dialog>
  `;
}

export default PromptDialog;
