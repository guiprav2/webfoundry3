let $ = (...args) => {
  let p = typeof args[0] !== 'string' ? args.shift() : document;
  return p.querySelector(args[0]);
};

let $$ = (...args) => {
  let p = typeof args[0] !== 'string' ? args.shift() : document;
  return p.querySelectorAll(args[0]);
};

let windy = (...args) => {
  let name = args.length > 1 && args.shift();
  let styles = args.shift() || '';
  let id = name ? `windy--${name}` : 'windy';
  let s = $(`#${id}`);

  if (!s) {
    s = document.createElement('style');
    s.id = id;

    if (name) {
      let su = $('#windy');
      su && su.parentNode.insertBefore(s, su.nextSibling);
    } else if (document.currentScript) {
      document.currentScript.insertAdjacentElement('beforebegin', s);
    } else {
      document.head.append(s);
    }
  }

  if (name) {
    s.textContent = buildRuleSet(name, styles);
    windy.semantic[name] = styles.replace(/\s+/g, ' ').trim();
    return name;
  }

  for (let x of styles.trim().split(/\s+/)) {
    if (windy.util.has(x)) { continue }
    let w = x.split(':').length + (x.includes('print:') ? 10 : 0);
    windy.utilRules.push([w, buildRuleSet(x, x)]);
    windy.utilRules.sort((a, b) => a[0] > b[0]);
    s.textContent = windy.utilRules.map(x => x[1]).join('\n\n');
    windy.util.add(x);
  }

  return styles;
};

windy.semantic = {};
windy.util = new Set();
windy.utilRules = [];

function buildRuleSet(sel, styles) {
  let semantic = sel !== styles, sets = {};

  for (let x of styles.trim().split(/\s+/)) {
    let xs = x.split(':'), y = xs.pop();
    let z = xs.join(':') || 'base';
    (sets[z] ??= []).push(y);
  }

  return Object.keys(sets).map(x => {
    let xs = x.split(':');
    return buildRule(xs, semantic, sel, sets[x].join(' '));
  }).join('\n\n');
}

function buildRule(mods, semantic, sel, styles) {
  let { bp, bpid, spsts, sts } = parseMods(mods), rule = [];

  if (bp === 'print') {
    rule.push(`@media print {`);
  } else if (bp) {
    rule.push(`@media (min-width: ${bp}) {`);
  }

  rule.push(`${buildSelector(spsts, sts, semantic, sel)} {`);
  rule.push(...buildPropertyLines(styles));
  rule.push('}');

  if (bp) { rule.push('}') }
  return rule.join('\n');
}

function buildSelector(spsts, sts, semantic, sel) {
  spsts.includes('not-first-child') && console.log(spsts, sts);
  return [
    spsts.includes('group-hover') && '.group',
    spsts.includes('popup') && 'button:focus +',
    `.${CSS.escape(sel)}${sts.filter(Boolean).length ? `:${sts.filter(Boolean).join(':')}` : ''}`,
  ].filter(Boolean).join(' ').replace(':> ', '> ');
}

function buildPropertyLines(styles) {
  let props = {};

  for (let x of styles.trim().split(/\s+/)) {
    for (let b of windy.builders) {
      let m = b[0].exec(x);
      if (!m) { continue }
      Object.assign(props, b[1](...[].slice.call(m, 1)));
    }
  }

  return Object.entries(props).map(x => `${x[0]}: ${x[1]};`);
}

function parseMods(xs) {
  let bp = null, bpid = null, spsts = [], sts = [];

  for (let x of xs) {
    if (parseMods.breakpoints[x]) {
      bpid = x;
      bp = parseMods.breakpoints[x];
      continue;
    }

    if (parseMods.specialStates[x] != null) {
      spsts.push(x);
      sts.push(parseMods.specialStates[x]);
      continue;
    }

    x !== 'base' && sts.push(x);
  }

  return { bp, bpid, spsts, sts };
}

parseMods.breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  print: 'print',
};

parseMods.specialStates = {
  'group-hover': 'hover', 'not-first-child': '> :nth-child(n + 2)', popup: '',
};

windy.bem = (name, els) => Object.fromEntries(Object.entries(els).map(
  ([k, v]) => [k, windy(k === 'root' ? name : `${name}-${k}`, v)]));

windy.matches = x => {
  let xs = x.split(':');
  let y = xs.pop();
  let mm = xs.every(x => parseMods.bps[x] || parseMods.sts[x]);
  let mb = builders.some(z => z[0].test(y));
  return mm && mb;
};

