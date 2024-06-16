import ActionsPanel from './ActionsPanel.js';
import CodeEditor from './CodeEditor.js';
import Designer from './Designer.js';
import FilesPanel from './FilesPanel.js';
import IconsSidebar from './IconsSidebar.js';
import MediaViewer from './MediaViewer.js';
import SitesPanel from './SitesPanel.js';
import StylesPanel from './StylesPanel.js';
import TilesPanel from './TilesPanel.js';
import WfPanel from './WfPanel.js';
import d from '../other/dominant.js';
import { isImage, isVideo, isAudio } from '../other/util.js';

class App {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="App min-h-screen flex" ${{ onAttach: this.props.onAttach }}>
      ${d.el(IconsSidebar, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        enabledIcons: d.binding({ get: () => this.props.enabledSidebarIcons }),
        currentPanel: d.binding({ get: () => this.props.currentPanel }),
        onSelect: this.props.onSelectIcon,
      })}
      ${d.if(() => this.props.currentPanel === 'wf', d.el(WfPanel, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        sites: d.binding({ get: () => this.props.sites }),
        currentSite: d.binding({ get: () => this.props.currentSite }),
        onCreate: this.props.onCreateSite,
        onSelect: this.props.onSelectSite,
      }))}
      ${d.if(() => this.props.currentPanel === 'sites', d.el(SitesPanel, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        sites: d.binding({ get: () => this.props.sites }),
        currentSite: d.binding({ get: () => this.props.currentSite }),
        onCreate: this.props.onCreateSite,
        onSelect: this.props.onSelectSite,
        onRename: this.props.onRenameSite,
        onDelete: this.props.onDeleteSite,
      }))}
      ${d.if(() => this.props.currentPanel === 'files', d.el(FilesPanel, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        files: d.binding({ get: () => this.props.files }),
        currentFile: d.binding({ get: () => this.props.currentFile }),
        onCreate: this.props.onCreateFile,
        onCreateRootFolder: this.props.onCreateRootFolder,
        onSelect: this.props.onSelectFile,
        onRename: this.props.onRenameFile,
        onDelete: this.props.onDeleteFile,
        onDragStart: this.props.onDragStartFile,
        onDragOver: this.props.onDragOverFile,
        onDrop: this.props.onDropFile,
      }))}
      ${d.if(() => this.props.currentPanel === 'actions', d.el(ActionsPanel, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
      }))}
      ${d.if(() => this.props.currentPanel === 'styles', d.el(StylesPanel, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        styles: d.binding({ get: () => this.props.styles }),
        replacingStyle: d.binding({ get: () => this.props.replacingStyle }),
        onReplaceStyleKeyDown: this.props.onReplaceStyleKeyDown,
        onReplaceStyleBlur: this.props.onReplaceStyleBlur,
        onEdit: this.props.onEditStyle,
        onDelete: this.props.onDeleteStyle,
        onAddStyleKeyDown: this.props.onAddStyleKeyDown,
        onAddStyleSubmit: this.props.onAddStyleSubmit,
      }))}
      ${d.if(() => this.props.currentPanel === 'tiles', d.el(TilesPanel, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
      }))}
      ${d.if(() => this.props.currentPanel !== 'wf' && !this.props.currentFile, d.html`
        <div class="flex-1 bg-[#060a0f] flex justify-center items-center">
          <div class="text-7xl gfont-[Pacifico] text-black/50 select-none">Webfoundry</div>
        </div>
      `, d.if(() => this.props.currentPanel !== 'wf' && this.props.currentFile.endsWith('.html'), d.el(Designer, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        width: d.binding({ get: () => this.props.designerWidth }),
        height: d.binding({ get: () => this.props.designerHeight }),
        preview: d.binding({ get: () => this.props.preview }),
        src: d.binding({ get: () => this.props.designerSrc }),
        loading: d.binding({ get: () => this.props.designerLoading }),
        contextMenu: d.binding({ get: () => this.props.contextMenu }),
        onLoad: this.props.onLoadDesigner,
        onResize: this.props.onResizeDesigner,
      }), d.if(() => this.props.currentPanel !== 'wf' && (isImage(this.props.currentFile) || isVideo(this.props.currentFile) || isAudio(this.props.currentFile)), d.el(MediaViewer, {
        currentSite: d.binding({ get: () => this.props.currentSite }),
        currentFile: d.binding({ get: () => this.props.currentFile }),
      }), d.if(() => this.props.currentPanel !== 'wf', d.el(CodeEditor, {
        tourDisable: d.binding({ get: () => this.props.tourDisable }),
        currentSite: d.binding({ get: () => this.props.currentSite }),
        currentFile: d.binding({ get: () => this.props.currentFile }),
        text: d.binding({ get: () => this.props.editorText }),
        onChange: this.props.onEditorChange,
      })))))}
    </div>
  `;
}

export default App;
