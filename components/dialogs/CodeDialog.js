import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class CodeDialog {
  constructor(props) { this.props = props }

  onAttach = () => {
    this.editor = ace.edit(this.editorRoot);
    this.editor.setTheme('ace/theme/monokai');
    this.editor.session.setMode(`ace/mode/${this.props.mode || 'html'}`);
    this.editor.session.setTabSize(2);
    this.props.initialValue && this.editor.session.setValue(this.props.initialValue);
    ace.require("ace/ext/beautify").beautify(this.editor.session);
    this.editor.focus();
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = this.editor.session.getValue(); this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] p-3 pt-2">
      <form method="dialog" ${{ onAttach: this.onAttach, onSubmit: this.onSubmit }}>
        <div>${d.text(() => this.props.title)}</div>
        ${this.editorRoot = d.html`<div class="w-[50vw] h-[50vh] mt-2 rounded">`}
        <div class="flex gap-1.5 mt-3 justify-end">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: styles.fullPrimaryBtn }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default CodeDialog;
