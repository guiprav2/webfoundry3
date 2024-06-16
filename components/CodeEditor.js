import d from '../other/dominant.js';
import debounce from 'https://cdn.skypack.dev/debounce';

class CodeEditor {
  constructor(props) { this.props = props }

  onAttach = () => {
    let { currentSite, currentFile } = this.props;
    if (!currentSite || !currentFile) { return }
    Object.assign(this, { currentSite, currentFile });
    this.editor = ace.edit(this.root);
    this.editor.setFontSize('16px');
    this.editor.setTheme('ace/theme/monokai');
    let mode = { css: 'css', js: 'javascript' }[this.currentFile.split('.').pop()];
    mode && this.editor.session.setMode(`ace/mode/${mode}`);
    this.editor.session.setTabSize(2);
    this.editor.session.setValue(this.props.text);
    this.onChange = this.onChange.bind(this);
    this.editor.session.on('change', this.onChange);
    this.editor.focus();
  };

  onDetach = () => this.editor?.session?.off?.('change', this.onChange);
  onChange = debounce(() => this.props.onChange(this.currentSite, this.currentFile, this.editor.session.getValue()), 200);
  render = () => this.root = d.html`<div class="CodeEditor flex-1" ${{ onAttach: this.onAttach, onDetach: this.onDetach }}></div>`;
}

export default CodeEditor;
