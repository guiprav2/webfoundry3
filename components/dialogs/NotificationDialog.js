import d from '../../other/dominant.js';

class NotificationDialog {
  constructor(props) { this.props = props }
  get title() { return this.props.title || 'Notification' }
  get text() { return this.props.text }

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 rounded text-sm text-white bg-[#262626] shadow-xl">
      <form method="dialog">
        <div class="border-b border-neutral-900">
          <div class="px-3 py-2 flex items-center gap-3">${this.title}</div>
        </div>
        <div class="flex p-3">${this.text}</div>
        <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
          <button class="px-3 py-1 bg-[#4f46e5] rounded flex-1" type="submit">OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default NotificationDialog;