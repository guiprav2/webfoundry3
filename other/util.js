function makePromise() {
  let res, rej, p = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  return [p, res, rej];
}

async function showModal(x) {
  let [p, res] = makePromise();
  document.body.append(x);
  x.returnValue = '';
  x.addEventListener('close', () => {
    x.remove();
    res([x.returnValue, x.returnDetail]);
  });
  x.showModal();
  return p;
}

async function selectFile(accept) {
  let [p, res] = makePromise();
  let input = d.el('input', { type: 'file', accept, class: 'hidden' });
  input.addEventListener('change', ev => res(input.files[0]));
  top.document.body.append(input);
  input.click();
  input.remove();
  return p;
};

function isImage(path) {
  return path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp') || path.endsWith('.svg');
}

export { makePromise, showModal, selectFile, isImage };