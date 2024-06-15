import d from '../other/dominant.js';

class DesignerContextMenu {
  activeSubmenus = [];
  bp = 'none';
  sts = [];

  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="flex items-start text-neutral-900 gap-1">
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('el', 'Elements')}
        ${d.if(() => state.app.history.i > 0 || state.app.history.i < state.app.history.entries.length - 1, this.renderSubMenuOption('history', 'History'))}
        ${this.renderSubMenuOption('html', 'HTML')}
        ${this.renderSubMenuOption('textMedia', 'Text & Media')}
        ${this.renderSubMenuOption('styles', 'Styles')}
        ${this.renderSubMenuOption('js', 'JavaScript')}
      </div>
      ${d.map(() => this.activeSubmenus, x => this.renderSubmenus[x]())}
    </div>
  `;

  renderSubmenus = {
    el: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${d.if(() => state.app.s.tagName !== 'BODY', d.html`
          ${this.renderActionBtn('Create after', 'a')}
          ${this.renderActionBtn('Create before', 'A')}
        `)}
        ${this.renderActionBtn('Create last child', 'i')}
        ${this.renderActionBtn('Create first child', 'I')}
        <div class="border-b border-neutral-200"></div>
        ${this.renderActionBtn('Copy', 'c')}
        ${this.renderActionBtn('Paste (after)', 'p')}
        ${this.renderActionBtn('Paste (before)', 'P')}
        ${this.renderActionBtn('Paste (last child)', 'o')}
        ${this.renderActionBtn('Paste (first child)', 'O')}
        <div class="border-b border-neutral-200"></div>
        ${this.renderActionBtn('Delete & Copy', 'd')}
        <div class="border-b border-neutral-200"></div>
        ${this.renderActionBtn('Set component', 'Ctrl-c')}
      </div>
    `,

    history: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${d.if(() => state.app.history.i > 0, this.renderActionBtn('Undo', 'Ctrl-z'))}
        ${d.if(() => state.app.history.i < state.app.history.entries.length - 1, this.renderActionBtn('Redo', 'Ctrl-y'))}
      </div>
    `,

    html: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderActionBtn('Change meta', '{')}
        ${d.if(() => state.app.s.tagName !== 'BODY', d.html`
          ${this.renderActionBtn('Wrap', 'w')}
          ${this.renderActionBtn('Unwrap', 'W')}
          ${this.renderActionBtn('Change tag', 'e')}
        `)}
        ${this.renderActionBtn('Change placeholder', 'Ctrl-p')}
        ${this.renderActionBtn('Change HTML', 'm')}
        ${this.renderActionBtn('Change inner HTML', 'M')}
        ${d.if(() => state.app.s.tagName !== 'BODY', this.renderActionBtn('Toggle hidden', 'x'))}
      </div>
    `,

    textMedia: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderActionBtn('Change single line', 't')}
        ${this.renderActionBtn('Change multiline', 'T')}
        ${this.renderActionBtn('Change href', 'H')}
        ${this.renderActionBtn('Change src', 's')}
        ${this.renderActionBtn('Change background image', 'b')}
        ${this.renderActionBtn('Change src (upload)', 'S')}
        ${this.renderActionBtn('Change background image (upload)', 'B')}
        ${this.renderActionBtn('Toggle dark mode', 'Ctrl-d')}
      </div>
    `,

    styles: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('breakpoints', 'Breakpoints', 1)}
        ${this.renderSubMenuOption('states', 'States', 1)}
        ${this.renderSubMenuOption('pseudoClasses', 'Pseudo-Classes', 1)}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSubMenuOption('basicStyles', 'Basic', 1)}
        ${this.renderSubMenuOption('spacingStyles', 'Spacing', 1)}
        ${this.renderSubMenuOption('borderStyles', 'Border & Outline', 1)}
        ${this.renderSubMenuOption('otherStyles', 'Other', 1)}
      </div>
    `,

    breakpoints: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderStateOption('portrait')}
        ${this.renderStateOption('landscape')}
        ${this.renderStateOption('print')}
        ${this.renderBreakpointOptions(['none', 'sm', 'md', 'lg', 'xl', '2xl'])}
      </div>
    `,

    states: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderStateOption('dark')}
        ${this.renderStateOption('motion-reduce')}
        ${this.renderStateOption('contrast-more')}
        ${this.renderStateOption('forced-colors')}
        ${this.renderStateOption('hover')}
        ${this.renderStateOption('group-hover')}
        ${this.renderStateOption('active')}
        ${this.renderStateOption('visited')}
        ${this.renderStateOption('focus-within')}
        ${this.renderStateOption('focus-visible')}
        ${this.renderStateOption('disabled')}
        ${this.renderStateOption('required')}
        ${this.renderStateOption('invalid')}
      </div>
    `,

    pseudoClasses: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderStateOption('placeholder')}
        ${this.renderStateOption('marker')}
        ${this.renderStateOption('backdrop')}
        ${this.renderStateOption('first')}
        ${this.renderStateOption('last')}
        ${this.renderStateOption('odd')}
        ${this.renderStateOption('even')}
        ${this.renderStateOption('first-line')}
        ${this.renderStateOption('first-letter')}
      </div>
    `,

    basicStyles: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('typography', 'Typography', 2)}
        ${this.renderSubMenuOption('flex', 'Flexbox', 2)}
        ${this.renderSubMenuOption('grid', 'Grid', 2)}
        ${this.renderSubMenuOption('position', 'Position', 2)}
        ${this.renderSubMenuOption('dimensions', 'Dimensions', 2)}
        ${this.renderSubMenuOption('overflow', 'Overflow', 2)}
      </div>
    `,

    spacingStyles: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('margin', 'Margin', 2)}
        ${this.renderSubMenuOption('spaceBetween', 'Space Between', 2)}
        ${this.renderSubMenuOption('padding', 'Padding', 2)}
      </div>
    `,

    borderStyles: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('ring', 'Ring', 2)}
        ${this.renderSubMenuOption('outline', 'Outline', 2)}
        ${this.renderSubMenuOption('border', 'Border', 2)}
        ${this.renderSubMenuOption('divide', 'Divide', 2)}
      </div>
    `,

    otherStyles: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('accessibility', 'Accessibility', 2)}
        ${this.renderSubMenuOption('float', 'Float & Clear', 2)}
        ${this.renderSubMenuOption('bg', 'Background', 2)}
        ${this.renderSubMenuOption('svg', 'SVG', 2)}
        ${this.renderSubMenuOption('tables', 'Tables', 2)}
        ${this.renderSubMenuOption('transitionsAndAnim', 'Transitions & Animation', 2)}
        ${this.renderSubMenuOption('transforms', 'Transforms', 2)}
        ${this.renderSubMenuOption('fx', 'Effects', 2)}
        ${this.renderSubMenuOption('filters', 'Filters', 2)}
        ${this.renderSubMenuOption('interactivity', 'Interactivity', 2)}
        ${this.renderSubMenuOption('aspect', 'Aspect Ratio', 2)}
        ${this.renderSubMenuOption('columns', 'Columns', 2)}
        ${this.renderSubMenuOption('object', 'Object Fit/Position', 2)}
        ${this.renderSubMenuOption('visibility', 'Visibility', 2)}
        ${this.renderSubMenuOption('z', 'Z-Index', 2)}
      </div>
    `,

    typography: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['font-serif', 'font-sans', 'font-mono'])}
        ${this.renderSelectOption(['text-xs', 'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'])}
        ${this.renderSelectOption(['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'])}
        ${this.renderSelectOption(['italic', 'not-italic'])}
        ${this.renderSelectOption(colorPrefixes('text'))}
        ${this.renderSelectOption(['tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest'])}
        ${this.renderSelectOption(['line-clamp-none', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3', 'line-clamp-4', 'line-clamp-5', 'line-clamp-6'])}
        ${this.renderSelectOption(['leading-none', 'leading-3', 'leading-4', 'leading-5', 'leading-6', 'leading-7', 'leading-8', 'leading-9', 'leading-10', 'leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose'])}
        ${this.renderSelectOption(['text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end'])}
        ${this.renderSelectOption(['text-nowrap', 'text-wrap', 'text-balance', 'text-pretty'])}
        ${this.renderSelectOption(['align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom', 'align-sub', 'align-super'])}
        ${this.renderSelectOption(['whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap', 'whitespace-break-spaces'])}
        ${this.renderSelectOption(['break-normal', 'break-words', 'break-all', 'break-keep'])}
        ${this.renderSelectOption(['hyphens-none', 'hyphens-manual', 'hyphens-auto'])}
        ${this.renderSelectOption(defaultScalePrefixes('indent'))}
        ${this.renderSelectOption(['underline', 'overline', 'line-through', 'no-underline'])}
        ${this.renderSelectOption(['decoration-solid', 'decoration-double', 'decoration-dotted', 'decoration-dashed', 'decoration-wavy'])}
        ${this.renderSelectOption(['decoration-auto', 'decoration-from-font', 'decoration-0', 'decoration-1', 'decoration-2', 'decoration-3', 'decoration-4', 'decoration-5', 'decoration-6', 'decoration-7', 'decoration-8'])}
        ${this.renderSelectOption(['underline-offset-auto', 'underline-offset-0', 'underline-offset-1', 'underline-offset-2', 'underline-offset-4', 'underline-offset-8'])}
        ${this.renderSelectOption(['truncate', 'text-ellipsis', 'text-clip'])}
        ${this.renderSelectOption(['normal-case', 'uppercase', 'lowercase', 'capitalize'])}
        ${this.renderSelectOption(['list-outside', 'list-inside'])}
        ${this.renderSelectOption(['list-none', 'list-disc', 'list-decimal'])}
        ${this.renderSelectOption(['antialiased', 'subpixel-antialiased'])}
        ${this.renderSelectOption(['normal-nums', 'ordinal', 'slashed-zero', 'lining-nums', 'oldstyle-nums', 'proportional-nums', 'tabular-nums', 'diagonal-fractions', 'stacked-fractions'])}
      </div>
    `,

    flex: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['flex'])}
        ${this.renderSelectOption(['flex-row', 'flex-col'])}
        ${this.renderSelectOption(['justify-start', 'justify-center', 'justify-between', 'justify-around', 'justify-end'])}
        ${this.renderSelectOption(['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'])}
        ${this.renderSelectOption(['content-normal', 'content-start', 'content-end', 'content-center', 'content-between', 'content-around', 'content-evenly', 'content-baseline', 'content-stretch'])}
        ${this.renderSelectOption(['self-auto', 'self-start', 'self-end', 'self-center', 'self-baseline', 'self-stretch'])}
        ${this.renderSelectOption(['flex-wrap', 'flex-wrap-reverse', 'flex-nowrap'])}
        ${this.renderSelectOption(['flex-1', 'flex-auto', 'flex-initial', 'flex-none'])}
        ${this.renderSelectOption(['order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-6', 'order-7', 'order-8', 'order-9', 'order-10', 'order-11', 'order-12', 'order-first', 'order-last', 'order-none'])}
        ${this.renderSelectOption(defaultScalePrefixes('gap'))}
        ${this.renderSelectOption(defaultScalePrefixes('gap-x'))}
        ${this.renderSelectOption(defaultScalePrefixes('gap-y'))}
      </div>
    `,

    grid: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['grid'])}
        ${this.renderSelectOption(['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12'])}
      </div>
    `,

    templ: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSubMenuOption('templLayouts', 'Layouts', 1)}
        ${this.renderSubMenuOption('templComponents', 'Components', 1)}
      </div>
    `,

    position: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['relative', 'absolute', 'fixed', 'sticky'])}
        ${this.renderSelectOption(['left-0', 'left-1', 'left-2', 'left-3', 'left-4', 'left-5', 'left-6', 'left-7', 'left-8', 'left-9', 'left-10'])}
        ${this.renderSelectOption(['right-0', 'right-1', 'right-2', 'right-3', 'right-4', 'right-5', 'right-6', 'right-7', 'right-8', 'right-9', 'right-10'])}
        ${this.renderSelectOption(['top-0', 'top-1', 'top-2', 'top-3', 'top-4', 'top-5', 'top-6', 'top-7', 'top-8', 'top-9', 'top-10'])}
        ${this.renderSelectOption(['bottom-0', 'bottom-1', 'bottom-2', 'bottom-3', 'bottom-4', 'bottom-5', 'bottom-6', 'bottom-7', 'bottom-8', 'bottom-9', 'bottom-10'])}
      </div>
    `,

    accessibility: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['not-sr-only', 'sr-only'])}
        ${this.renderSelectOption(['forced-color-adjust-auto', 'forced-color-adjust-none'])}
      </div>
    `,

    float: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['float-none', 'float-left', 'float-right'])}
        ${this.renderSelectOption(['clear-none', 'clear-both', 'clear-left', 'clear-right'])}
      </div>
    `,

    overflow: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['overflow-scroll', 'overflow-hidden', 'overflow-clip', 'overflow-x-scroll', 'overflow-x-hidden', 'overflow-x-clip', 'overflow-y-scroll', 'overflow-y-hidden', 'overflow-y-clip'])}
      </div>
    `,

    dimensions: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['w-auto', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit'])}
        ${this.renderSelectOption(defaultScalePrefixes('w'))}
        ${this.renderSelectOption(['w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-2/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-1/6', 'w-2/6', 'w-3/6', 'w-4/6', 'w-5/6'])}
        ${this.renderSelectOption(['min-w-full', 'min-w-screen', 'min-w-min', 'min-w-max', 'min-w-fit'])}
        ${this.renderSelectOption(defaultScalePrefixes('min-w'))}
        ${this.renderSelectOption(['max-w-full', 'max-w-screen', 'max-w-max', 'max-w-max', 'max-w-fit'])}
        ${this.renderSelectOption(defaultScalePrefixes('max-w'))}
        ${this.renderSelectOption(['max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['h-auto', 'h-full', 'h-screen', 'h-min', 'h-max', 'h-fit'])}
        ${this.renderSelectOption(defaultScalePrefixes('h'))}
        ${this.renderSelectOption(['h-1/2', 'h-1/3', 'h-2/3', 'h-1/4', 'h-2/4', 'h-3/4', 'h-1/5', 'h-2/5', 'h-3/5', 'h-4/5', 'h-1/6', 'h-2/6', 'h-3/6', 'h-4/6', 'h-5/6'])}
        ${this.renderSelectOption(['min-h-full', 'min-h-screen', 'min-h-min', 'min-h-max', 'min-h-fit'])}
        ${this.renderSelectOption(defaultScalePrefixes('min-h'))}
        ${this.renderSelectOption(['max-h-full', 'max-h-screen', 'max-h-max', 'max-h-max', 'max-h-fit'])}
        ${this.renderSelectOption(defaultScalePrefixes('max-h'))}
      </div>
    `,

    margin: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(defaultScalePrefixes('m'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['mx-auto', ...defaultScalePrefixes('mx')])}
        ${this.renderSelectOption(defaultScalePrefixes('my'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['ml-auto', ...defaultScalePrefixes('ml')])}
        ${this.renderSelectOption(['mr-auto', ...defaultScalePrefixes('mr')])}
        ${this.renderSelectOption(defaultScalePrefixes('mt'))}
        ${this.renderSelectOption(defaultScalePrefixes('mb'))}
      </div>
    `,

    spaceBetween: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(defaultScalePrefixes('scale-x'))}
        ${this.renderSelectOption(defaultScalePrefixes('scale-y'))}
      </div>
    `,

    ring: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['ring', 'ring-0', 'ring-1', 'ring-2', 'ring-4', 'ring-8', 'ring-inset'])}
        ${this.renderSelectOption(colorPrefixes('ring'))}
        ${this.renderSelectOption(['ring-offset-0', 'ring-offset-1', 'ring-offset-2', 'ring-offset-4', 'ring-offset-8'])}
        ${this.renderSelectOption(colorPrefixes('ring-offset'))}
      </div>
    `,

    outline: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['outline-none', 'outline', 'outline-dashed', 'outline-dotted', 'outline-double'])}
        ${this.renderSelectOption(['outline-0', 'outline-1', 'outline-2', 'outline-4', 'outline-8'])}
        ${this.renderSelectOption(['outline-offset-0', 'outline-offset-1', 'outline-offset-2', 'outline-offset-4', 'outline-offset-8'])}
        ${this.renderSelectOption(colorPrefixes('outline'))}
      </div>
    `,

    border: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['border', 'border-0', 'border-2', 'border-4', 'border-8'])}
        ${this.renderSelectOption(['border-x', 'border-x-0', 'border-x-2', 'border-x-4', 'border-x-8'])}
        ${this.renderSelectOption(['border-y', 'border-y-0', 'border-y-2', 'border-y-4', 'border-y-8'])}
        ${this.renderSelectOption(['border-l', 'border-l-0', 'border-l-2', 'border-l-4', 'border-l-8'])}
        ${this.renderSelectOption(['border-r', 'border-r-0', 'border-r-2', 'border-r-4', 'border-r-8'])}
        ${this.renderSelectOption(['border-t', 'border-t-0', 'border-t-2', 'border-t-4', 'border-t-8'])}
        ${this.renderSelectOption(['border-b', 'border-b-0', 'border-b-2', 'border-b-4', 'border-b-8'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(colorPrefixes('border'))}
        ${this.renderSelectOption(colorPrefixes('border-x'))}
        ${this.renderSelectOption(colorPrefixes('border-y'))}
        ${this.renderSelectOption(colorPrefixes('border-l'))}
        ${this.renderSelectOption(colorPrefixes('border-r'))}
        ${this.renderSelectOption(colorPrefixes('border-t'))}
        ${this.renderSelectOption(colorPrefixes('border-b'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['border-none', 'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full'])}
        ${this.renderSelectOption(['rounded-tl-none', 'rounded-tl-sm', 'rounded-tl', 'rounded-tl-md', 'rounded-tl-lg', 'rounded-tl-xl', 'rounded-tl-2xl', 'rounded-tl-3xl', 'rounded-tl-full'])}
        ${this.renderSelectOption(['rounded-tr-none', 'rounded-tr-sm', 'rounded-tr', 'rounded-tr-md', 'rounded-tr-lg', 'rounded-tr-xl', 'rounded-tr-2xl', 'rounded-tr-3xl', 'rounded-tr-full'])}
        ${this.renderSelectOption(['rounded-bl-none', 'rounded-bl-sm', 'rounded-bl', 'rounded-bl-md', 'rounded-bl-lg', 'rounded-bl-xl', 'rounded-bl-2xl', 'rounded-bl-3xl', 'rounded-bl-full'])}
        ${this.renderSelectOption(['rounded-br-none', 'rounded-br-sm', 'rounded-br', 'rounded-br-md', 'rounded-br-lg', 'rounded-br-xl', 'rounded-br-2xl', 'rounded-br-3xl', 'rounded-br-full'])}
      </div>
    `,

    divide: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['divide-x', 'divide-x-0', 'divide-x-2', 'divide-x-4', 'divide-x-8'])}
        ${this.renderSelectOption(['divide-y', 'divide-y-0', 'divide-y-2', 'divide-y-4', 'divide-y-8'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(colorPrefixes('divide'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['divide-none', 'divide-solid', 'divide-dashed', 'divide-dotted', 'divide-double'])}
      </div>
    `,

    padding: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(defaultScalePrefixes('p'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(defaultScalePrefixes('px'))}
        ${this.renderSelectOption(defaultScalePrefixes('py'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(defaultScalePrefixes('pl'))}
        ${this.renderSelectOption(defaultScalePrefixes('pr'))}
        ${this.renderSelectOption(defaultScalePrefixes('pt'))}
        ${this.renderSelectOption(defaultScalePrefixes('pb'))}
      </div>
    `,

    bg: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(colorPrefixes('bg'))}
        ${this.renderSelectOption(['bg-fixed', 'bg-local', 'bg-scroll'])}
        ${this.renderSelectOption(['bg-clip-border', 'bg-clip-padding', 'bg-clip-content', 'bg-clip-text'])}
        ${this.renderSelectOption(['bg-origin-border', 'bg-origin-padding', 'bg-origin-content'])}
        ${this.renderSelectOption(['bg-bottom', 'bg-center', 'bg-left', 'bg-left-bottom', 'bg-left-top', 'bg-right', 'bg-right-bottom', 'bg-right-top', 'bg-top'])}
        ${this.renderSelectOption(['bg-repeat', 'bg-no-repeat', 'bg-repeat-x', 'bg-repeat-y', 'bg-repeat-round', 'bg-repeat-space'])}
        ${this.renderSelectOption(['bg-auto', 'bg-cover', 'bg-contain'])}
        ${this.renderSelectOption(['bg-none', 'bg-gradient-to-t', 'bg-gradient-to-tr', 'bg-gradient-to-r', 'bg-gradient-to-br', 'bg-gradient-to-b', 'bg-gradient-to-bl', 'bg-gradient-to-l', 'bg-gradient-to-tl'])}
      </div>
    `,

    svg: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(colorPrefixes('fill'))}
        ${this.renderSelectOption(colorPrefixes('stroke'))}
        ${this.renderSelectOption(['stroke-0', 'stroke-1', 'stroke-2'])}
      </div>
    `,

    tables: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['border-collapse', 'border-separate'])}
        ${this.renderSelectOption(defaultScalePrefixes('border-spacing'))}
        ${this.renderSelectOption(defaultScalePrefixes('border-spacing-x'))}
        ${this.renderSelectOption(defaultScalePrefixes('border-spacing-y'))}
        ${this.renderSelectOption(['table-auto', 'table-fixed'])}
        ${this.renderSelectOption(['caption-top', 'caption-bottom'])}
      </div>
    `,

    transitionsAndAnim: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['transition-none', 'transition-all', 'transition', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform'])}
        ${this.renderSelectOption(['duration-0', 'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000'])}
        ${this.renderSelectOption(['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-500', 'delay-700', 'delay-1000'])}
        ${this.renderSelectOption(['ease-linear', 'ease-in', 'ease-out', 'ease-in-out'])}
        ${this.renderSelectOption(['animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce'])}
      </div>
    `,

    transforms: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['scale-0', 'scale-50', 'scale-75', 'scale-90', 'scale-95', 'scale-100', 'scale-105', 'scale-110', 'scale-125', 'scale-150'])}
        ${this.renderSelectOption(['scale-x-0', 'scale-x-50', 'scale-x-75', 'scale-x-90', 'scale-x-95', 'scale-x-100', 'scale-x-105', 'scale-x-110', 'scale-x-125', 'scale-x-150'])}
        ${this.renderSelectOption(['scale-y-0', 'scale-y-50', 'scale-y-75', 'scale-y-90', 'scale-y-95', 'scale-y-100', 'scale-y-105', 'scale-y-110', 'scale-y-125', 'scale-y-150'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['rotate-0', 'rotate-1', 'rotate-2', 'rotate-3', 'rotate-6', 'rotate-12', 'rotate-45', 'rotate-90', 'rotate-180'])}
        ${this.renderSelectOption(['-rotate-0', '-rotate-1', '-rotate-2', '-rotate-3', '-rotate-6', '-rotate-12', '-rotate-45', '-rotate-90', '-rotate-180'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(defaultScalePrefixes('translate-x'))}
        ${this.renderSelectOption(defaultScalePrefixes('-translate-x'))}
        ${this.renderSelectOption(['translate-x-1/2', 'translate-x-1/3', 'translate-x-2/3', 'translate-x-1/4', 'translate-x-2/4', 'translate-x-3/4', 'translate-x-full'])}
        ${this.renderSelectOption(['-translate-x-1/2', '-translate-x-1/3', '-translate-x-2/3', '-translate-x-1/4', '-translate-x-2/4', '-translate-x-3/4', '-translate-x-full'])}
        ${this.renderSelectOption(defaultScalePrefixes('translate-y'))}
        ${this.renderSelectOption(defaultScalePrefixes('-translate-y'))}
        ${this.renderSelectOption(['translate-y-1/2', 'translate-y-1/3', 'translate-y-2/3', 'translate-y-1/4', 'translate-y-2/4', 'translate-y-3/4', 'translate-y-full'])}
        ${this.renderSelectOption(['-translate-y-1/2', '-translate-y-1/3', '-translate-y-2/3', '-translate-y-1/4', '-translate-y-2/4', '-translate-y-3/4', '-translate-y-full'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['skew-x-0', 'skew-x-1', 'skew-x-2', 'skew-x-3', 'skew-x-6', 'skew-x-12'])}
        ${this.renderSelectOption(['-skew-x-0', '-skew-x-1', '-skew-x-2', '-skew-x-3', '-skew-x-6', '-skew-x-12'])}
        ${this.renderSelectOption(['skew-y-0', 'skew-y-1', 'skew-y-2', 'skew-y-3', 'skew-y-6', 'skew-y-12'])}
        ${this.renderSelectOption(['-skew-y-0', '-skew-y-1', '-skew-y-2', '-skew-y-3', '-skew-y-6', '-skew-y-12'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['origin-center', 'origin-left', 'origin-top-left', 'origin-bottom-left', 'origin-right', 'origin-top-right', 'origin-bottom-right'])}
      </div>
    `,

    fx: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner', 'shadow-none'])}
        ${this.renderSelectOption(['opacity-0', 'opacity-5', 'opacity-10', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-40', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-90', 'opacity-95', 'opacity-100'])}
        ${this.renderSelectOption(['mix-blend-normal', 'mix-blend-multiply', 'mix-blend-screen', 'mix-blend-overlay', 'mix-blend-darken', 'mix-blend-lighten', 'mix-blend-color-dodge', 'mix-blend-color-burn', 'mix-blend-hard-light', 'mix-blend-soft-light', 'mix-blend-difference', 'mix-blend-exclusion', 'mix-blend-hue', 'mix-blend-saturation', 'mix-blend-color', 'mix-blend-luminosity', 'mix-blend-plus-darker', 'mix-blend-plus-lighter'])}
        ${this.renderSelectOption(['bg-blend-normal', 'bg-blend-multiply', 'bg-blend-screen', 'bg-blend-overlay', 'bg-blend-darken', 'bg-blend-lighten', 'bg-blend-color-dodge', 'bg-blend-color-burn', 'bg-blend-hard-light', 'bg-blend-soft-light', 'bg-blend-difference', 'bg-blend-exclusion', 'bg-blend-hue', 'bg-blend-saturation', 'bg-blend-color', 'bg-blend-luminosity'])}
      </div>
    `,

    filters: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['blur-none', 'blur-sm', 'blur-md', 'blur-lg', 'blur-xl', 'blur-2xl', 'blur-3xl'])}
        ${this.renderSelectOption(['brightness-0', 'brightness-50', 'brightness-75', 'brightness-90', 'brightness-95', 'brightness-100', 'brightness-105', 'brightness-110', 'brightness-125', 'brightness-150', 'brightness-200'])}
        ${this.renderSelectOption(['contrast-0', 'contrast-50', 'contrast-75', 'contrast-100', 'contrast-125', 'contrast-150', 'contrast-200'])}
        ${this.renderSelectOption(['drop-shadow-none', 'drop-shadow-sm', 'drop-shadow', 'drop-shadow-md', 'drop-shadow-lg', 'drop-shadow-xl', 'drop-shadow-2xl'])}
        ${this.renderSelectOption(['grayscale', 'grayscale-0'])}
        ${this.renderSelectOption(['hue-rotate-0', 'hue-rotate-15', 'hue-rotate-30', 'hue-rotate-60', 'hue-rotate-90', 'hue-rotate-180'])}
        ${this.renderSelectOption(['invert', 'invert-0'])}
        ${this.renderSelectOption(['saturate-0', 'saturate-50', 'saturate-100', 'saturate-150', 'saturate-200'])}
        ${this.renderSelectOption(['sepia', 'sepia-0'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(['backdrop-blur-none', 'backdrop-blur-sm', 'backdrop-blur-md', 'backdrop-blur-lg', 'backdrop-blur-xl', 'backdrop-blur-2xl', 'backdrop-blur-3xl'])}
        ${this.renderSelectOption(['backdrop-brightness-0', 'backdrop-brightness-50', 'backdrop-brightness-75', 'backdrop-brightness-90', 'backdrop-brightness-95', 'backdrop-brightness-100', 'backdrop-brightness-105', 'backdrop-brightness-110', 'backdrop-brightness-125', 'backdrop-brightness-150', 'backdrop-brightness-200'])}
        ${this.renderSelectOption(['backdrop-contrast-0', 'backdrop-contrast-50', 'backdrop-contrast-75', 'backdrop-contrast-100', 'backdrop-contrast-125', 'backdrop-contrast-150', 'backdrop-contrast-200'])}
        ${this.renderSelectOption(['backdrop-grayscale', 'backdrop-grayscale-0'])}
        ${this.renderSelectOption(['backdrop-hue-rotate-0', 'backdrop-hue-rotate-15', 'backdrop-hue-rotate-30', 'backdrop-hue-rotate-60', 'backdrop-hue-rotate-90', 'backdrop-hue-rotate-180'])}
        ${this.renderSelectOption(['backdrop-invert', 'backdrop-invert-0'])}
        ${this.renderSelectOption(['backdrop-opacity-0', 'backdrop-opacity-5', 'backdrop-opacity-10', 'backdrop-opacity-15', 'backdrop-opacity-20', 'backdrop-opacity-25', 'backdrop-opacity-30', 'backdrop-opacity-35'])}
        ${this.renderSelectOption(['backdrop-saturate-0', 'backdrop-saturate-50', 'backdrop-saturate-100', 'backdrop-saturate-150', 'backdrop-saturate-200'])}
        ${this.renderSelectOption(['backdrop-sepia', 'backdrop-sepia-0'])}
      </div>
    `,

    interactivity: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(colorPrefixes('accent'))}
        ${this.renderSelectOption(colorPrefixes('caret'))}
        ${this.renderSelectOption(['appearance-auto', 'appearance-none'])}
        ${this.renderSelectOption(['cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-help', 'cursor-not-allowed', 'cursor-none', 'cursor-context-menu', 'cursor-progress', 'cursor-cell', 'cursor-crosshair', 'cursor-vertical-text', 'cursor-alias', 'cursor-copy', 'cursor-no-drop', 'cursor-grab', 'cursor-grabbing', 'cursor-all-scroll', 'cursor-col-resize', 'cursor-row-resize', 'cursor-n-resize', 'cursor-e-resize', 'cursor-s-resize', 'cursor-w-resize', 'cursor-ne-resize', 'cursor-nw-resize', 'cursor-se-resize', 'cursor-sw-resize', 'cursor-ew-resize', 'cursor-ns-resize', 'cursor-nesw-resize', 'cursor-nwse-resize', 'cursor-zoom-in', 'cursor-zoom-out'])}
        ${this.renderSelectOption(['pointer-events-auto', 'pointer-events-none'])}
        ${this.renderSelectOption(['resize-none', 'resize', 'resize-x', 'resize-y'])}
        ${this.renderSelectOption(['scroll-auto', 'scroll-smooth'])}
        ${this.renderSelectOption(['snap-align-none', 'snap-start', 'snap-center', 'snap-end'])}
        ${this.renderSelectOption(['snap-normal', 'snap-always'])}
        ${this.renderSelectOption(['snap-none', 'snap-x', 'snap-y', 'snap-both'])}
        ${this.renderSelectOption(['snap-proximity', 'snap-mandatory'])}
        ${this.renderSelectOption(['touch-auto', 'touch-none', 'touch-pan-x', 'touch-pan-left', 'touch-pan-right', 'touch-pan-y', 'touch-pan-up', 'touch-pan-down', 'touch-pinch-zoom', 'touch-manipulation'])}
        ${this.renderSelectOption(['select-auto', 'select-none', 'select-text', 'select-all'])}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(defaultScalePrefixes('scroll-m'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-mx'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-my'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-ml'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-mr'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-mt'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-mb'))}
        <div class="border-b border-neutral-200"></div>
        ${this.renderSelectOption(defaultScalePrefixes('scroll-p'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-px'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-py'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-pl'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-pr'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-pt'))}
        ${this.renderSelectOption(defaultScalePrefixes('scroll-pb'))}
      </div>
    `,

    aspect: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['aspect-square', 'aspect-video'])}
      </div>
    `,

    columns: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['columns-1', 'columns-2', 'columns-3', 'columns-4', 'columns-5', 'columns-6', 'columns-7', 'columns-8', 'columns-9', 'columns-10', 'columns-11', 'columns-12'])}
      </div>
    `,

    object: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['object-contain', 'object-cover', 'object-fill', 'object-scale-down'])}
      </div>
    `,

    visibility: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['invisible', 'collapse'])}
      </div>
    `,

    z: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderSelectOption(['z-10', 'z-20', 'z-30', 'z-40', 'z-50'])}
      </div>
    `,

    js: () => d.html`
      <div class="flex flex-col gap-1 border border-neutral-200 rounded-md p-1 text-sm bg-white shadow">
        ${this.renderActionBtn('Set if expression', 'Ctrl-i')}
        ${this.renderActionBtn('Set map expression', 'Ctrl-m')}
        ${this.renderActionBtn('Set event handlers', 'Ctrl-o')}
      </div>
    `,
  };

  renderSubMenuOption = (id, label, i = 0) => d.html`
    <button ${{
      class: [
        'flex justify-between items-center gap-3 rounded px-2 py-1 text-left',
        () => this.activeSubmenus[i] === id ? 'bg-neutral-100' : 'hover:bg-neutral-100',
      ],
      onMouseOver: () => {
        this.activeSubmenus.splice(i, 999);
        this.activeSubmenus.push(id);
      },
    }}>
      ${label}
      <div class="nf nf-fa-chevron_right text-xs"></div>
    </button>
  `;

  renderBreakpointOptions = bps => {
    let selected = this.bp || bps[0];

    return d.html`
      <button ${{
        class: [
          'flex items-center gap-3 rounded px-2 py-1',
          () => bps.length < 2 ? 'justify-center' : 'justify-between',
          () => this.bp !== 'none' ? 'font-bold bg-neutral-100' : 'hover:bg-neutral-100',
        ],
        onClick: () => { this.bp = this.bp !== selected ? selected : 'none' },
      }}>
        ${d.if(() => bps.length >= 2, d.html`
          <div class="nf nf-fa-chevron_left text-xs" ${{
            onClick: ev => {
              ev.stopPropagation();
              let i = bps.indexOf(selected) - 1;
              if (i < 0) { i = bps.length - 1 }
              this.bp = selected = bps[i];
            },
          }}></div>
        `)}
        ${d.text(() => selected)}
        ${d.if(() => bps.length >= 2, d.html`
          <div class="nf nf-fa-chevron_right text-xs" ${{
            onClick: ev => {
              ev.stopPropagation();
              let i = bps.indexOf(selected) + 1;
              if (i >= bps.length) { i = 0 }
              this.bp = selected = bps[i];
            },
          }}></div>
        `)}
      </button>
    `;
  };

  renderStateOption = st => d.html`
    <button ${{
      class: [
        'flex items-center gap-3 rounded px-2 py-1 justify-center',
        () => this.sts.includes(st) ? 'font-bold bg-neutral-100' : 'hover:bg-neutral-100',
      ],
      onClick: () => {
        let i = this.sts.indexOf(st);
        if (i === -1) { this.sts.push(st) } else { this.sts.splice(i, 1) }
      },
    }}>
      ${st}
    </button>
  `;

  renderSelectOption = classNames => {
    let mods = x => [this.bp !== 'none' && this.bp, ...this.sts, x].filter(Boolean).join(':');

    let active = (dbg) => {
      let x = [...state.app.s?.classList || []].find(x => classNames.map(mods).includes(x));
      if (!x) { return null }
      return x.split(':').at(-1);
    };

    let selected = active(classNames.includes('text-xs')) || classNames[0];

    return d.html`
      <button ${{
        class: [
          'flex items-center gap-3 rounded px-2 py-1',
          () => classNames.length < 2 ? 'justify-center' : 'justify-between',
          () => active() ? 'font-bold text-blue-900 bg-neutral-100' : 'hover:bg-neutral-100',
        ],
        onClick: () => { state.app.s.classList.toggle(mods(selected)); post('app.pushHistory') },
      }}>
        ${d.if(() => classNames.length >= 2, d.html`
          <div class="nf nf-fa-chevron_left text-xs" ${{
            onClick: ev => {
              ev.stopPropagation();
              let delta = ev.ctrlKey ? 10 : 1;
              let i = classNames.indexOf(selected) - delta;
              if (i < 0) { i = classNames.length - 1 }
              state.app.s.classList.remove(mods(selected));
              state.app.s.classList.add(mods(selected = classNames[i]));
              post('app.pushHistory');
            },
          }}></div>
        `)}
        ${d.text(() => mods(selected))}
        ${d.if(() => classNames.length >= 2, d.html`
          <div class="nf nf-fa-chevron_right text-xs" ${{
            onClick: ev => {
              ev.stopPropagation();
              let delta = ev.ctrlKey ? 10 : 1;
              let i = classNames.indexOf(selected) + delta;
              if (i >= classNames.length) { i = 0 }
              state.app.s.classList.remove(mods(selected));
              state.app.s.classList.add(mods(selected = classNames[i]));
              post('app.pushHistory');
            },
          }}></div>
        `)}
      </button>
    `;
  };

  renderActionBtn = (label, key) => d.html`
    <button class="flex justify-between gap-3 rounded px-2 py-1 hover:bg-neutral-100" ${{
      onClick: () => { post('app.editorAction', key); this.props.close() },
    }}>
      ${label}
      <div class="rounded px-2 mono text-xs bg-neutral-200/50">${key}</div>
    </button>
  `;
}

function defaultScalePrefixes(x) {
  return [0, 'px', 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96].map(y => `${x}-${y}`);
}

function colorPrefixes(x) {
  return ['inherit' ,'current' ,'transparent' ,'black' ,'white' ,'slate-50' ,'slate-100' ,'slate-200' ,'slate-300' ,'slate-400' ,'slate-500' ,'slate-600' ,'slate-700' ,'slate-800' ,'slate-900' ,'slate-950' ,'gray-50' ,'gray-100' ,'gray-200' ,'gray-300' ,'gray-400' ,'gray-500' ,'gray-600' ,'gray-700' ,'gray-800' ,'gray-900' ,'gray-950' ,'zinc-50' ,'zinc-100' ,'zinc-200' ,'zinc-300' ,'zinc-400' ,'zinc-500' ,'zinc-600' ,'zinc-700' ,'zinc-800' ,'zinc-900' ,'zinc-950' ,'neutral-50' ,'neutral-100' ,'neutral-200' ,'neutral-300' ,'neutral-400' ,'neutral-500' ,'neutral-600' ,'neutral-700' ,'neutral-800' ,'neutral-900' ,'neutral-950' ,'stone-50' ,'stone-100' ,'stone-200' ,'stone-300' ,'stone-400' ,'stone-500' ,'stone-600' ,'stone-700' ,'stone-800' ,'stone-900' ,'stone-950' ,'red-50' ,'red-100' ,'red-200' ,'red-300' ,'red-400' ,'red-500' ,'red-600' ,'red-700' ,'red-800' ,'red-900' ,'red-950' ,'orange-50' ,'orange-100' ,'orange-200' ,'orange-300' ,'orange-400' ,'orange-500' ,'orange-600' ,'orange-700' ,'orange-800' ,'orange-900' ,'orange-950' ,'amber-50' ,'amber-100' ,'amber-200' ,'amber-300' ,'amber-400' ,'amber-500' ,'amber-600' ,'amber-700' ,'amber-800' ,'amber-900' ,'amber-950' ,'yellow-50' ,'yellow-100' ,'yellow-200' ,'yellow-300' ,'yellow-400' ,'yellow-500' ,'yellow-600' ,'yellow-700' ,'yellow-800' ,'yellow-900' ,'yellow-950' ,'lime-50' ,'lime-100' ,'lime-200' ,'lime-300' ,'lime-400' ,'lime-500' ,'lime-600' ,'lime-700' ,'lime-800' ,'lime-900' ,'lime-950' ,'green-50' ,'green-100' ,'green-200' ,'green-300' ,'green-400' ,'green-500' ,'green-600' ,'green-700' ,'green-800' ,'green-900' ,'green-950' ,'emerald-50' ,'emerald-100' ,'emerald-200' ,'emerald-300' ,'emerald-400' ,'emerald-500' ,'emerald-600' ,'emerald-700' ,'emerald-800' ,'emerald-900' ,'emerald-950' ,'teal-50' ,'teal-100' ,'teal-200' ,'teal-300' ,'teal-400' ,'teal-500' ,'teal-600' ,'teal-700' ,'teal-800' ,'teal-900' ,'teal-950' ,'cyan-50' ,'cyan-100' ,'cyan-200' ,'cyan-300' ,'cyan-400' ,'cyan-500' ,'cyan-600' ,'cyan-700' ,'cyan-800' ,'cyan-900' ,'cyan-950' ,'sky-50' ,'sky-100' ,'sky-200' ,'sky-300' ,'sky-400' ,'sky-500' ,'sky-600' ,'sky-700' ,'sky-800' ,'sky-900' ,'sky-950' ,'blue-50' ,'blue-100' ,'blue-200' ,'blue-300' ,'blue-400' ,'blue-500' ,'blue-600' ,'blue-700' ,'blue-800' ,'blue-900' ,'blue-950' ,'indigo-50' ,'indigo-100' ,'indigo-200' ,'indigo-300' ,'indigo-400' ,'indigo-500' ,'indigo-600' ,'indigo-700' ,'indigo-800' ,'indigo-900' ,'indigo-950' ,'violet-50' ,'violet-100' ,'violet-200' ,'violet-300' ,'violet-400' ,'violet-500' ,'violet-600' ,'violet-700' ,'violet-800' ,'violet-900' ,'violet-950' ,'purple-50' ,'purple-100' ,'purple-200' ,'purple-300' ,'purple-400' ,'purple-500' ,'purple-600' ,'purple-700' ,'purple-800' ,'purple-900' ,'purple-950' ,'fuchsia-50' ,'fuchsia-100' ,'fuchsia-200' ,'fuchsia-300' ,'fuchsia-400' ,'fuchsia-500' ,'fuchsia-600' ,'fuchsia-700' ,'fuchsia-800' ,'fuchsia-900' ,'fuchsia-950' ,'pink-50' ,'pink-100' ,'pink-200' ,'pink-300' ,'pink-400' ,'pink-500' ,'pink-600' ,'pink-700' ,'pink-800' ,'pink-900' ,'pink-950' ,'rose-50' ,'rose-100' ,'rose-200' ,'rose-300' ,'rose-400' ,'rose-500' ,'rose-600' ,'rose-700' ,'rose-800' ,'rose-900' ,'rose-950'].map(y => `${x}-${y}`);
}

export default DesignerContextMenu;
