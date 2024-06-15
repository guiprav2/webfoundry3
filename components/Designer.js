import d from '../other/dominant.js';

class Designer {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="Designer flex-1 bg-[#060a0f] flex items-center">
      <div class="Designer-padder flex-1"></div>
      <div class="Designer-contents hidden flex flex-col bg-neutral-100" ${{ style: { width: () => this.props.width, height: () => this.props.height }  }}>
        ${d.if(() => this.props.preview, d.html`<div class="flex justify-center items-center h-12 border-b border-black/50 bg-[#091017]">Page Preview</div>`)}
        <iframe class="flex-1" ${{ src: () => this.props.src, onLoad: this.props.onLoad }}></iframe>
      </div>
      <div class="flex-1 shrink-0 flex items-center px-1">
        <button class="Designer-resizeBtn w-2 rounded-full h-24 bg-neutral-300" ${{ onPointerDown: this.props.onResize }}></button>
      </div>
    </div>
  `;
}

export default Designer;
