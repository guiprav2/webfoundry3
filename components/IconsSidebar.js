import d from '../other/dominant.js';

class IconsSidebar {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="IconsSidebar flex flex-col border-r border-black/50 select-none" ${{ 'wf-disabled': () => this.props.tourDisable.has('IconsSidebar') }}>
      ${this.renderWfButton()}
      ${this.renderButton('sites', 'nf-fa-sitemap')}
      ${this.renderButton('files', 'nf-fa-folder')}
      ${this.renderButton('actions', 'nf-fa-hand')}
      ${this.renderButton('styles', 'nf-fa-paint_brush')}
      ${this.renderButton('tiles', 'nf-md-checkerboard')}
      ${this.renderButton('play', 'nf-fa-play')}
      ${this.renderButton('pause', 'nf-fa-pause')}
    </div>
  `;

  renderWfButton = () => d.if(() => d.resolve(this.props.enabledIcons.wf), d.html`
    <button class="outline-none nf border-b border-black/50 transition-all text-xl hover:bg-black/70 w-16 h-16 gfont-[Pacifico]" ${{
      class: ['IconsSidebar-wfBtn', () => this.props.currentPanel === 'wf' && 'bg-black/70'],
      onClick: () => this.props.onSelect('wf'),
    }}>wf</button>
  `);

  renderButton = (id, icon) => d.if(() => d.resolve(this.props.enabledIcons[id]), d.html`
    <button class="outline-none nf border-b border-black/50 transition-all text-xl hover:bg-black/70 w-16 h-16" ${{
      class: [`IconsSidebar-${id}Btn`, icon, () => id === this.props.currentPanel && 'bg-black/70'],
      onClick: () => this.props.onSelect(id),
    }}></button>
  `);
}

export default IconsSidebar;
