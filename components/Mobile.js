class Mobile {
  render = () => d.html`
    <div class="h-[50vh] bg-[#121212] text-[#faf9f6] p-6 flex flex-col">
      <div class="gfont-[Pacifico] text-4xl text-center">Webfoundry</div>
      <div class="flex-1"></div>
      <div class="text-center whitespace-pre mt-10 mb-24">The prevision visual
Tailwind CSS editor</div>
      <div class="flex-1"></div>
    </div>
    <div class="h-[50vh] bg-[#faf9f6] text-[#121212] flow-root p-3">
      <div class="max-w-xl mx-auto -mt-[calc(16vh_+_1rem)]">
        <div style="padding:56.25% 0 0 0;position:relative;">
          <iframe src="https://player.vimeo.com/video/854399081?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Get Webfoundry"></iframe>
        </div>
        <script src="https://player.vimeo.com/api/player.js"></script>
      </div>
      <div class="text-center whitespace-pre mt-8 sm:mt-20">Open this page on a desktop
browser to try it out!</div>
    </div>
  `;
}

export default Mobile;
