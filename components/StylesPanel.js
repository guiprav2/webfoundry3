import d from '../other/dominant.js';

class StylesPanel {
  render = () => d.html`
    <div class="StylesPanel flex flex-col bg-[#091017] text-neutral-100 w-96 border-r border-black/50">
      <div class="StylesPanel-styleList flex flex-col gap-2 p-4 max-h-screen overflow-auto">
        ${d.map(() => state.app.styles, x => d.html`
          <div class="StylesPanel-style flex items-center gap-3 rounded outline-none py-1 justify-between px-2">
            <div class="flex items-center gap-3">
              <div class="nf p-2 nf-fa-paint_brush"></div>
              ${d.if(() => state.app.replacingStyle !== x,
                d.html`<div class="SitesPanel-styleName">${x}</div>`,
                d.html`<input class="w-full outline-none bg-transparent" ${{
                  onAttach: x => { x.select() },
                  onKeyDown: ev => post('app.replaceStyleKeyDown', ev),
                  onBlur: ev => post('app.replaceStyleBlur', ev),
                  value: x,
                }}>`)}
            </div>
            <div class="flex">
              <button class="StylesPanel-editBtn outline-none nf p-2 nf-fa-pencil" ${{ onClick: () => post('app.editStyle', x) }}></button>
              <button class="StylesPanel-deleteBtn outline-none nf p-2 nf-fa-trash" ${{ onClick: () => post('app.deleteStyle', x) }}></button>
            </div>
          </div>
        `)}
        <div class="StylesPanel-addStyle flex items-center gap-3 rounded outline-none py-1 px-2">
          <div class="nf p-2 nf-fa-plus"></div>
          ${this.addStyleInput = d.html`<input class="StylesPanel-addStyleInput outline-none bg-transparent w-full placeholder:text-inherit" placeholder="add class" ${{
            onKeyDown: ev => post('app.addStyleKeyDown', ev),
          }}>`}
          ${d.if(() => this.addStyleInput.value, d.html`
            <button class="StylesPanel-addStyleSubmitBtn nf nf-md-arrow_left_bottom bg-[#0071b2] p-2 relative text-xs -top-1 rounded" ${{ onClick: () => post('app.addStyleSubmit') }}></button>
          `)}
        </div>
      </div>
    </div>
  `;
}

export default StylesPanel;
