import Tether from 'https://cdn.skypack.dev/tether';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

class ElementHighlight {
  constructor(padding = 0) {
    this.padding = padding;
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'fixed',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      transition: 'all ease 0.2s',
      zIndex: 2147483004,
    });
    document.body.append(this.overlay);
  }

  target(x, iframe) {
    if (typeof x === 'string') { x = document.querySelector(x) }
    this._target = x;
    this.iframe = iframe;
    this.raf && cancelAnimationFrame(this.raf);
    this.update();
  }

  update() {
    if (!this._target) { this.overlay.style.clipPath = ''; this.raf = requestAnimationFrame(() => this.update()); return }
    let rect = this._target.getBoundingClientRect();
    rect.x -= this.padding;
    rect.width += this.padding * 2;
    rect.y -= this.padding;
    rect.height += this.padding * 2;

    if (this.iframe) {
      let iframeRect = this.iframe.getBoundingClientRect();
      rect.x += iframeRect.x;
      rect.y += iframeRect.y;
    }

    this.overlay.style.clipPath = `polygon(${[
      '0 0',
      '0 100%',
      `${rect.left}px 100%`,
      `${rect.left}px ${rect.top}px`,
      `${rect.right}px ${rect.top}px`,
      `${rect.right}px ${rect.bottom}px`,
      `${rect.left}px ${rect.bottom}px`,
      `${rect.left}px 100%`,
      '100% 100%',
      '100% 0',
    ].join(', ')})`;

    this.raf = requestAnimationFrame(() => this.update());
  }

  reparent(x) { x.append(this.overlay) }

  hide() {
    this.overlay.style.opacity = 0;
    this.overlay.addEventListener('transitionend', () => this.overlay.style.display = 'none', { once: true });
  }

  show() {
    this.overlay.style.display = 'block';
    this.overlay.style.opacity = 0;
    setTimeout(() => this.overlay.style.opacity = 100, 100);
  }

  destroy() { cancelAnimationFrame(this.raf); this.overlay.remove() }
}

function showInstructions(pos, x, parent = document.body) {
  pos = pos || 'bottom';
  let container = d.html`<div style="z-index: 2147483005" class="fixed left-0 right-0 p-6 text-neutral-100 bg-[#0071b2]" ${{ class: `${pos}-0` }}>
    <div class="absolute -left-2.5 top-2 nf nf-cod-triangle_left text-[#0071b2]"></div>
    <button class="absolute right-3 top-3 nf nf-oct-x text-2xl" value="close"></button>
  </div>`;

  if (Array.isArray(x)) { container.append(...x) } else if (x instanceof Node) { container.append(x) } else { container.innerHTML = x }
  parent.append(container);

  let { promise: p, resolve: res } = Promise.withResolvers();
  container.addEventListener('click', ev => {
    let btn = ev.target.closest('button');
    if (!btn) { return }
    container.remove();
    res(btn.value);
  });

  function destroy() { container.remove() }
  return [p, destroy];
}

async function stateFlow(xs) {
  let [k] = Object.keys(xs);
  while (true) {
    k = await xs[k]();
    if (!k) { break }
  }
}

function popInstructions(opt, x) {
  let container = d.html`<div class="relative rounded-md p-6 text-neutral-100 bg-[#0071b2]" style="z-index: 2147483005">
    <div class="absolute -left-2.5 top-2 nf nf-cod-triangle_left text-[#0071b2]"></div>
    <button class="absolute right-3 top-3 nf nf-oct-x text-2xl" value="close"></button>
  </div>`;

  if (Array.isArray(x)) { container.append(...x) } else if (x instanceof Node) { container.append(x) } else { container.innerHTML = x }
  (opt.parent || document.body).append(container);

  let { promise: p, resolve: res } = Promise.withResolvers();
  container.addEventListener('click', ev => {
    let btn = ev.target.closest('button');
    if (!btn) { return }
    container.remove();
    res(btn.value);
    destroy();
  });

  let t = new Tether({
    target: opt.target,
    targetAttachment: opt.targetAttachment || 'top right',
    targetOffset: opt.offset || '10px 20px',
    element: container,
    attachment: opt.attachment || 'top left',
  });

  function destroy() { t.destroy(); container.remove() }
  return [p, destroy];
}

