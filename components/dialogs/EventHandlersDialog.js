import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class EventHandlersDialog {
  handlers = [{}];
  constructor(props) { this.props = props; this.handlers = [...this.props.handlers, {}] }
  //get valid() { return this.props.allowEmpty || this.value }

  clearEmpty = () => {
    this.handlers.push({});
    let i;
    for (i = 0; i < this.handlers.length; i++) {
      if (!this.handlers[i].name && !this.handlers[i].expr) { break }
    }
    let spliced = this.handlers.splice(i + 1, 99999);
  };

  onKeyDown = ev => {
    this.clearEmpty();
    if (ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.target.closest('form').querySelector('[value="ok"]').click();
  };

  onSubmit = ev => { ev.preventDefault(); this.clearEmpty(); this.root.returnDetail = this.handlers.slice(0, -1); this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] p-3 pt-2">
      <form method="dialog" ${{ onKeyDown: this.onKeyDown, onSubmit: this.onSubmit }}>
        <div>Set event handlers</div>
        ${d.map(() => this.handlers, x => d.html`
          <div class="mt-2 flex gap-1.5">
            <input placeholder="Event" class="outline-none rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150] w-32" ${{
              value: d.binding({ get: () => x.name, set: y => x.name = y }),
            }}>
            <input placeholder="Handler" class="outline-none w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
              value: d.binding({ get: () => x.expr, set: y => x.expr = y }),
            }}>
          </div>
        `)}
        <div class="flex gap-1.5 mt-3">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: styles.fullPrimaryBtn }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default EventHandlersDialog;
