import d from '../other/dominant.js';
import { selectFile } from '../other/util.js';

class TilesPanel {
  constructor(props) { window.tilesPanel = this; this.props = props }

  setTileset = async url => { this.tileset = url; d.update() };

  onClickTileset = ev => {
    let rect = this.tilesetImg.getBoundingClientRect();
    this.tx = Math.floor((ev.clientX - rect.x) / 32);
    this.ty = Math.floor((ev.clientY - rect.y) / 32);
    this.selector.classList.remove('hidden');
  };

  render = () => d.html`
    <div class="TilesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50 select-none">
      <div class="p-8 overflow-auto">
        <div class="relative">
          ${this.selector = d.html`<div class="absolute hidden w-[32px] h-[32px] border border-blue-500 z-10" ${{
            style: { left: () => `${this.tx * 32}px`, top: () => `${this.ty * 32}px` },
          }}>`}
          ${d.if(() => this.tileset, this.tilesetImg = d.html`
            <img class="max-w-auto" ${{ src: () => this.tileset, onClick: this.onClickTileset }}>
          `)}
        </div>
      </div>
    </div>
  `;
}

export default TilesPanel;
