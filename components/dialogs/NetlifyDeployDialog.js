import d from '../../other/dominant.js';
import rfiles from '../../repositories/FilesRepository.js';
import styles from '../../other/styles.js';

class PromptDialog {
  siteId = localStorage.getItem('webfoundry:nfLastSiteId');
  apiKey = localStorage.getItem('webfoundry:nfLastApiKey');

  onKeyDown = ev => {
    if (ev.key !== 'Enter') { return }
    ev.preventDefault();
    ev.target.closest('form').querySelector('button[value="ok"]').click();
  };

  onSubmit = async ev => {
    ev.preventDefault();
    if (ev.submitter.value !== 'ok') { this.root.close(ev.submitter.value); return }

    try {
      this.deploying = true;
      d.update();
      localStorage.setItem('webfoundry:nfLastSiteId', this.siteId);
      localStorage.setItem('webfoundry:nfLastApiKey', this.apiKey);
      let blob = await rfiles.exportZip(state.app.currentSite, { _redirects: new Blob(['/* /index.html 200'], { type: 'text/plain' }) });
      let fd = new FormData();
      fd.append('file', blob);

      let res = await fetch(`https://protohub.guiprav.com/netlify/deploy/${this.siteId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: fd,
        duplex: 'half',
      });

      if (!res.ok) { throw new Error('Deploy failed') }
      let data = await res.json();
      this.root.returnDetail = data.url;
      this.root.close('ok');
    } finally {
      this.deploying = false;
      d.update();
    }
  };

  render = () => this.root = d.html`
    <dialog class="outline-none rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3 pt-2 w-96">
      <form method="dialog" ${{ onKeyDown: this.onKeyDown, onSubmit: this.onSubmit }}>
        <div>Netlify Deploy</div>
        <input placeholder="Site ID" class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
          value: d.binding({ get: () => this.siteId, set: x => this.siteId = x }),
        }}>
        <input type="password" placeholder="API Key" class="outline-none mt-2 w-full rounded px-2 py-1 bg-[#2b2d3130] disabled:opacity-50 focus:bg-[#2b2d3150]" ${{
          value: d.binding({ get: () => this.apiKey, set: x => this.apiKey = x }),
        }}>
        <div class="flex gap-1.5 mt-3">
          <button value="cancel" ${{ class: styles.fullSecondaryBtn }}>Cancel</button>
          <button value="ok" ${{ class: [styles.fullPrimaryBtn, 'flex justify-center items-center gap-3'], disabled: () => !this.siteId || !this.apiKey || this.deploying }}>
            ${d.if(() => this.deploying, d.html`
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            `)}
            Deploy
          </button>
        </div>
      </form>
    </dialog>
  `;
}

export default PromptDialog;
