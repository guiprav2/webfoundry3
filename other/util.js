function joinPath(path, name) { return [...path?.split?.('/') || [], name].filter(Boolean).join('/') }

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
export { joinPath, showModal, LoadingManager, loadman };
