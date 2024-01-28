import ActionHandler from '../other/ActionHandler.js';
import MagicGloves from '../other/MagicGloves.js';
import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class Designer {
  constructor(props) {
    this.props = props;
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
  }

  get path() { return this.props.path }
  get editorDocument() { return this.root.contentDocument }
  onAttach = () => this.post('designer.setActionHandler', new ActionHandler(this));
  onDetach = () => { this.gloves && this.gloves.destroy(); this.post('designer.reset') };

  onLoad = () => {
    this.gloves = new MagicGloves(this.root);

    if (!this.editorDocument.querySelector('.wf-preflight')) {
      let stylesheet = d.html`<link rel="stylesheet" class="wf-preflight">`;
      stylesheet.href = `${location.pathname}other/preflight.css`;
      this.editorDocument.head.prepend(stylesheet);
      let script = this.editorDocument.createElement('script');
      script.className = 'wf-windy';
      script.src = `${location.pathname}other/windy.js`;
      script.onload = () => this.root.classList.remove('hidden');
      this.editorDocument.head.append(script);
    } else {
      this.root.classList.remove('hidden');
    }

    let mutobs = new MutationObserver(() => this.post('app.saveFile', this.path, `<!doctype html>\n${this.editorDocument.documentElement.outerHTML}`));
    mutobs.observe(this.editorDocument.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
  };

  render = () => this.root = d.html`
    <iframe class="hidden flex-1 bg-white" ${{
      onAttach: this.onAttach, onDetach: this.onDetach,
      src: `files/${this.state.app.currentSite}/${this.path}`, onLoad: this.onLoad,
    }}>
  `;
}

export default Designer;
