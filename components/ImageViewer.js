import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class ImageViewer {
  constructor(props) { this.props = props; this.state = useCtrl()[0] }
  get path() { return this.props.path }

  render = () => d.html`
    <div class="flex-1 flex justify-center items-center">
      <img class="max-h-[80vh]" ${{ src: `files/${this.state.app.currentSite}/${this.path}` }}>
    </div>
  `;
}

export default ImageViewer;
