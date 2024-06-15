function isImage(path) { return path.toLowerCase().endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp') || path.endsWith('.svg') }
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
export { isImage, joinPath, selectFile, showModal, LoadingManager, loadman };
