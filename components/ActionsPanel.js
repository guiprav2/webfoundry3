import d from '../other/dominant.js';

class ActionsPanel {
  render = () => d.html`
    <div class="ActionsPanel flex flex-col bg-[#091017] text-neutral-100 w-96 h-screen border-r border-black/50 p-6 space-y-4 select-none overflow-auto">
      ${d.if(() => state.editor.s, d.html`
        ${d.if(() => state.editor.history.i > 0 || state.editor.history.i < state.editor.history.entries.length - 1, d.html`
          <div>History</div>
          ${d.if(() => state.editor.history.i > 0, d.html`
            <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-z') }}>
              <div>Undo</div>
              <div class="font-mono">Ctrl-z</div>
            </button>
          `)}
          ${d.if(() => state.editor.history.i < state.editor.history.entries.length - 1, d.html`
            <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-y') }}>
              <div>Redo</div>
              <div class="font-mono">Ctrl-y</div>
            </button>
          `)}
        `)}
        <div>Create &amp; Delete</div>
        ${d.if(() => state.editor.s.tagName !== 'BODY', d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'a') }}>
            <div>Create after</div>
            <div class="font-mono">a</div>
          </button>
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'A') }}>
            <div>Create before</div>
            <div class="font-mono">A</div>
          </button>
        `)}
        ${d.if(() => state.editor.s.childNodes.length, d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'i') }}>
            <div>Create inside (last child)</div>
            <div class="font-mono">i</div>
          </button>
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'I') }}>
            <div>Create inside (first child)</div>
            <div class="font-mono">I</div>
          </button>
        `, d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'i') }}>
            <div>Create inside</div>
            <div class="font-mono">i</div>
          </button>
        `)}
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Delete') }}>
          <div>Delete</div>
          <div class="font-mono">Del</div>
        </button>
        <div>Copy &amp; Paste</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'c') }}>
          <div>Copy</div>
          <div class="font-mono">c</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'p') }}>
          <div>Paste after</div>
          <div class="font-mono">p</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'P') }}>
          <div>Paste before</div>
          <div class="font-mono">P</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'o') }}>
          <div>Paste inside (last child)</div>
          <div class="font-mono">o</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'O') }}>
          <div>Paste inside (first child)</div>
          <div class="font-mono">O</div>
        </button>
        <div>Move</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-ArrowUp') }}>
          <div>Move forwards</div>
          <div class="font-mono">Ctrl-↑</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-ArrowDown') }}>
          <div>Move backwards</div>
          <div class="font-mono">Ctrl-↓</div>
        </button>
        <div>HTML</div>
        ${d.if(() => state.editor.s instanceof Set, d.html`
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-u') }}>
            <div>Normalize styles (union)</div>
            <div class="font-mono">Ctrl-u</div>
          </button>
          <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-U') }}>
            <div>Normalize styles (intersection)</div>
            <div class="font-mono">Ctrl-U</div>
          </button>
        `)}
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-I') }}>
          <div>Change ID</div>
          <div class="font-mono">Ctrl-I</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'e') }}>
          <div>Change tag</div>
          <div class="font-mono">e</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'e') }}>
          <div>Change tag</div>
          <div class="font-mono">e</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-p') }}>
          <div>Change placeholder</div>
          <div class="font-mono">Ctrl-p</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-C') }}>
          <div>Change Emmet</div>
          <div class="font-mono">Ctrl-C</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'm') }}>
          <div>Change HTML</div>
          <div class="font-mono">m</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'M') }}>
          <div>Change inner HTML</div>
          <div class="font-mono">M</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'w') }}>
          <div>Wrap</div>
          <div class="font-mono">w</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'W') }}>
          <div>Unwrap</div>
          <div class="font-mono">W</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'x') }}>
          <div>Toggle hidden</div>
          <div class="font-mono">x</div>
        </button>
        <div>Text &amp; Media</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 't') }}>
          <div>Change single line</div>
          <div class="font-mono">t</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'T') }}>
          <div>Change multiline</div>
          <div class="font-mono">T</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'H') }}>
          <div>Change href</div>
          <div class="font-mono">H</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 's') }}>
          <div>Change src</div>
          <div class="font-mono">s</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'b') }}>
          <div>Change background image</div>
          <div class="font-mono">b</div>
        </button>
        <div>JavaScript</div>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-i') }}>
          <div>Set if expression</div>
          <div class="font-mono">Ctrl-i</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-m') }}>
          <div>Set map expression</div>
          <div class="font-mono">Ctrl-m</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-o') }}>
          <div>Set event handlers</div>
          <div class="font-mono">Ctrl-o</div>
        </button>
        <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('editor.kbdAction', 'Ctrl-x') }}>
          <div>Evaluate</div>
          <div class="font-mono">Ctrl-x</div>
        </button>
      `)}
      <div>Import, Export, and Deploy</div>
      <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.importZip') }}>
        <div>Import ZIP</div>
      </button>
      <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.exportZip') }}>
        <div>Export ZIP</div>
      </button>
      <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.exportDesktop') }}>
        <div>Export desktop app</div>
      </button>
      <button class="text-left px-4 py-2 rounded-md bg-black/50 hover:bg-black/70 flex justify-between gap-3 outline-none w-full" ${{ onClick: () => post('app.netlifyDeploy') }}>
        <div>Deploy to Netlify</div>
        ${d.if(() => state.editor.s, d.html`<div class="font-mono">D</div>`)}
      </button>
    </div>
  `;
}

export default ActionsPanel;
