import d from '../other/dominant.js';
import { isImage, isVideo, isAudio } from '../other/util.js';

class MediaViewer {
  constructor() {
    d.effect(() => state.app.currentFile, x => {
      this.media = d.el(this.tagName || 'div', {
        class: 'max-w-full max-h-full',
        src: () => this.tagName ? `/files/${state.app.currentSite}/${state.app.currentFile}` : '',
      });
    });
  }

  get tagName() {
    let { currentFile } = state.app;
    if (isImage(currentFile)) { return 'img' }
    if (isVideo(currentFile)) { return 'video' }
    if (isAudio(currentFile)) { return 'audio' }
  }

  render = () => d.html`<div class="flex-1 flex justify-center items-center max-h-screen p-8">${d.portal(() => this.media)}</div>`;
}

export default MediaViewer;
