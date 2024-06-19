import d from '../../other/dominant.js';
import rfiles from '../../repositories/FilesRepository.js';
import styles from '../../other/styles.js';

class ComponentsDialog {
  constructor(props) { this.props = props; this.loadComponents(this.props.component) }

  async loadComponents(component) {
    let templatesBlob = await rfiles.loadFile(state.app.currentSite, 'webfoundry/templates.json');
    let templates = JSON.parse(await templatesBlob.text());
    this.components = Object.keys(templates).filter(x => x.startsWith('components/')).map(x => x.replace(/^components\/|\.html$/g, ''));
    this.selected = this.components.includes(component) ? component : this.components[0];
    d.update();
  }

  onAttach = () => {
    this.propsEditor = ace.edit(this.propsEditorRoot);
    this.propsEditor.setTheme('ace/theme/monokai');
    this.propsEditor.session.setMode('ace/mode/json');
    this.propsEditor.session.setTabSize(2);
    this.propsEditor.session.setValue(this.props.props || '{}');
    ace.require("ace/ext/beautify").beautify(this.propsEditor.session);
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = [this.selected, this.propsEditor.session.getValue()]; this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] p-3 pt-2">
      <form method="dialog" ${{ onAttach: this.onAttach, onSubmit: this.onSubmit }}>
        <div>Set component</div>
        ${d.if(() => !this.components?.length, d.html`
          <div>You don't have any components yet.</div>
          <div>Create one under components/ and try again.</div>
        `, d.html`
          <select class="outline-none bg-transparent *:bg-[#121212] *:text-neutral-100" ${{ value: d.binding({ get: () => this.selected, set: x => this.selected = x }) }}>
            ${d.usePlaceholderTag('option', d.map(() => this.components, x => d.html`<option ${{ value: x }}>${x}</option>`))}
          </select>
          ${this.propsEditorRoot = d.html`<div class="w-[50vw] h-[50vh] mt-2 rounded">`}
        `)}
        <div class="flex gap-1.5 mt-3 justify-end">
          <button value="cancel" ${{ class: styles.secondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: styles.primaryBtn, disabled: () => !this.selected }}>OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default ComponentsDialog;