windy.builders = [
  [/^break-before-(auto|avoid|all|avoid-page|page|left|right|column)$/, x => ({ 'break-before': x })],
  [/^break-inside-(auto|avoid|avoid-page|avoid-column)$/, x => ({ 'break-inside': x })],
  [/^italic$/, () => ({ 'font-style': 'italic' })],
  [/^(-)?rotate-(\d+)$/, (x, y) => ({ rotate: `${x || ''}${y}deg` })],
  [/^box-decoration-(clone|slice)$/, x => ({ 'box-decoration-break': x })],
  [/^leading-(.+)$/, x => ({
    'line-height': {
      1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem',
      6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem',
      12: '3rem', 16: '4rem', 20: '5rem', 24: '8rem',
    }[x],
  })],
  [/^bg-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/, x => ({
    'background-position': x.replace('-', ' ') })],
  [/^text-ellipsis$/, () => ({ 'text-overflow': 'ellipsis' })],
  [/^scale(-[xy])?-(.+)$/, (x, y) => ({ [`scale${x || ''}`]: y.startsWith('[') ? y.slice(1, -1) : Number(y) / 100 })],
  [/^space-(x|y)-(.+)$/, (x, y) => ({ [`& > :nth-child(n + 2) { margin-${{ x: 'left', y: 'top' }[x]}`]: {
    0: 0, px: '1px', '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
    '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem',
    6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
    12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem',
    32: '8rem', 36: '9rem', 40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem',
    56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem',
    auto: 'auto',
  }[y] + '; }'})],
  [/^snap-(x|y)$/, x => ({ 'scroll-snap-type': x })],
  [/^snap-(center)$/, x => ({ 'scroll-snap-align': x })],
  [/^bg-(fixed|local|scroll)$/, x => ({ 'background-attachment': x })],
  [/^shrink-(.+)$/, x => ({ 'flex-shrink': x })],
  [/^bg-(repeat|no-repeat|repeat-[xy]|round|space)$/, x =>
    ({ 'background-repeat': x.replace('repeat-', '') })],
  [/^(-)?translate(-[xy])?-(.+)$/, (x, y, z) => ({
    [`--windy-translate-${y?.slice?.(1) || 'x'}`]: (x || '') + z.slice(1, -1),
    [`--windy-translate-${y?.slice?.(1) || 'y'}`]: (x || '') + z.slice(1, -1),
    translate: `var(--windy-translate-x, 0) var(--windy-translate-y, 0)`
  })],
  [/^gfont-\[([^\]]+)\]$/, x => {
    let id = `windy-gfont-[${x}]`, fs = $(`#${id}`);

    if (!fs) {
      fs = document.createElement('link');
      Object.assign(fs, {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css2?family=${x.replace(/_/g, '+')}&display=swap`,
      });
      document.head.append(fs);
    }

    return { 'font-family': JSON.stringify(x.replace(/_/g, ' ')) };
  }],
  [/^self-(.+)$/, x => ({ 'align-self': x })],
  [/^(from|via|to)-(.+)$/, (x, y) => ({
    '--windy-gradient-stops': 'var(--windy-gradient-from), var(--windy-gradient-to)',
    [`--windy-gradient-${x}`]: color(y),
  })],
  [/^bg-radial$/, x => ({ 'background-image': `radial-gradient(circle, var(--windy-gradient-stops))` })],
  [/^bg-radial-from-(.+)$/, x => ({
    'background-image': `radial-gradient(circle at ${{
      l: 'left', r: 'right', t: 'top',  b: 'bottom', c: 'center',
      bl: 'bottom left', br: 'bottom right', tl: 'top left', tr: 'top right',
    }[x]}, var(--windy-gradient-stops))`,
  })],
  [/^bg-gradient-to-(.+)$/, x => ({ 'background-image': `linear-gradient(to ${{
    l: 'left', tl: 'top left', r: 'right', tr: 'top right', top: 'top',
    b: 'bottom', bl: 'bottom left', br: 'bottom right',
  }[x]}, var(--windy-gradient-stops))` })],
  [/^select-(.+)$/, x => ({ 'user-select': x })],
  [/^whitespace-([\w-]+)$/, x => ({ 'white-space': x })],
  [/^pointer-events-([\w-]+)$/, x => ({ 'pointer-events': x })],
  [/^cursor-([\w-]+)$/, x => ({ cursor: x })],
  [/^bg-(cover|contain)$/, x => ({ 'background-size': x })],
  [/^bg-(center)$/, x => ({ 'background-position': x })],
  [/^transition-all$/, () => ({ 'transition-property': 'all', 'transition-duration': '0.5s' })],
  [/^duration-(\d+)$/, x => ({ 'transition-duration': `${x}ms` })],
  [/^ease-(.+)$/, x => ({ 'transition-timing-function': x === 'linear' ? x : {
    in: 'cubic-bezier(0.4, 0, 1, 1)', out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  }[x]})],
  [/^(grayscale|invert|sepia)(-.+)?$/, (x, y) => ({ filter: `${x}(${y?.slice(1) || 1})` })],
  [/^(-)?hue-rotate-(.+)?$/, (x, y) => ({ filter:
    `hue-rotate(${y.startsWith('[') ? (x || '') + y.slice(1, -1) : `${x || ''}${y}deg`})` })],
  [/^(-)?filter-\[(.+)\]$/, (x, y) => ({ filter: (x || '') + y.replace(/_/g, ' ') })],
  [/^backdrop-(blur|grayscale|invert|sepia)(-.+)?$/, (x, y) => ({
    'backdrop-filter': `${x}(${x === 'blur' ? {
      none: 0, sm: '4px', md: '12px', lg: '16px', xl: '24px', '2xl': '40px', '3xl': '64px',
    }[y.slice(1)] : y?.slice(1) || 1})`,
  })],
  [/^content-(none|\[[^\]]+\])$/, x => ({ content: x.startsWith('[') ? x.slice(1, -1).replace(/_/g, ' ') : x })],
  [/^box-decoration-(clone|slice)$/, x => ({ 'box-decoration-break': x })],
  [/^box-(border|content)$/, x => ({ 'box-sizing': x })],
  [/^isolate(-auto)?$/, x => ({ isolation: x ? 'auto' : 'isolate' })],
  [/^object-(contain|cover|fill|none|scale-down)$/, x => ({ 'object-fit': x })],
  [/^object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
    x => ({ 'object-position': x.replace('-', ' ') })],
  [/^overflow-(auto|hidden|clip|visible|scroll|[xy]-auto|[xy]-hidden|[xy]-clip|[xy]-visible|[xy]-scroll)$/,
    x => ({ [x.includes('-') ? `overflow-${x[0]}` : 'overflow']: x.includes('-') ? x.slice(2) : x })],
  [/^(visible)$/, x => ({ visibility: x })],
  [/^invisible$/, x => ({ visibility: 'hidden' })],
  [/^(collapse)$/, x => ({ visibility: x })],
  [/^z-(\d+|auto)$/, x => ({ 'z-index': x })],
  [/^columns-(\d+|auto|[32]?xs|sm|md|lg|[234567]?xl)$/, x => ({
    columns: !Number.isNaN(x) ? x : {
      auto: 'auto', '3xs': '16rem', '2xs': '18rem', xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem',
      xl: '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem',
      '7xl': '80rem',
    }[x],
  })],
  [/^order-(.+)$/, x => ({
    order: !Number.isNaN(Number(x)) ? x : { first: -9999, last: 9999, none: 0 }[x] })],
  [/^(static|fixed|absolute|relative|sticky)$/, x => ({ position: x })], // FIXME: relative
  [/^(-)?(left|right|top|bottom)-(.+)$/, (x, y, z) => ({
    [y]: z.startsWith('[') ? (x || '') + z.slice(1, -1).replace(/_/g, ' ') :
      /^\d+\/\d+$/.test(z) ? `calc((${x || ''}${z})*100%)`: (x || '') + {
      auto: 'auto', 0: 0, '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
      '2.5': '0.625rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem',
      8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
      20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem', 40: '10rem',
      44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem', 64: '16rem',
      72: '18rem', 80: '20rem', 96: '24rem',
    }[z],
  })],
  [/^inset-(x|y)-0$/, x => ({ x: { left: 0, right: 0 }, y: { top: 0, bottom: 0 } }[x])],
  [/^aspect-(\w+|\[[^\]]+\])$/, x => ({
    'aspect-ratio': x.startsWith('[')
      ? x.slice(1, -1).replace('/', ' / ') : { auto: 'auto', square: '1 / 1', video: '16 / 9' }[x],
  })],
  [/^sr-only$/, () => ({
    position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)',
    padding: '0', margin: '-1px', 'white-space': 'nowrap', 'border-width': 0,
  })],
  [/^basis-([\d\.]+|[\d/]+|\w+|\[[^\]]+\])$/, x => ({
    'flex-basis': x.startsWith('[') ? x.slice(1, -1) : {
      '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem', '2.5': '0.625rem',
      3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem',
      9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
      20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem', 40: '10rem',
      44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem', 64: '16rem',
      72: '18rem', 80: '20rem', 96: '24rem', '1/2': '50%', '1/3': '33.333333%',
      '2/3': '66.666667%', '1/4': '25%', '2/4': '50%', '3/4': '75%', '1/5': '20%',
      '2/5': '40%', '3/5': '60%', '4/5': '80%', '1/6': '16.666667%', '2/6': '33.333333%',
      '3/6': '50%', '4/6': '66.666667%', '5/6': '83.333333%', '1/12': '8.333333%',
      '2/12': '16.666667%', '3/12': '25%', '4/12': '33.333333%', '5/12': '41.666667%',
      '6/12': '50%', '7/12': '58.333333%', '8/12': '66.666667%', '9/12': '75%',
      '10/12': '83.333333%', '11/12': '91.666667%', auto: 'auto', full: '100%',
      screen: `100v${x}`, min: 'min-content', max: 'max-content', fit: 'fit-content',
    }[x],
  })],
  [/^(w|h)-([\d\.]+|[\d/]+|\w+|\[[^\]]+\])$/, (x, y) => ({
    [{ w: 'width', h: 'height' }[x]]: y.startsWith('[') ? y.slice(1, -1) : {
      '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem', '2.5': '0.625rem',
      3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem',
      9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
      20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem', 40: '10rem',
      44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem', 64: '16rem',
      72: '18rem', 80: '20rem', 96: '24rem', '1/2': '50%', '1/3': '33.333333%',
      '2/3': '66.666667%', '1/4': '25%', '2/4': '50%', '3/4': '75%', '1/5': '20%',
      '2/5': '40%', '3/5': '60%', '4/5': '80%', '1/6': '16.666667%', '2/6': '33.333333%',
      '3/6': '50%', '4/6': '66.666667%', '5/6': '83.333333%', '1/12': '8.333333%',
      '2/12': '16.666667%', '3/12': '25%', '4/12': '33.333333%', '5/12': '41.666667%',
      '6/12': '50%', '7/12': '58.333333%', '8/12': '66.666667%', '9/12': '75%',
      '10/12': '83.333333%', '11/12': '91.666667%', auto: 'auto', full: '100%',
      screen: `100v${x}`, min: 'min-content', max: 'max-content', fit: 'fit-content',
    }[y],
  })],
  [/^min-(w|h)-(.+)$/, (x, y) => ({
    [{ w: 'min-width', h: 'min-height' }[x]]: y.startsWith('[') ? y.slice(1, -1) : {
      0: 0, '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem', '2.5': '0.625rem',
      3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem',
      9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
      20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem', 40: '10rem',
      44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem', 64: '16rem',
      72: '18rem', 80: '20rem', 96: '24rem', '1/2': '50%', '1/3': '33.333333%',
      '2/3': '66.666667%', '1/4': '25%', '2/4': '50%', '3/4': '75%', '1/5': '20%',
      '2/5': '40%', '3/5': '60%', '4/5': '80%', '1/6': '16.666667%', '2/6': '33.333333%',
      '3/6': '50%', '4/6': '66.666667%', '5/6': '83.333333%', '1/12': '8.333333%',
      '2/12': '16.666667%', '3/12': '25%', '4/12': '33.333333%', '5/12': '41.666667%',
      '6/12': '50%', '7/12': '58.333333%', '8/12': '66.666667%', '9/12': '75%',
      '10/12': '83.333333%', '11/12': '91.666667%', auto: 'auto', full: '100%',
      screen: `100v${x}`, min: 'min-content', max: 'max-content', fit: 'fit-content',
    }[y],
  })],
  [/^max-w-(.+)$/, x => ({
    'max-width': x.startsWith('[') ? x.slice(1, -1) : {
      0: 0, '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem', '2.5': '0.625rem',
      3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem',
      9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
      20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem', 40: '10rem',
      44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem', 64: '16rem',
      72: '18rem', 80: '20rem', 96: '24rem', '1/2': '50%', '1/3': '33.333333%',
      '2/3': '66.666667%', '1/4': '25%', '2/4': '50%', '3/4': '75%', '1/5': '20%',
      '2/5': '40%', '3/5': '60%', '4/5': '80%', '1/6': '16.666667%', '2/6': '33.333333%',
      '3/6': '50%', '4/6': '66.666667%', '5/6': '83.333333%', '1/12': '8.333333%',
      '2/12': '16.666667%', '3/12': '25%', '4/12': '33.333333%', '5/12': '41.666667%',
      '6/12': '50%', '7/12': '58.333333%', '8/12': '66.666667%', '9/12': '75%',
      '10/12': '83.333333%', '11/12': '91.666667%', auto: 'auto', full: '100%', none: 'none',
      xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', '2xl': '42rem',
      '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem',
      '7xl': '80rem',  full: '100%', min: 'min-content', max: 'max-content',
      fit: 'fit-content', prose: '65ch', screen: '100vw', 'screen-sm': '640px',
      'screen-md': '768px', 'screen-lg': '1024px', 'screen-xl': '1280px',
      'screen-2xl': '1536px',
    }[x],
  })],
  [/^max-h-(.+)$/, x => ({
    'max-height': x.startsWith('[') ? x.slice(1, -1) : {
      0: 0, '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
      '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem',
      6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
      12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem',
      32: '8rem', 36: '9rem', 40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem',
      56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem',
      none: 'none', full: '100%', screen: '100vh', min: 'min-content', max: 'max-content',
      fit: 'fit-content',
    }[x],
  })],
  [/^(fill|stroke)-([\w\d-\/]+|\[[^\]]+\])$/, (x, y) => ({
    [x]: y.startsWith('[') ? y.slice(1, -1).replace(/_/g, ' ') : color(y) })],
  [/^bg-([\w\d-\/]+|\[[^\]]+\])$/, x => ({
    [`background-${x.startsWith('[') && x[1] !== '#' ? 'image' : 'color'}`]:
      x.startsWith('[') ? x.slice(1, -1).replace(/_/g, ' ') : color(x) })],
  [/^(font|text)-(2?xs|sm|base|lg|[23456789]?xl)$/, (x, y) => ({
    'font-size': {
      '2xs': '0.65rem', xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem',
      '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem',
      '7xl': '4.5rem', '8xl': '6rem', '9xl': '8rem',
    }[y],
  })],
  [/^text-(left|center|right|justify|start|end)$/, x => ({ 'text-align': x })],
  [/^font-(thin|extralight|light|normal|medium|semibold|bold|black)$/, x => ({
    'font-weight': {
      thin: 100, extralight: 200, light: 300, normal: 400,
      medium: 500, semibold: 600, bold: 700, black: 800,
    }[x],
  })],
  [/^(font|text)-([\w\d-\/]+|\[[^\]]+\])$/, (x, y) => ({ color: color(y) })],
  [/^(sans|serif|mono|sntregular)$/, x => ({ 'font-family': {
    sans: 'sans-serif', mono: 'monospace',
    sntregular: '"Sonetto Regular"',
  }[x] || x })],
  [/^(italic)$/, x => ({ 'font-style': x })],
  [/^not-italic$/, () => ({ 'font-style': 'normal' })],
  [/^(underline|overline|line-through|no-underline)$/, x =>
    ({ 'text-decoration-line': { 'no-underline': 'none' }[x] || x })],
  [/^(uppercase|lowercase|capitalize|normal-case)$/, x =>
    ({ 'text-transform': { 'normal-case': 'none' }[x] || x })],
  [/^tracking-(\w+)$/, x => ({
    'letter-spacing': {
      tighter: '-0.05em', tight: '-0.025em', normal: 0,
      wide: '0.025em', wider: '0.05em', widest: '0.1em',
    }[x],
  })],
  [/^truncate$/, () => ({
    overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
  })],
  [/^text-(ellipsis|clip)$/, x => ({ 'text-overflow': x })],
  [/^rounded$/, x => ({ 'border-radius': '0.25rem' })],
  [/^rounded(-[tb][lr])?-([\d\w]+)$/, (x, y) => ({
    [['border', x ? {
      tl: 'top-left', tr: 'top-right',
      bl: 'bottom-left', br: 'bottom-right',
    }[x.slice(1)] : null, 'radius'].filter(Boolean).join('-')]: {
      none: 0, sm: '0.125rem', md: '0.375rem', lg: '0.5rem',
      xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
    }[y],
  })],
  [/^list-image-none$/, () => ({ 'list-image': 'none' })],
  [/^list-image-\[([^\]]+)\]$/, x => ({ 'list-image': x })],
  [/^list-(inside|outside)$/, x => ({ 'list-style-position': x })],
  [/^list-(none|disc|decimal)$/, x => ({ 'list-style-type': x })],
  [/^(flow-root)$/, x => ({ display: x })],
  [/^block$/, () => ({ display: 'block' })],
  [/^inline-block$/, () => ({ display: 'inline-block' })],
  [/^inline$/, () => ({ display: 'inline' })],
  [/^flex$/, () => ({ display: 'flex' })],
  [/^inline-flex$/, () => ({ display: 'inline-flex' })],
  [/^grid$/, () => ({ display: 'grid' })],
  [/^inline-grid$/, () => ({ display: 'inline-grid' })],
  [/^table$/, () => ({ display: 'table' })],
  [/^inline-table$/, () => ({ display: 'inline-table' })],
  [/^contents$/, () => ({ display: 'contents' })],
  [/^hidden$/, () => ({ display: 'none' })],
  [/^isolate$/, () => ({ isolation: 'isolate' })],
  [/^isolation-auto$/, () => ({ isolation: 'isolation-auto' })],
  [/^object-(contain|cover|fill|none|scale-down)$/, x => ({ 'object-fit': x })],
  [/^object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
     x => ({ 'object-position': x.replace(/-/g, ' ') })],
  [/^(overflow|overflow-[xy])-(auto|hidden|clip|visible|scroll)$/,
     (k, v) => ({ [k]: v })],
  [/^container$/, x => ({ 'max-width': '1024px', 'margin-left': 'auto', 'margin-right': 'auto' })],
  [/^container-(sm|md|lg|xl|2xl)$/, x => ({
    'max-width': {
      sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
    }[x],
    'margin-left': 'auto',
    'margin-right': 'auto',
  })],
  [/^columns-(\d+|auto|[32]?xs|sm|md|lg|[234567]?xl)$/, x => ({
    columns: /^\d+$/.test(x) ? x : {
      auto: 'auto',
      '3xs': '16rem', '2xs': '18rem', xs: '20rem',
      sm: '24rem', md: '28rem', lg: '32rem',
      xl: '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem',
      '5xl': '64rem', '6xl': '72rem', '7xl': '80rem',
    }[x],
  })],
  [/^basis-([\d\.]+|\w+)$/, x => ({
    'flex-basis': {
      0: 0, '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
      '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem',
      6: '1.5rem', 7: '1.75rem', 8: '2', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
      12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 28: '6rem', 32: '7rem',
      36: '8rem', 40: '9rem', 44: '10rem', 48: '11rem', 52: '12rem', 56: '13rem',
      60: '14rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem', auto: 'auto',
      full: '100%', // TODO: basis-x/y
    }[x],
  })],
  [/^flex-(row|row-reverse|col|col-reverse)$/, x =>
    ({ 'flex-direction': x.replace('col', 'column') })],
  [/^flex-(wrap|wrap-reverse|nowrap)$/, x => ({ 'flex-wrap': x })],
  [/^flex-(1|auto|initial|none)$/, x =>
    ({ flex: { 1: '1 1 0%', auto: '1 1 auto', initial: '0 1 auto', none: 'none' }[x] })],
  [/^(grow|shrink)(-0)?$/, (x, y) => ({ [`flex-${x}`]: y ? 0 : 1 })],
  [/^grid-(cols|rows)-(\d+|\[[^\]]+\]|none)$/, (x, y) =>
    ({ [`grid-template-${{ cols: 'columns' }[x] || x}`]:
      y.startsWith('[') ? y.slice(1, -1).replace(/_/g, ' ') :
      /^\d+$/.test(y) ? `repeat(${y}, minmax(0, 1fr))` : y })],
  [/^(col|row)-auto$/, x => ({ [`grid-${{ col: 'column' }[x] || x}`]: 'auto' })],
  [/^(col|row)-span-(\d+|full)$/, (x, y) =>
    ({ [`grid-${{ col: 'column' }[x] || x}`]:
      /^\d+$/.test(y) ? `span ${y} / span ${y}` : '1 / -1' })],
  [/^(col|row)-(start|end)-(\d+|auto)$/, (x, y, z) =>
    ({ [`grid-${{ col: 'column' }[x] || x}-${y}`]: z })],
  [/^gap-([xy]-)?([\d\.]+)$/, (x, y) => ({
    [{ 'x-': 'column-gap', 'y-': 'row-gap' }[x] || 'gap']: {
      0: 0, '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
      '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem',
      6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
      12: '3rem', 12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem',
      32: '8rem', 36: '9rem', 40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem',
      56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem',
    }[y],
  })],
  [/^justify-(normal|start|end|center|between|around|evenly|stretch)$/, x => ({
    'justify-content': /start|end/.test(x) ? `flex-${x}`
      : /between|around|evenly/.test(x) ? `space-${x}`
      : x,
  })],
  [/^float-(right|left|none)$/, x => ({ float: x })],
  [/^(justify|align)-items-(.+)$/, (x, y) => ({ [`${x}-items`]: y })],
  [/^justify-self-(auto|start|end|center|stretch)$/, x => ({ 'justify-self': x })],
  [/^items-(start|end|center|baseline|stretch)$/, x => ({ 'align-items': x })],
  [/^content-(normal|start|end|center|between|around|evenly|baseline|stretch)$/, x => ({
    'justify-content': /start|end/.test(x) ? `flex-${x}`
      : /between|around|evenly/.test(x) ? `space-${x}`
      : x,
  })],
  [/^self-(auto|start|end|center|baseline|stretch)$/, x => ({
    'justify-self': /start|end/.test(x) ? `flex-${x}` : x,
  })],
  [/^(-?[mp])([selrtbxy])?-(.+)$/, (x, y, z) => {
    let w = { m: 'margin', p: 'padding' }[x.replace(/^-/, '')], v = z.startsWith('[') ? z.slice(1, -1) : {
      0: 0, px: '1px', '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
      '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem',
      6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
      12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem',
      32: '8rem', 36: '9rem', 40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem',
      56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem',
      auto: 'auto',
    }[z];
    if (v !== 'auto' && x.startsWith('-')) { v = `-${v}` }
    return !y ? { [w]: v } : !/x|y/.test(y) ? {
      [`${w}-${{
        s: 'inline-start', e: 'inline-end',
        l: 'left', r: 'right',
        t: 'top', b: 'bottom',
      }[y]}`]: v,
    } : {
      [`${w}-${{ x: 'left', y: 'top' }[y]}`]: v,
      [`${w}-${{ x: 'right', y: 'bottom' }[y]}`]: v,
    };
  }],
  [/^border-(solid|dashed|dotted|double|hidden|none)$/, x => ({ 'border-style': x })],
  [/^border(-[selrtbxy])?(-\d+)?$/, (x, y) => {
    let z = `${y?.slice(1) || 1}px`;
    return !/x|y/.test(x) ? {
      [['border', {
        '-s': 'inline-start', '-e': 'inline-end',
        '-l': 'left', '-r': 'right',
        '-t': 'top', '-b': 'bottom',
      }[x], 'width'].filter(Boolean).join('-')]: z,
    } : {
      [`border-${{ '-x': 'left', '-y': 'top' }[x]}-width`]: z,
      [`border-${{ '-x': 'right', '-y': 'bottom' }[x]}-width`]: z,
    };
  }],
  [/^border(-[selrtbxy])?-([\w\d-\/]+|\[[^\]]+\])$/, (x, y) => {
    let z = color(y);
    return !x || !/x|y/.test(x) ? {
      [['border', {
        '-s': 'inline-start', '-e': 'inline-end',
        '-l': 'left', '-r': 'right',
        '-t': 'top', '-b': 'bottom',
      }[x], 'color'].filter(Boolean).join('-')]: z,
    } : {
      [`border-${{ '-x': 'left', '-y': 'top' }[x]}-color`]: z,
      [`border-${{ '-x': 'right', '-y': 'bottom' }[x]}-color`]: z,
    };
  }],
  [/^outline$/, () => ({ 'outline-style': 'solid' })],
  [/^outline-none$/, () => ({ outline: '2px solid transparent', 'outline-offset': '2px' })],
  [/^outline(-dashed|-dotted|-double)?$/, x => ({ 'outline-style': x?.slice(1) || 'solid' })],
  [/^outline-(\d+)$/, x => ({ 'outline-width': `${x}px` })],
  [/^outline-offset-(\d+)$/, x => ({ 'outline-offset': Number(x) && `${x}px` })],
  [/^outline-([\w\d-\/]+|\[[^\]]+\])$/, x => ({ 'outline-color': color(x) })],
  [/^ring-offset-(\d+)$/, x => ({ '--tw-ring-offset-width': `${x}px` })],
  [/^ring-offset-(.+)$/, x => ({ '--tw-ring-offset-color': color(x) })],
  [/^ring$|^ring-(\d+)?$/, x => ({
    '--tw-ring-inset': '',
    '--tw-ring-color': '#3b82f680',
    '--tw-ring-offset-width': '0px',
    '--tw-ring-offset-color': '#fff',
    '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
    '--tw-ring-shadow': `var(--tw-ring-inset) 0 0 0 calc(${x || 3}px + var(--tw-ring-offset-width)) var(--tw-ring-color)`,
    'box-shadow': [
      'var(--tw-ring-offset-shadow, 0 0 #000)',
      'var(--tw-ring-shadow, 0 0 #000)',
      'var(--tw-shadow, 0 0 #000)'
    ].join(', '),
  })],
  [/^ring-inset$/, () => ({ '--tw-ring-inset': 'inset' })],
  [/^ring-(.+)$/, x => ({ '--tw-ring-color': color(x) })],
  [/^shadow$|^shadow-(.+)$/, x => ({
    '--tw-shadow': !x ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      elevated: '0px 8.5px 10px rgba(0, 0, 0, .28), 0px 68px 80px rgba(0, 0, 0, .56)',
      none: '0 0 #000',
    }[x],
    'box-shadow': [
      'var(--tw-ring-offset-shadow, 0 0 #000)',
      'var(--tw-ring-shadow, 0 0 #000)',
      'var(--tw-shadow, 0 0 #000)'
    ].join(', '),
  })],
  [/^shadow-([\w\d-\/]+)$/, x => ({ '--tw-shadow-color': color(x) })],
  [/^opacity-(0|5|[123456789]0|[279]5|100)$/, x => ({ opacity: Number(x) / 100 })],
  [/^drop-shadow(-sm|md|lg|xl|2xl|none)?$/, x => ({
    filter: !x ? [
      'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))',
      'drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))',
    ].join(' ') : {
      sm: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))',
      md: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
      lg: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
      xl: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
      '2xl': 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
      none: 'drop-shadow(0 0 #0000)',
    }[x.slice(1)],
  })],
];

let colors = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  inherit: 'inherit',
  slate: ["#f8fafc","#f1f5f9","#e2e8f0","#cbd5e1","#94a3b8","#64748b","#475569","#334155","#1e293b","#0f172a","#020617"],
  gray: ["#f9fafb","#f3f4f6","#e5e7eb","#d1d5db","#9ca3af","#6b7280","#4b5563","#374151","#1f2937","#111827","#030712"],
  zinc: ["#fafafa","#f4f4f5","#e4e4e7","#d4d4d8","#a1a1aa","#71717a","#52525b","#3f3f46","#27272a","#18181b","#09090b"],
  neutral: ["#fafafa","#f5f5f5","#e5e5e5","#d4d4d4","#a3a3a3","#737373","#525252","#404040","#262626","#171717","#0a0a0a"],
  stone: ["#fafaf9","#f5f5f4","#e7e5e4","#d6d3d1","#a8a29e","#78716c","#57534e","#44403c","#292524","#1c1917","#0c0a09"],
  red: ["#fef2f2","#fee2e2","#fecaca","#fca5a5","#f87171","#ef4444","#dc2626","#b91c1c","#991b1b","#7f1d1d","#450a0a"],
  orange: ["#fff7ed","#ffedd5","#fed7aa","#fdba74","#fb923c","#f97316","#ea580c","#c2410c","#9a3412","#7c2d12","#431407"],
  amber: ["#fffbeb","#fef3c7","#fde68a","#fcd34d","#fbbf24","#f59e0b","#d97706","#b45309","#92400e","#78350f","#451a03"],
  yellow: ["#fefce8","#fef9c3","#fef08a","#fde047","#facc15","#eab308","#ca8a04","#a16207","#854d0e","#713f12","#422006"],
  lime: ["#f7fee7","#ecfccb","#d9f99d","#bef264","#a3e635","#84cc16","#65a30d","#4d7c0f","#3f6212","#365314","#1a2e05"],
  green: ["#f0fdf4","#dcfce7","#bbf7d0","#86efac","#4ade80","#22c55e","#16a34a","#15803d","#166534","#14532d","#052e16"],
  emerald: ["#ecfdf5","#d1fae5","#a7f3d0","#6ee7b7","#34d399","#10b981","#059669","#047857","#065f46","#064e3b","#022c22"],
  teal: ["#f0fdfa","#ccfbf1","#99f6e4","#5eead4","#2dd4bf","#14b8a6","#0d9488","#0f766e","#115e59","#134e4a","#042f2e"],
  cyan: ["#ecfeff","#cffafe","#a5f3fc","#67e8f9","#22d3ee","#06b6d4","#0891b2","#0e7490","#155e75","#164e63","#083344"],
  sky: ["#f0f9ff","#e0f2fe","#bae6fd","#7dd3fc","#38bdf8","#0ea5e9","#0284c7","#0369a1","#075985","#0c4a6e","#082f49"],
  blue: ["#eff6ff","#dbeafe","#bfdbfe","#93c5fd","#60a5fa","#3b82f6","#2563eb","#1d4ed8","#1e40af","#1e3a8a","#172554"],
  indigo: ["#eef2ff","#e0e7ff","#c7d2fe","#a5b4fc","#818cf8","#6366f1","#4f46e5","#4338ca","#3730a3","#312e81","#1e1b4b"],
  violet: ["#f5f3ff","#ede9fe","#ddd6fe","#c4b5fd","#a78bfa","#8b5cf6","#7c3aed","#6d28d9","#5b21b6","#4c1d95","#2e1065"],
  purple: ["#faf5ff","#f3e8ff","#e9d5ff","#d8b4fe","#c084fc","#a855f7","#9333ea","#7e22ce","#6b21a8","#581c87","#3b0764"],
  fuchsia: ["#fdf4ff","#fae8ff","#f5d0fe","#f0abfc","#e879f9","#d946ef","#c026d3","#a21caf","#86198f","#701a75","#4a044e"],
  pink: ["#fdf2f8","#fce7f3","#fbcfe8","#f9a8d4","#f472b6","#ec4899","#db2777","#be185d","#9d174d","#831843","#500724"],
  rose: ["#fff1f2","#ffe4e6","#fecdd3","#fda4af","#fb7185","#f43f5e","#e11d48","#be123c","#9f1239","#881337","#4c0519"],
};

let shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function color(x) {
  if (x.startsWith('[')) { return x.slice(1, -1) }
  let [name, shade] = x.split('-');

  if (!shade) {
    let [name2, opacity] = name.split('/');

    opacity = opacity
      ? Math.floor((Number(opacity) / 100) * 255).toString(16).padStart(2, 0)
      : '';

    let c = colors[name2];
    return c + opacity;
  } else {
    let [, shade2, opacity] = /^([^\/]+)(\/\d+)?$/.exec(shade);

    opacity = opacity
      ? Math.floor((Number(opacity.slice(1)) / 100) * 255).toString(16).padStart(2, 0)
      : '';

    let c = colors[name], is = shade2 && shades.indexOf(Number(shade2));
    return is && `${is !== -1 ? c?.[is] : c}${opacity}`;
  }
}

function windyAuto(n, deep) {
  if (n.nodeType !== Node.ELEMENT_NODE) { return }
  windy(n.getAttribute('class'));
  if (deep) {
    for (let n2 of n.children) { windyAuto(n2, true) }
  }
}

for (let n of document.querySelectorAll('[class]')) { windyAuto(n) }

let mutobs = new MutationObserver(muts => {
  for (let m of muts) {
    if (m.type === 'childList') {
      for (let n of m.addedNodes) { windyAuto(n, true) }
      continue;
    }
    if (m.attributeName === 'class') {
      windy(m.target.getAttribute('class'));
      continue;
    }
  }
});

mutobs.observe(document, { attributes: true, childList: true, subtree: true });

window.windy = windy;

//export default windy;