async function runTour() {
  let hl = new ElementHighlight();
  await post('app.selectIcon', 'sites');

  await stateFlow({
    appTabs: async () => {
      await post('app.tourDisable', 'IconsSidebar', 'FilesPanel', 'StylesPanel', 'gloves.preventDefault');
      hl.target('.IconsSidebar');

      let btn = await popInstructions({ target: '.IconsSidebar', offset: '20px 20px' }, d.html`
        <div class="font-bold mb-2">Sidebar</div>
        <div>Here you find the main tabs for Webfoundry.</div>
        <div>Manage sites, files, import/export/deploys, and styles right from here.</div>
        <div>You have not opened a page, so you can't see most buttons yet, but we'll get there!</div>
        <button class="mt-4 rounded-md border border-white mt-4 px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="next">Next</button>
      `)[0];

      if (btn === 'close') { return 'abort' }
      return 'createSite';
    },

    createSite: async () => {
      hl.target('.SitesPanel-createBtn');

      let [p, destroy] = popInstructions({ target: '.SitesPanel-createBtn', offset: '10px 20px' }, d.html`
        <div class="font-bold mb-2">Create site</div>
        Click the Create button to create your first website!
      `);

      let { promise: p2, resolve: res2 } = Promise.withResolvers();
      document.querySelector('.SitesPanel-createBtn').addEventListener('click', res2, { once: true });
      if (await Promise.race([p, p2]) === 'close') { return 'abort' }
      destroy();
      return 'createSiteDialog';
    },

    createSiteDialog: async () => {
      await post('app.tourDisable', 'cancelBtns');
      hl.hide();
      let { promise: p, resolve: res } = Promise.withResolvers();
      let dialog = document.querySelector('dialog');
      dialog.addEventListener('submit', res, { once: true });
      dialog.addEventListener('close', res, { once: true });
      let ev = await p;
      hl.show();
      await post('app.tourEnable', 'cancelBtns');
      if (ev.submitter?.value !== 'ok') { return 'abort' }
      let { promise: p2, resolve: res2 } = Promise.withResolvers();
      function frame() {
        if (document.querySelector('.FilesPanel')) { res2(); return }
        requestAnimationFrame(frame);
      }
      frame();
      await p2;
      return 'filesTab';
    },

    filesTab: async () => {
      hl.target('.FilesPanel-fileList');

      let btn = await popInstructions({ target: '.FilesPanel-fileList' }, d.html`
        <div>
          <div class="font-bold mb-2">Files tab</div>
          <div>You're now in the <span class="font-bold">Files tab</span>.</div>
          <div>In this tab you can manage your files.</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="next">Next</button>
      `)[0];

      if (btn === 'close') { return 'abort' }
      return 'firstPage';
    },

    firstPage: async () => {
      hl.padding = 10;
      hl.target('.FilesPanel-indexHtml');

      let btn = await popInstructions({ target: '.FilesPanel-indexHtml', offset: '5px 20px' }, d.html`
        <div>
          <div class="font-bold mb-2">Your first page</div>
          <div>We've automatically created an <span class="font-bold">index.html</span> page for you.</div>
          <div>If you create new pages, they'll show right next to it.</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="next">Next</button>
      `)[0];

      hl.padding = 0;
      if (btn === 'close') { return 'abort' }
      return 'firstLooks';
    },

    firstLooks: async () => {
      hl.target('.Designer');

      let btn = await showInstructions('bottom', d.html`
        <div>
          <div class="font-bold mb-2">First look at your new page</div>
          <div>You've now entered Webfoundry's visual HTML editor, also known as the <span class="font-bold">Designer</span>.</div>
          <div>Here you can click to select elements, use <span class="font-bold">up/down arrows</span> to move between siblings, <span class="font-bold">left/right arrows</span> to move between parent/children, and use the <span class="font-bold">context menu</span> to manipulate them.</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="next">Next</button>
      `)[0];

      if (btn === 'close') { return 'abort' }
      return 'selectPlaceholder';
    },

    selectPlaceholder: async () => {
      let iframe = document.querySelector('.Designer iframe');
      let h2 = iframe.contentDocument.querySelector('h2');
      hl.padding = 10;
      hl.target(h2, iframe);

      let [p, destroy] = showInstructions('bottom', d.html`
        <div>
          <div class="font-bold mb-2">Select My Awesome Weather App heading</div>
          <div>By default, Webfoundry creates a demo app for you.</div>
          <div>Click the &lt;h2&gt; to select it.</div>
        </div>
      `);

      let { promise: p2, resolve: res2 } = Promise.withResolvers();
      h2.addEventListener('click', res2, { once: true });
      if (await Promise.race([p, p2]) === 'close') { return 'abort' }
      destroy();
      hl.padding = 0;
      return 'styleList';
    },

    styleList: async () => {
      hl.target('.StylesPanel-styleList');

      let btn = await popInstructions({ target: '.StylesPanel-styleList' }, d.html`
        <div>
          <div class="font-bold mb-2">Style list</div>
          <div>Find here all CSS classes applied to the currently selected element.</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="next">Next</button>
      `)[0];

      if (btn === 'close') { return 'abort' }
      return 'preview';
    },

    preview: async () => {
      await post('app.tourEnable', 'IconsSidebar');
      hl.show();
      hl.target('.IconsSidebar-playBtn');

      let [p, destroy] = popInstructions({ target: '.IconsSidebar-playBtn', offset: '20px 20px' }, d.html`
        <div class="font-bold mb-2">Preview page</div>
        <div>Click the play icon to preview your page inside the editor.</div>
      `);

      let { promise: p2, resolve: res2 } = Promise.withResolvers();
      document.querySelector('.IconsSidebar-playBtn').addEventListener('click', res2, { once: true });
      if (await Promise.race([p, p2]) === 'close') { return 'abort' }
      destroy();
      await post('app.tourDisable', 'IconsSidebar');
      return 'insidePreview';
    },

    insidePreview: async () => {
      hl.target('.Designer');

      let btn = await showInstructions('bottom', d.html`
        <div>
          <div class="font-bold mb-2">Preview page</div>
          <div>This is what your page would look like to an end-user.</div>
          <div>Try typing a city name and hitting Search.</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="next">Next</button>
      `)[0];

      if (btn === 'close') { return 'abort' }
      return 'stopPreview';
    },

    stopPreview: async () => {
      await post('app.tourEnable', 'IconsSidebar');
      hl.target('.IconsSidebar-pauseBtn');

      let [p, destroy] = popInstructions({ target: '.IconsSidebar-pauseBtn' }, d.html`
        <div class="font-bold mb-2">Stop preview</div>
        <div>Click the pause icon to go back to edit mode.</div>
      `);

      let { promise: p2, resolve: res2 } = Promise.withResolvers();
      document.querySelector('.IconsSidebar-pauseBtn').addEventListener('click', res2, { once: true });
      if (await Promise.race([p, p2]) === 'close') { return 'abort' }
      destroy();
      await post('app.tourDisable', 'IconsSidebar');
      return 'finish';
    },

    finish: async () => {
      await post('app.clearTourDisable');
      hl.hide();
      hl.target(null);
      confetti();

      await showInstructions('bottom', d.html`
        <div>
          <div class="font-bold mb-2">Finish!</div>
          <div>You have finished the tutorial.</div>
          <div>Contact us via Intercom on the bottom-right corner if you need any help. We usually reply within a minute.</div>
          <div>Happy coding!</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="close">Close</button>
      `);
    },

    abort: async () => {
      await post('app.clearTourDisable');
      hl.hide();

      await showInstructions('bottom', d.html`
        <div>
          <div class="font-bold mb-2">Tour aborted</div>
          <div>Refresh the page and click Start Tour if you need to take the tour again.</div>
          <div>Happy coding!</div>
        </div>
        <button class="mt-4 rounded-md border border-white px-4 py-2 hover:text-neutral-700 hover:bg-white transition-colors" value="close">Close</button>
      `)[0];
    },
  });

  hl.destroy();
}

export { ElementHighlight, showInstructions, stateFlow, runTour };
