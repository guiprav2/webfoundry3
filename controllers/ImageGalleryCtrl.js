import d from '../other/dominant.js';
import rfiles from '../repositories/FilesRepository.js';
import { selectFile } from '../../other/util.js';

class ImageGalleryCtrl {
  state = {
    folders: [],
    currentFolder: null,
    images: [],
    selectedImage: null,
  };

  constructor(gstate, post) { Object.assign(this, { gstate, post }) }

  actions = {
    reset: async () => {
      this.state.folders = [];
      this.state.currentFolder = null;
      this.state.images = [];
      this.state.selectedImage = null;
      d.update();
      this.state.folders = await rfiles.loadFolders(this.gstate.app.currentSite);
      this.post('imageGallery.changeFolder', this.state.folders[0]);
    },

    changeFolder: async x => { this.state.currentFolder = x; this.post('imageGallery.loadImages') },

    loadImages: async () => {
      this.state.images = [];
      d.update();
      this.state.images = await rfiles.loadImages(this.gstate.app.currentSite, this.state.currentFolder);
    },

    selectImage: x => this.state.selectedImage = x,

    upload: async () => {
      let f = await selectFile('image/*');
      await rfiles.saveFile(this.gstate.app.currentSite, [this.state.currentFolder, f.name].filter(Boolean).join('/'), f);
      this.post('imageGallery.loadImages');
      this.post('app.loadFiles');
    },
  };
}

export default ImageGalleryCtrl;
