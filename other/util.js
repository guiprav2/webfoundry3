import d from './dominant.js';
import rfiles from '../repositories/FilesRepository.js';

function isImage(path) { return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].some(x => path?.endsWith?.(x)) }
function isVideo(path) { return ['.mp4', '.webm', '.ogv', '.mov', '.avi'].some(x => path?.endsWith?.(x)) }
function isAudio(path) { return ['.mp3', '.wav', '.ogg', '.flac', '.m4a'].some(x => path?.endsWith?.(x)) }
function joinPath(path, name) { return [...path?.split?.('/') || [], name].filter(Boolean).join('/') }

function formatHtml(x) {
  if (x.trim().startsWith('<body')) {
    let doc = new DOMParser().parseFromString(x, 'text/html');
    return formatNode(doc.body);
  }
  let div = document.createElement('div');
  div.innerHTML = x;
  return [...div.childNodes].map(y => formatNode(y)).filter(Boolean).join('\n');
}

function formatNode(x, lv = 0) {
  let indent = '  '.repeat(lv);

  if (x.nodeType === Node.COMMENT_NODE) {
    let div = document.createElement('div');
    div.append(x.cloneNode());
    if (!div.innerHTML.includes('\n')) { return indent + div.innerHTML }
    let lns = div.innerHTML.slice(4, -3).split('\n').map(y => indent + '  ' + y.trim());
    return [indent + '<!--', ...lns, indent + '-->'].join('\n');
  }

  if (x.nodeType === Node.TEXT_NODE) {
    let div = document.createElement('div');
    div.append(x.cloneNode());
    if (!div.innerHTML.trim()) { return null }
    return div.innerHTML.split('\n').filter(y => y.trim()).map(y => indent + y.trim()).join('\n');
  }

  let selfClosing = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'].includes(x.tagName);
  let openTag = x.cloneNode().outerHTML.replace(/<\/.+>$/, '');
  let closeTag = !selfClosing ? `</${x.tagName.toLowerCase()}>` : '';
  if (x.classList.contains('whitespace-pre') || x.classList.contains('whitespace-pre-wrap')) { return indent + x.outerHTML }
  let children = [...x.childNodes].map(y => formatNode(y, lv + 1));
  if (!children.length) { return indent + openTag + closeTag }
  return [indent + openTag, ...children, closeTag && indent + closeTag].filter(Boolean).join('\n');
}

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
  add(x) { this.set.add(x); d.update() }
  has(x) { return this.set.has(x) }
  rm(x) { this.set.delete(x); d.update() }
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
export { isImage, isVideo, isAudio, joinPath, formatHtml, selectFile, showModal, LoadingManager, loadman, clearComponents, setComponents };
