import d from '../other/dominant.js';
import debounce from 'https://cdn.skypack.dev/debounce';

class CodeEditor {
  constructor(props) { this.props = props }

  onAttach = () => {
    this.editor = ace.edit(this.root);
    this.editor.setFontSize('16px');
    this.editor.setTheme('ace/theme/monokai');
    let mode = { css: 'css', js: 'javascript' }[this.props.currentFile.split('.').pop()];
    mode && this.editor.session.setMode(`ace/mode/${mode}`);
    this.editor.session.setTabSize(2);
    this.editor.session.setValue(this.props.text);
    this.editor.session.on('change', () => debounce(() => this.props.onChange(this.editor.session.getValue()), 200)());
    this.editor.focus();
  };

  render = () => this.root = d.html`
    <div class="CodeEditor flex-1" ${{ onAttach: this.onAttach }}></div>
  `;
}

export default CodeEditor;
