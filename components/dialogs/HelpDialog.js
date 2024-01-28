import d from '../../other/dominant.js';

class HelpDialog {
  leftCol = {
    'a': 'Add placeholder after current element.',
    'A': 'Add placeholder before current element.',
    'i': 'Add placeholder inside current element (last).',
    'I': 'Add placeholder inside current element (first).',
    'c': 'Copy selected element.',
    'p': 'Paste after current element.',
    'P': 'Paste before current element.',
    'o': 'Paste inside current element (last).',
    'O': 'Paste inside current element (first).',
    '{': 'Change meta tag.',
  };

  rightCol = {
    't': 'Change element text.',
    'T': 'Change multiline element text.',
    'H': 'Change link URL.',
    'm': 'Change element HTML.',
    'M': 'Change element\'s inner HTML.',
    's': 'Change multimedia source URL.',
    'S': 'Select or upload image from gallery.',
    'b': 'Change background image URL.',
    'B': 'Select or upload background image from gallery.',
    'w': 'Wrap element.',
    'W': 'Unwrap element.',
  };

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 rounded text-sm text-white bg-[#262626] shadow-xl">
      <form method="dialog">
        <div class="border-b border-neutral-900">
          <div class="px-3 py-2 flex items-center gap-3">Help</div>
        </div>
        <div class="p-3 grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            ${d.map(() => Object.keys(this.leftCol), x => d.html`
              <div class="flex gap-3 items-center">
                <div class="w-8 h-8 flex justify-center items-center border-neutral-500 rounded border">${x}</div>
                <div>${this.leftCol[x]}</div>
              </div>
            `)}
          </div>
          <div class="flex flex-col gap-1">
            ${d.map(() => Object.keys(this.rightCol), x => d.html`
              <div class="flex gap-3 items-center">
                <div class="w-8 h-8 flex justify-center items-center border-neutral-500 rounded border">${x}</div>
                <div>${this.rightCol[x]}</div>
              </div>
            `)}
          </div>
        </div>
        <div class="border-neutral-900 border-t px-3 py-2 flex gap-2">
          <button class="px-3 py-1 bg-[#4f46e5] rounded flex-1" type="submit">OK</button>
        </div>
      </form>
    </dialog>
  `;
}

export default HelpDialog;
