import d from '../other/dominant.js';
import { selectFile } from '../other/util.js';

class TilesPanel {
  constructor(props) { window.tilesPanel = this; this.props = props }

  onLoadTileset = async () => {
    let file = await selectFile('image/*');
    this.tileset = URL.createObjectURL(file);
    d.update();
  };

  onClickTileset = ev => {
    let rect = this.tilesetImg.getBoundingClientRect();
    this.tx = Math.floor((ev.clientX - rect.x) / 32);
    this.ty = Math.floor((ev.clientY - rect.y) / 32);
    this.selector.classList.remove('hidden');
  };

  render = () => d.html`
    <div class="TilesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50 select-none">
      <button class="TilesPanel-loadTilesetBtn outline-none border-b border-black/50 transition-all h-12 text-xl bg-[#0071b2] transition-colors hover:bg-[#008ad9]" ${{
        onClick: () => this.onLoadTileset(),
      }}>
        Load Tileset
      </button>
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
