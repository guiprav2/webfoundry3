import d from '../other/dominant.js';
import { isImage, isVideo, isAudio } from '../other/util.js';

class MediaViewer {
  constructor(props) {
    this.props = props;
    d.effect(() => this.props.currentFile, x => {
      this.media = d.el(this.tagName || 'div', {
        class: 'max-w-full max-h-full',
        src: () => this.tagName ? `/files/${this.props.currentSite}/${this.props.currentFile}` : '',
      });
    });
  }

  get tagName() {
    if (isImage(this.props.currentFile)) { return 'img' }
    if (isVideo(this.props.currentFile)) { return 'video' }
    if (isAudio(this.props.currentFile)) { return 'audio' }
  }

  render = () => d.html`<div class="flex-1 flex justify-center items-center max-h-screen p-8">${d.portal(() => this.media)}</div>`;
}

export default MediaViewer;
