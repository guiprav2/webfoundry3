import d from '../other/dominant.js';

class ActionsPanel {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="ActionsPanel flex flex-col bg-[#091017] text-neutral-100 w-96 h-screen border-r border-black/50 p-6 space-y-4 select-none overflow-auto">
      ${d.if(() => state.app.s, d.html`
        ${d.if(() => state.app.history.i > 0 || state.app.history.i < state.app.history.entries.length - 1, d.html`
          <div>History</div>
          ${d.if(() => state.app.history.i > 0, d.html`
            <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-z') }}>
              <div>Undo</div>
              <div class="font-mono">Ctrl-z</div>
            </button>
          `)}
          ${d.if(() => state.app.history.i < state.app.history.entries.length - 1, d.html`
            <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-y') }}>
              <div>Redo</div>
              <div class="font-mono">Ctrl-y</div>
            </button>
          `)}
        `)}
        <div>Create &amp; Delete</div>
        ${d.if(() => state.app.s.tagName !== 'BODY', d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'a') }}>
            <div>Create after</div>
            <div class="font-mono">a</div>
          </button>
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'A') }}>
            <div>Create before</div>
            <div class="font-mono">A</div>
          </button>
        `)}
        ${d.if(() => state.app.s.childNodes.length, d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'i') }}>
            <div>Create inside (last child)</div>
            <div class="font-mono">i</div>
          </button>
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'I') }}>
            <div>Create inside (first child)</div>
            <div class="font-mono">I</div>
          </button>
        `, d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'i') }}>
            <div>Create inside</div>
            <div class="font-mono">i</div>
          </button>
        `)}
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Delete') }}>
          <div>Delete</div>
          <div class="font-mono">Del</div>
        </button>
        <div>Copy &amp; Paste</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'c') }}>
          <div>Copy</div>
          <div class="font-mono">c</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'p') }}>
          <div>Paste after</div>
          <div class="font-mono">p</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'P') }}>
          <div>Paste before</div>
          <div class="font-mono">P</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'o') }}>
          <div>Paste inside (last child)</div>
          <div class="font-mono">o</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'O') }}>
          <div>Paste inside (first child)</div>
          <div class="font-mono">O</div>
        </button>
        <div>Move</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-ArrowUp') }}>
          <div>Move forwards</div>
          <div class="font-mono">Ctrl-↑</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-ArrowDown') }}>
          <div>Move backwards</div>
          <div class="font-mono">Ctrl-↓</div>
        </button>
        <div>HTML</div>
        ${d.if(() => state.app.s instanceof Set, d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-u') }}>
            <div>Normalize styles (union)</div>
            <div class="font-mono">Ctrl-u</div>
          </button>
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-U') }}>
            <div>Normalize styles (intersection)</div>
            <div class="font-mono">Ctrl-U</div>
          </button>
        `)}
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'e') }}>
          <div>Change tag</div>
          <div class="font-mono">e</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'e') }}>
          <div>Change tag</div>
          <div class="font-mono">e</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-p') }}>
          <div>Change placeholder</div>
          <div class="font-mono">Ctrl-p</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-C') }}>
          <div>Change Emmet</div>
          <div class="font-mono">Ctrl-C</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'm') }}>
          <div>Change HTML</div>
          <div class="font-mono">m</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'M') }}>
          <div>Change inner HTML</div>
          <div class="font-mono">M</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'w') }}>
          <div>Wrap</div>
          <div class="font-mono">w</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'W') }}>
          <div>Unwrap</div>
          <div class="font-mono">W</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'x') }}>
          <div>Toggle hidden</div>
          <div class="font-mono">x</div>
        </button>
        <div>Text &amp; Media</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 't') }}>
          <div>Change single line</div>
          <div class="font-mono">t</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'T') }}>
          <div>Change multiline</div>
          <div class="font-mono">T</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'H') }}>
          <div>Change href</div>
          <div class="font-mono">H</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 's') }}>
          <div>Change src</div>
          <div class="font-mono">s</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'b') }}>
          <div>Change background image</div>
          <div class="font-mono">b</div>
        </button>
        <div>JavaScript</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-i') }}>
          <div>Set if expression</div>
          <div class="font-mono">Ctrl-i</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-m') }}>
          <div>Set map expression</div>
          <div class="font-mono">Ctrl-m</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-o') }}>
          <div>Set event handlers</div>
          <div class="font-mono">Ctrl-o</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.editorAction', 'Ctrl-x') }}>
          <div>Evaluate</div>
          <div class="font-mono">Ctrl-x</div>
        </button>
      `)}
      <div>Deploy</div>
      <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.netlifyDeploy') }}>
        <div>Deploy to Netlify</div>
        ${d.if(() => state.app.s, d.html`<div class="font-mono">D</div>`)}
      </button>
    </div>
  `;
}

export default ActionsPanel;
