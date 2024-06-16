import d from '../../other/dominant.js';

class WelcomeDialog {
  render = () => d.html`
    <dialog class="bg-[#121212] text-neutral-100 p-12 rounded-xl max-w-4xl bg-[url('images/welcome.png')] bg-no-repeat bg-right">
      <form method="dialog">
        <div class="text-center text-2xl mb-2">Welcome to Webfoundry!</div>
        <div class="text-center">Your Ultimate Tool for Buidling Stunning Websites and Apps</div>
        <div class="text-center mb-12">Designed with developers in mind, Webfoundry makes your web creation journey smooth and enjoyable.</div>
        <div class="text-center font-bold mb-2">Get Started</div>
        <ul class="list-disc space-y-2 pl-5">
          <li><span class="font-bold">Create Your First Site:</span> Use the <span class="font-bold">Add button</span> in the <span class="font-bold">Sites tab</span> to start your first project.</li>
          <li><span class="font-bold">Manage Files Easily:</span> Select a site and dive into the <span class="font-bold">Files tab</span> to organize your files and directories.</li>
          <li><span class="font-bold">Edit with Ease:</span> Create or open an HTML file and click on any element in the <span class="font-bold">visual HTML editor</span> to start building your site. Use keyboard shortcuts or the context menu for quick actions.</li>
        </ul>
        <div class="text-center font-bold mt-4 mb-2">New Features</div>
        <ul class="list-disc space-y-2 pl-5">
          <li><span class="font-bold">Components Support:</span> Enhance your site with reusable components.</li>
          <li><span class="font-bold">Modals:</span> Easily add and manage modals for a better user experience.</li>
          <li><span class="font-bold">Full Tailwind CSS Integration:</span> Access all Tailwind classes directly from the context menu.</li>
        </ul>
        <div class="flex justify-center mt-8 grid grid-cols-3">
          <button class="py-3 focus:ring-1 focus:ring-[#0071b2] focus:ring-offset-1 focus:ring-offset-[#0167a2] outline-none rounded-full bg-[#063e7f] text-xl px-10 col-start-2 justify-self-center transition-colors hover:bg-[#226dc4]" value="startTour">Start Tour</button>
          <button class="py-3 focus:ring-1 focus:ring-[#121d2b] focus:ring-offset-1 focus:ring-offset-[#262626] outline-none rounded-full text-xl px-10 border-2 border-[#525252] justify-self-end hover:bg-[#faf9f6] hover:text-[#121212] hover:border-transparent transition-colors" value="skipTour">Skip</button>
        </div>
      </form>
    </dialog>
  `;
}

export default WelcomeDialog;
