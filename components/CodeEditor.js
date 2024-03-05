import d from '../other/dominant.js';
import debounce from 'https://cdn.skypack.dev/debounce';
import rfiles from '../repositories/FilesRepository.js';
import useCtrl from '../controllers/useCtrl.js';

class CodeEditor {
  constructor(props) {
    this.props = props;
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
  }

  get path() { return this.props.path }

  onAttach = async () => {
    this.editor = ace.edit(this.root);
    this.editor.session.setTabSize(2);
    this.editor.setFontSize('16px');
    this.editor.setTheme('ace/theme/monokai');
    let mode = { css: 'css', js: 'javascript' }[this.path.split('.').pop()];
    mode && this.editor.session.setMode(`ace/mode/${mode}`);
    let blob = await rfiles.loadFile(this.state.app.currentSite, this.path);
    this.editor.session.setValue(await blob.text());
    this.editor.session.on('change', () => debounce(() => this.post('app.saveFile', this.path, this.editor.session.getValue()), 200)());
    this.editor.focus();
  };

  render = () => this.root = d.html`<div class="flex-1" ${{ onAttach: this.onAttach }}></div>`;
}

export default CodeEditor;
