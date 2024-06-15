import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class AIImageDialog {
  constructor(props) { this.props = props; this.value = this.props.initialValue }

  generate = async () => {
    if (!this.prompt.trim()) { return }
    this.generated = this.img = null;

    try {
      this.generating = true;
      d.update();
      let res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${atob('c2stcDlQSkIxR003QkVDTVlJeHdKemhUM0JsYmtGSjNvVnRUNk9DaFo3QTdUbGRSV1ZM')}`,
        },
        body: JSON.stringify({ model: 'dall-e-3', prompt: this.prompt }),
      });
      if (!res.ok) { throw new Error('Fetch failed') }
      let { data } = await res.json();
      let url = `https://corsproxy.io/?${encodeURIComponent(data[0].url)}`;
      let res2 = await fetch(url);
      if (!res2.ok) { throw new Error('Fetch failed') }
      this.generated = await res2.blob();
      this.img = d.el('img', { class: 'w-full max-w-[25vw] mt-2', src: url });
      d.update();
    } finally {
      this.generating = false;
      d.update();
    }
  };

  forcePng = x => {
    if (!x.includes('.')) { return x + '.png' }
    return x.split('.').slice(0, -1).join('.') + '.png';
  };

  onKeyDown = ev => {
    if (ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.target.closest('form').querySelector('button[value="ok"]').click();
  };

  onSubmit = ev => { ev.preventDefault(); this.root.returnDetail = [this.forcePng(this.name.trim()), this.generated]; this.root.close(ev.submitter.value) };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-96 p-3 pt-2">
      <form method="dialog" ${{ onKeyDown: this.onKeyDown, onSubmit: this.onSubmit }}>
        <div>AI Image Generation</div>
        <input class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" placeholder="Prompt" ${{
          value: d.binding({ get: () => this.prompt, set: x => this.prompt = x }),
        }}>
        ${d.portal(() => this.img)}
        ${d.if(() => this.img, d.html`
          <input class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" placeholder="File name" ${{
            value: d.binding({ get: () => this.name, set: x => this.name = x }),
          }}>
        `)}
        <div class="flex gap-1.5 mt-3">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn }}>Cancel</button>
          <button type="button" ${{ class: [styles.fullSecondaryBtn, 'flex justify-center items-center gap-3'], onClick: this.generate }}>
            ${d.if(() => this.generating, d.html`
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            `)}
            Generate
          </button>
          <button value="ok" ${{ class: styles.fullPrimaryBtn, disabled: () => !this.name?.trim?.() }}>OK</button>
        </div>
      </form>
    </div>
  `;
}

export default AIImageDialog;
