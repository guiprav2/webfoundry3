import d from '../other/dominant.js';

class StylesPanel {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="StylesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50">
      <div class="StylesPanel-styleList flex flex-col gap-2 p-4">
        ${d.map(() => this.props.styles, x => d.html`
          <div class="StylesPanel-style flex items-center gap-3 rounded outline-none py-1 justify-between px-2">
            <div class="flex items-center gap-3">
              <div class="nf p-2 nf-fa-paint_brush"></div>
              <div class="SitesPanel-styleName">${x}</div>
            </div>
            <div class="flex">
              <button class="StylesPanel-editBtn outline-none nf p-2 nf-fa-pencil" ${{ onClick: () => this.props.onEdit(x) }}></button>
              <button class="StylesPanel-deleteBtn outline-none nf p-2 nf-fa-trash" ${{ onClick: () => this.props.onDelete(x) }}></button>
            </div>
          </div>
        `)}
        <div class="StylesPanel-addStyle flex items-center gap-3 rounded outline-none py-1 px-2">
          <div class="nf p-2 nf-fa-plus"></div>
          <input class="StylesPanel-addStyleInput outline-none bg-transparent w-full placeholder:text-inherit" placeholder="add class" ${{ onKeyDown: ev => this.props.onAddStyleKeyDown(ev) }}>
        </div>
      </div>
    </div>
  `;
}

export default StylesPanel;
