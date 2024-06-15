import d from '../other/dominant.js';

class Designer {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="Designer flex-1 bg-[#060a0f] flex items-center">
      ${d.if(() => !this.props.loading, d.html`<div class="Designer-padder flex-1"></div>`)}
      <div class="Designer-contents flex flex-col bg-neutral-100" ${{ class: () => this.props.loading && 'hidden', style: { width: () => this.props.width, height: () => this.props.height }  }}>
        ${d.if(() => this.props.preview, d.html`<div class="flex justify-center items-center h-12 border-b border-black/50 bg-[#091017]">Page Preview</div>`)}
        <iframe class="flex-1" ${{ src: () => this.props.src, onLoad: this.props.onLoad }}></iframe>
      </div>
      ${d.if(() => this.props.loading, d.html`
        <div class="flex-1 flex justify-center items-center">
          <svg class="animate-spin w-16 h-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      `, d.html`
        <div class="flex-1 shrink-0 flex items-center px-1">
          <button class="Designer-resizeBtn w-2 rounded-full h-24 bg-neutral-300" ${{ onPointerDown: this.props.onResize }}></button>
        </div>
      `)}
    </div>
  `;
}

export default Designer;
