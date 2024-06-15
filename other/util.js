import rfiles from '../repositories/FilesRepository.js';

function isImage(path) { return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].some(x => path?.endsWith?.(x)) }
function isVideo(path) { return ['.mp4', '.webm', '.ogv', '.mov', '.avi'].some(x => path?.endsWith?.(x)) }
function isAudio(path) { return ['.mp3', '.wav', '.ogg', '.flac', '.m4a'].some(x => path?.endsWith?.(x)) }
function joinPath(path, name) { return [...path?.split?.('/') || [], name].filter(Boolean).join('/') }

async function selectFile(accept) {
  let { promise: p, resolve: res } = Promise.withResolvers();
  let input = d.el('input', { type: 'file', accept, class: 'hidden' });
  input.addEventListener('change', ev => res(input.files[0]));
  top.document.body.append(input);
  input.click();
  input.remove();
  return p;
};

async function showModal(x) {
  let { promise: p, resolve: res } = Promise.withResolvers();
  document.body.append(x);
  x.returnValue = '';
  x.addEventListener('close', () => {
    x.remove();
    res([x.returnValue, ...Array.isArray(x.returnDetail) ? x.returnDetail : [x.returnDetail]]);
  });
  x.showModal();
  return p;
}

class LoadingManager {
  set = new Set();
  add(x) { this.set.add(x) }
  has(x) { this.set.has(x) }
  rm(x) { this.set.delete(x) }
}

let loadman = new LoadingManager();

function clearComponents(x) {
  for (let y of [x, ...x.querySelectorAll('[wf-component]')]) {
    let component = y?.getAttribute?.('wf-component');
    if (!component) { continue }
    y.innerHTML = '';
    for (let z of y.attributes) { z.name !== 'wf-component' && z.name !== 'wf-props' && y.removeAttribute(z.name) }
  }
}

async function setComponents(currentSite, x) {
  let templatesBlob = await rfiles.loadFile(currentSite, 'webfoundry/templates.json');
  let templates = JSON.parse(await templatesBlob.text());
  for (let y of [x, ...x.querySelectorAll('[wf-component]')]) {
    let component = y.getAttribute('wf-component');
    if (!component) { continue }
    let templ = templates[`components/${component}.html`];
    if (!templ) { continue } // FIXME
    let templDoc = new DOMParser().parseFromString(templ, 'text/html');
    let templRoot = templDoc.body.firstElementChild;
    templRoot.setAttribute('wf-component', component);
    let props = y.getAttribute('wf-props');
    props && templRoot.setAttribute('wf-props', props);
    y.replaceWith(templRoot);
  }
}
export { isImage, isVideo, isAudio, joinPath, selectFile, showModal, LoadingManager, loadman, clearComponents, setComponents };
