import AppCtrl from './AppCtrl.js';
import DesignerCtrl from './DesignerCtrl.js';
import ImageGalleryCtrl from './ImageGalleryCtrl.js';
import d from '../other/dominant.js';
import debounce from 'https://cdn.skypack.dev/debounce';

let state = {};

let sections = {
  app: new AppCtrl(post),
  designer: new DesignerCtrl(post),
  imageGallery: new ImageGalleryCtrl(state, post),
};

for (let [k, v] of Object.entries(sections)) { state[k] = v.state }

let printSeparator = debounce(() => console.log('---'), 200);

async function post(action, ...args) {
  false && console.log(`${action}${args.length ? ':' : ''}`, ...args.map(x => {
    if (typeof x === 'string') {
      if (x.includes('\n')) { return x.split('\n')[0].slice(0, 100) + '...' }
      return x.length > 100 ? x.slice(0, 100) + '...' : x;
    }
    return x;
  }));
  false && printSeparator();
  let [section, name] = action.split('.');
  let ret = sections[section].actions[name](...args);
  if (ret?.then) { await ret }
  d.update();
}

function useCtrl() { return [state, post] }

export default useCtrl;
