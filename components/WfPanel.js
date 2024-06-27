import d from '../other/dominant.js';
import { runTour } from '../other/tour.js';

class WfPanel {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="WfPanel w-full max-h-screen flex flex-col gap-4 py-32 px-24 overflow-auto" ${{ onAttach: () => this.timestamp = Date.now() }}>
      <div class="gfont-[Pacifico] text-4xl">Webfoundry</div>
      <div class="text-neutral-400 text-2xl">The precision visual Tailwind CSS editor</div>
      <div class="flex gap-16 xl:gap-32">
        <div class="flex flex-col gap-3 flex-1">
          <div class="text-2xl mb-4">Start</div>
          <div class="grid gap-6 lg:grid-cols-4">
            <button class="aspect-square rounded-md border nf nf-fa-plus border-neutral-500 text-neutral-400 outline-none" ${{ onClick: () => this.props.onCreate() }}></button>
            ${d.map(() => this.props.sites, x => d.html`
              <button class="aspect-square relative rounded-md overflow-hidden outline-none shadow-xl" ${{ onClick: () => this.props.onSelect(x.id) }}>
                <img class="aspect-square object-cover w-full h-full" ${{ src: () => `/files/${x.id}/webfoundry/snapshot.png?` + this.timestamp }}>
                <div class="absolute left-0 right-0 bottom-0 px-3 py-1 bg-neutral-900 text-center">${x.name}</div>
              </button>
            `)}
          </div>
        </div>
        <div class="flex flex-col whitespace-nowrap w-min gap-6">
          <div class="text-xl mb-4">Walkthroughs</div>
          <div class="rounded-md overflow-hidden relative -mt-1.5">
            <div class="absolute w-16 h-16 rotate-45 bg-blue-900 -top-12 -left-8"></div>
            <div class="absolute top-0 nf nf-fa-star text-xs left-1"></div>
            <button class="text-sm rounded-md overflow-hidden bg-black/70 pl-8 pr-4 pt-3 pb-4 hover:bg-black/90 text-left w-full outline-none" ${{ onClick: () => runTour() }}>
              <div class="text-lg">Get Started with Webfoundry</div>
              <div>Go on a short tour over the editor's core features.</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default WfPanel;
