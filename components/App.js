import CodeEditor from './CodeEditor.js';
import Designer from './Designer.js';
import FilesPanel from './FilesPanel.js';
import IconsSidebar from './IconsSidebar.js';
import SitesPanel from './SitesPanel.js';
import StylesPanel from './StylesPanel.js';
import d from '../other/dominant.js';

class App {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="App min-h-screen flex" ${{ onAttach: this.props.onAttach }}>
      ${d.el(IconsSidebar, { currentPanel: d.binding({ get: () => this.props.currentPanel }), onSelect: this.props.onSelectIcon })}
      ${d.if(() => this.props.currentPanel === 'sites', d.el(SitesPanel, {
        sites: d.binding({ get: () => this.props.sites }),
        currentSite: d.binding({ get: () => this.props.currentSite }),
        onCreate: this.props.onCreateSite,
        onSelect: this.props.onSelectSite,
        onRename: this.props.onRenameSite,
        onDelete: this.props.onDeleteSite,
      }))}
      ${d.if(() => this.props.currentPanel === 'files', d.el(FilesPanel, {
        files: d.binding({ get: () => this.props.files }),
        currentFile: d.binding({ get: () => this.props.currentFile }),
        onCreate: this.props.onCreateFile,
        onSelect: this.props.onSelectFile,
        onRename: this.props.onRenameFile,
        onDelete: this.props.onDeleteFile,
      }))}
      ${d.if(() => this.props.currentPanel === 'styles', d.el(StylesPanel, {
        styles: d.binding({ get: () => this.props.styles }),
        onEdit: this.props.onEditStyle,
        onDelete: this.props.onDeleteStyle,
        onAddStyleKeyDown: this.props.onAddStyleKeyDown,
      }))}
      ${d.if(() => !this.props.currentFile, d.html`
        <div class="flex-1 bg-[#060a0f] flex justify-center items-center">
          <div class="text-7xl gfont-[Pacifico] text-black/50 select-none">Webfoundry</div>
        </div>
      `, d.if(() => this.props.currentFile.endsWith('.html'), d.el(Designer, {
        width: d.binding({ get: () => this.props.designerWidth }),
        height: d.binding({ get: () => this.props.designerHeight }),
        preview: d.binding({ get: () => this.props.preview }),
        onResize: this.props.onResizeDesigner,
      }), d.el(CodeEditor, {
        currentFile: d.binding({ get: () => this.props.currentFile }),
        text: d.binding({ get: () => this.props.editorText }),
        onChange: this.props.onEditorChange,
      })))}
    </div>
  `;
}

export default App;
