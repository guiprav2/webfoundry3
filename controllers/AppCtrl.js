import ActionHandler from '../other/ActionHandler.js';
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.js';
import CreateFileDialog from '../components/dialogs/CreateFileDialog.js';
import DesignerContextMenu from '../components/DesignerContextMenu.js';
import FileExtensionWarningDialog from '../components/dialogs/FileExtensionWarningDialog.js';
import ImportingDialog from '../components/dialogs/ImportingDialog.js';
import MagicGloves from '../other/MagicGloves.js';
import NetlifyDeployDialog from '../components/dialogs/NetlifyDeployDialog.js';
import NetlifyDeployDoneDialog from '../components/dialogs/NetlifyDeployDoneDialog.js';
import PromptDialog from '../components/dialogs/PromptDialog.js';
import RenameFileDialog from '../components/dialogs/RenameFileDialog.js';
import d from '../other/dominant.js';
import html2canvas from 'https://cdn.skypack.dev/html2canvas';
import morphdom from 'https://cdn.skypack.dev/morphdom/dist/morphdom-esm.js';
import rfiles from '../repositories/FilesRepository.js';
import rsites from '../repositories/SitesRepository.js';
import structuredFiles from '../other/structuredFiles.js';
import { isImage, joinPath, showModal, loadman, clearComponents, setComponents } from '../other/util.js';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';
import { runTour } from '../other/tour.js';

let playgroundHtml = `<!doctype html>
<meta charset="utf-8">
<head>
  <link class="wf-nf-link" rel="stylesheet" href="https://www.nerdfonts.com/assets/css/webfont.css">
  <script class="wf-tw-script" src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script class="wf-tw-setup">
    tailwind.config = {
      darkMode: location.href.includes('/preview/') ? 'media' : 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'hsl(222.2, 47.4%, 11.2%)',
              foreground: 'hsl(210, 40%, 98%)',
            },
            secondary: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(222.2, 47.4%, 11.2%)',
            },
            muted: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(215.4, 16.3%, 46.9%)',
            },
          },
        },
      },
    };
  </script>
  <script class="wf-gfonts-script">
    let observer = new MutationObserver(muts => {
      let gfonts = [];
      for (let mut of muts) {
        if (mut.type === 'childList') {
          for (let x of mut.addedNodes) {
            if (x.nodeType !== 1) { continue }
            for (let y of [x, ...x.querySelectorAll('*')]) {
              gfonts.push(...[...y.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
            }
          }
        } else if (mut.type === 'attributes') {
          gfonts.push(...[...mut.target.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
        }
      }

      for (let x of gfonts) {
        let id = \`gfont-[\${x}]\`;
        let style = document.getElementById(id);
        if (style) { continue }
        style = document.createElement('style');
        style.id = id;
        style.textContent = \`
          @import url('https://fonts.googleapis.com/css2?family=\${x.replace(/_/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          .gfont-\\\\[\${x}\\\\] { font-family: "\${x.replace(/_/g, ' ')}" }
        \`;
        document.head.append(style);
      }
    });

    observer.observe(document, { attributes: true, childList: true, subtree: true });
  </script>
  <style class="wf-preflight">
    [hidden] { display: none !important }
  </style>
</head>
<body class="min-h-screen" style="background-image: url('http://playground.webflow.com/playground/img/page-bg.png')">
  <div class="bg-[#121212] text-[#faf9f6] gfont-[Bitter]">
    <div class="max-w-5xl mx-auto px-3 py-16 sm:py-24">
      <h1 class="gfont-[Pacifico] text-3xl">
        Webfoundry
      </h1>
      <h1 class="mt-2 gfont-[Changa_One] text-5xl sm:text-6xl">
        Tailwind CSS Playground
      </h1>
      <div class="gfont-[Changa_One] text-2xl mt-8">
        Instructions
      </div>
      <ul class="flex flex-col gap-3 mt-4">
        <li class="flex items-center gap-3">
          <div class="rounded-full bg-[#faf9f6] text-[#121212] flex justify-center items-center gfont-[Changa_One] size-8 shrink-0">
            1
          </div>
          <div>
            <span>
              Check out our examples.
            </span>
            <span class="italic">
              All designed in Webfoundry.
            </span>
          </div>
        </li>
        <li class="flex items-center gap-3">
          <div class="rounded-full bg-[#faf9f6] text-[#121212] flex justify-center items-center gfont-[Changa_One] size-8 shrink-0">
            2
          </div>
          <div>
            <span>
              Select any element and style it from the
            </span>
            <span class="font-bold">
              Styles tab
            </span>
            <span class="nf nf-fa-paint_brush font-bold"></span>
          </div>
        </li>
        <li class="flex items-center gap-3">
          <div class="rounded-full bg-[#faf9f6] text-[#121212] flex justify-center items-center gfont-[Changa_One] size-8 shrink-0">
            3
          </div>
          <div class="">
            Use the nodge on the far-right corner to resize this page to different screen sizes.
          </div>
        </li>
        <li class="flex items-center gap-3">
          <div class="rounded-full bg-[#faf9f6] text-[#121212] flex justify-center items-center gfont-[Changa_One] size-8 shrink-0">
            4
          </div>
          <div>
            <span>
              Go to the
            </span>
            <span class="font-bold">
              Actions panel
            </span>
            <span class="nf nf-fa-hand"></span>
            <span>
              and click
            </span>
            <span class="font-bold">
              HTML &gt; Change HTML
            </span>
            <span>
              to view the generated code for any element.
            </span>
          </div>
        </li>
        <li class="flex items-center gap-3">
          <div class="rounded-full bg-[#faf9f6] text-[#121212] flex justify-center items-center size-8 shrink-0 nf nf-fa-face_smile"></div>
          <div>
            <span>
              Deploy to Netlify using
            </span>
            <span class="font-bold">
              Import, Export &amp; Deploy &gt; Deploy to Netlify
            </span>
            <span>
              and share your creations with friends!
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="h-2" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
  <div>
    <div class="max-w-5xl mx-auto px-3 pt-24">
      <h2 class="text-4xl">
        Buttons
      </h2>
      <div class="mt-4 grid sm:grid-cols-2 gap-4">
        <div class="flex flex-col items-center gap-3">
          <div class="bg-white rounded-lg border border-neutral-300 shadow p-8 flex justify-center items-center w-full">
            <button class="px-8 py-3 rounded-md bg-sky-600 text-white outline-none h-16 shadow-xl">
              Example Button
            </button>
          </div>
          <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none wf-view-html">
            <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
            <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
              View / Change HTML
            </div>
          </button>
        </div>
        <div class="flex flex-col items-center gap-3">
          <div class="bg-white rounded-lg border border-neutral-300 shadow p-8 flex justify-center items-center w-full">
            <button class="px-8 py-3 rounded-md text-white outline-none bg-green-600 flex items-center gap-3 h-16 shadow-xl">
              <div class="nf nf-fa-shop text-3xl"></div>
              Shop Now
            </button>
          </div>
          <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none wf-view-html">
            <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
            <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
              View / Change HTML
            </div>
          </button>
        </div>
      </div>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Typography
      </h2>
      <div class="mt-4 grid sm:grid-cols-2 gap-4">
        <div class="max-w-[calc(100vw_-_1.5rem)]">
          <div class="bg-white border border-neutral-300 rounded-lg p-6">
            <div class="px-6 py-4 bg-orange-600 text-white uppercase inline-block gfont-[Oswald]">
              Breaking News
            </div>
            <div class="mt-4 gfont-[Bitter] font-semibold text-4xl sm:text-6xl">
              Federal Agents Raid Gunshop, Find Weapons
            </div>
            <div class="mt-4 font-semibold gfont-[Droid_Serif] text-gray-900">
              Store owner Steve Witmere previously arrested for blackmarket bazooka trading. Confesses to involvement in Russian mafia.
            </div>
            <div class="mt-4 gfont-[Droid_Serif] text-gray-900 text-sm">
              Among the numerous bazookas found in the gunshop were tens of thousands of illegally obtained paintings valued at at least $10,000. Thats a heavy price to pay for these dumb paintings.
            </div>
            <div class="mt-4 gfont-[Droid_Serif] text-gray-900 text-sm">
              Following the raid, which lasted 12 hours, FBI director Jesse Sanderman made this statment, “This is the biggest bazooka and stolen painting bust since 2009. We’re still on the look out for a fugitive under the pseudonym ‘Mountain Man’. Our sources say he’s connected to a painting smuggling ring. It seems he was the pervious owner of these crummy stolen paintings.”
            </div>
          </div>
          <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-4 wf-view-html">
            <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
            <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
              View / Change HTML
            </div>
          </button>
        </div>
        <div class="max-w-[calc(100vw_-_1.5rem)]">
          <div class="border border-neutral-300 rounded-lg px-4 pb-8 bg-neutral-800">
            <div class="h-72 bg-cover m-8 flex justify-center items-center gfont-[Tahoma] whitespace-pre text-center font-bold text-[#c2b385] text-5xl sm:text-7xl" style="background-image: url(&quot;http://playground.webflow.com/playground/img/mountains.png&quot;);">Lakewood
  Stout</div>
            <div class="text-center text-3xl text-neutral-100 gfont-[Great_Vibes]">
              The Dark Beer of Lakewood, Colorado
            </div>
            <div class="text-center my-4 text-sm text-[#c2b385]">
              The legendary stout was born out of the beautiful matrimony of a mountain man and his most beloved thing, the city of Lakewood in Colorado. The mountain man also loved his axe and his single-shot Remington rifle, but not as much as he loved his city. He dreamed of her flowy rivers and majestic mountains. So he named his greatest stout after her. Thus the glorious stout was birthed out of a mountain man’s heart.
            </div>
            <div class="text-center whitespace-pre-wrap px-12 gfont-[Georgia] text-xl italic text-[#c2b385]">"I crafted this glorious beer to express my undying love for my beautiful city."<div class="not-italic text-sm">— MOUNTAIN MAN</div></div>
          </div>
          <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-4 wf-view-html">
            <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
            <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
              View / Change HTML
            </div>
          </button>
        </div>
      </div>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Images
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mt-6">
        <div class="bg-white border border-neutral-300 shadow p-3 hover:-translate-y-2 transition-all">
          <img class="w-full max-h-[30vh] object-cover" src="http://playground.webflow.com/playground/img/cat-1.jpg">
          <div class="mt-3">
            i are not like teh pics
          </div>
          <div class="text-sm italic text-neutral-600">
            by Blake Engart
          </div>
        </div>
        <div class="bg-white border border-neutral-300 shadow p-3 hover:-translate-y-2 transition-all">
          <img class="w-full max-h-[30vh]" src="http://playground.webflow.com/playground/img/cat-2.jpg">
          <div class="mt-3">
            Ermahgerd percters!!
          </div>
          <div class="text-sm italic text-neutral-600">
            by Christine Quigbey
          </div>
        </div>
        <div class="bg-white border border-neutral-300 shadow p-3 hover:-translate-y-2 transition-all">
          <img class="w-full max-h-[30vh]" src="http://playground.webflow.com/playground/img/cat-3.jpg">
          <div class="mt-3">
            OH NOZ
          </div>
          <div class="text-sm italic text-neutral-600">
            by Ben Bradshwing
          </div>
        </div>
        <div class="bg-white border border-neutral-300 shadow p-3 hover:-translate-y-2 transition-all">
          <img class="w-full max-h-[30vh]" src="http://playground.webflow.com/playground/img/cat-4.jpg">
          <div class="mt-3">
            my kitty Lakewood
          </div>
          <div class="text-sm italic text-neutral-600">
            by Mountain Man
          </div>
        </div>
      </div>
      <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-4 wf-view-html">
        <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
        <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
          View / Change HTML
        </div>
      </button>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Responsive Columns
      </h2>
      <div class="grid gap-4 md:grid-cols-3 mt-6">
        <div class="bg-white rounded from-red-200 to-white bg-gradient-to-b p-6 border border-red-300 shadow">
          <img class="mx-auto max-h-[30vh]" src="http://playground.webflow.com/playground/img/design.png">
          <div class="text-3xl mt-4 text-red-500">
            Design
          </div>
          <div class="mt-4">
            <span>
              Use the mouse to select elements visually and the keyboard arrows for precision navigation of the document tree. Add Tailwind classes using the
            </span>
            <span class="font-bold">
              Styles panel
            </span>
            <span class="nf nf-fa-paint_brush"></span>
            <span>
              to immediately see your changes in the canvas.
            </span>
          </div>
        </div>
        <div class="bg-white rounded to-white bg-gradient-to-b p-6 border shadow from-blue-200 border-blue-300">
          <img class="mx-auto max-h-[30vh]" src="http://playground.webflow.com/playground/img/export.png">
          <div class="text-center text-3xl mt-4 text-blue-500">
            Export
          </div>
          <div class="mt-4">
            <span>
              Go to the
            </span>
            <span class="font-bold">
              Actions panel
            </span>
            <span class="nf nf-fa-hand"></span>
            <span>
              and select
            </span>
            <span class="font-bold">
              Import, Export, and Deploy &gt; Export as ZIP
            </span>
            <span>
              and Webfoundry will generate streamlined HTML &amp; Tailwind CSS just like a developer would write.
            </span>
          </div>
        </div>
        <div class="bg-white rounded to-white bg-gradient-to-b p-6 border shadow from-green-200 border-green-300">
          <img class="mx-auto max-h-[30vh]" src="http://playground.webflow.com/playground/img/launch.png">
          <div class="text-center text-3xl mt-4 text-green-500">
            Launch
          </div>
          <div class="mt-4">
            <span>
              Go to the
            </span>
            <span class="font-bold">
              Actions panel
            </span>
            <span class="nf nf-fa-hand"></span>
            <span>
              and select
            </span>
            <span class="font-bold">
              Import, Export, and Deploy &gt; Deploy to Netlify
            </span>
            <span>
              and enter your site ID and API key to automatically deploy the site to Netlify. Easy!
            </span>
          </div>
        </div>
      </div>
      <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-4 wf-view-html">
        <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
        <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
          View / Change HTML
        </div>
      </button>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Newsletter Form
      </h2>
      <div class="mt-6 bg-white rounded-lg shadow-xl border border-neutral-300 p-3" style="background-image: url(&quot;http://playground.webflow.com/playground/img/newsletter-bg1.png&quot;);">
        <div style="background-image: url(&quot;http://playground.webflow.com/playground/img/newsletter-stripes.png&quot;);" class="h-2"></div>
        <div class="bg-no-repeat bg-right-top my-8 flow-root px-4 sm:px-12 bg-[length:auto_70px] md:bg-[length:auto_125px]" style="background-image: url(&quot;http://playground.webflow.com/playground/img/newsletter-stamp.png&quot;);">
          <div class="gfont-[Droid_Serif] text-3xl text-neutral-700 mt-4">
            Join our Newsletter
          </div>
          <div class="mt-4 max-w-xl">
            Lakewood Stout Co is all about sending to our brohams and lady-friends. Join now and we’ll gift you a wonderful weekly email.
          </div>
          <div class="flex gap-4 mt-4 flex-col md:flex-row">
            <input class="px-4 py-3 outline-none rounded border border-neutral-300 shadow" placeholder="Name">
            <input class="px-4 py-3 outline-none rounded border border-neutral-300 shadow" placeholder="Email Address">
            <button class="px-4 py-3 outline-none rounded border border-neutral-300 shadow bg-gradient-to-b to-blue-500 from-blue-400 text-white whitespace-nowrap">
              Join Now
            </button>
          </div>
        </div>
        <div style="background-image: url(&quot;http://playground.webflow.com/playground/img/newsletter-stripes.png&quot;);" class="h-2"></div>
      </div>
      <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-4 wf-view-html">
        <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
        <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
          View / Change HTML
        </div>
      </button>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Sign In Window
      </h2>
      <div class="mt-6 rounded-lg bg-cover flex justify-center items-center border border-neutral-300 py-24 px-3 sm:px-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/signin-bg.jpg&quot;);">
        <div class="w-96 rounded-md overflow-hidden text-white shadow border ring-px ring-neutral-800/50 border-neutral-600/80">
          <div class="text-center py-2 backdrop-blur-sm border-b border-neutral-800/50 bg-black/40">
            Sign In
          </div>
          <div class="bg-black/20 backdrop-blur-sm flex border-t border-neutral-600/80 flex-col sm:flex-row">
            <div class="space-y-2 p-4 border-neutral-800/50 sm:border-r">
              <div class="flex flex-col gap-2">
                <label class="px-4 py-2 flex items-center gap-3 border border-neutral-600 rounded sm:w-48 bg-black/40">
                  <div class="nf nf-fa-user"></div>
                  <input class="outline-none bg-transparent w-full" placeholder="Username">
                </label>
                <label class="px-4 py-2 flex items-center gap-3 border border-neutral-600 rounded sm:w-48 bg-black/40">
                  <div class="nf nf-md-lock"></div>
                  <input class="outline-none bg-transparent w-full" placeholder="Password">
                </label>
              </div>
              <div class="text-sm text-neutral-300 hover:text-neutral-100 transition-colors">
                Forgot your password?
              </div>
              <button class="px-4 py-2 gap-3 rounded outline-none w-full bg-gradient-to-b to-pink-900/80 from-pink-700/80 hover:from-pink-700/80 hover:to-pink-800/80">
                Sign In
              </button>
            </div>
            <div class="flex-1 flex flex-col gap-3 p-4 items-center justify-center border-neutral-600/80 sm:border-l border-t sm:border-t-0">
              <div class="text-sm italic">
                Or login with:
              </div>
              <button class="px-4 py-2 flex items-center gap-3 rounded bg-blue-700 outline-none w-full hover:bg-blue-800 transition-colors">
                <div class="nf nf-fa-facebook_f"></div>
                <div>
                  Facebook
                </div>
              </button>
              <button class="px-4 py-2 flex items-center gap-3 rounded outline-none w-full bg-blue-500 hover:bg-blue-600 transition-colors">
                <div class="nf nf-cod-twitter"></div>
                <div>
                  Twitter
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-4 wf-view-html">
        <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
        <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
          View / Change HTML
        </div>
      </button>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Transitions
      </h2>
      <div class="mt-6 grid gap-20 md:grid-cols-4 sm:grid-cols-2 pr-10">
        <div>
          <div class="relative group">
            <div class="left-0 top-0 absolute w-full h-full p-4">
              <img class="aspect-square transition-all translate-x-14 group-hover:translate-x-20" src="http://playground.webflow.com/playground/img/transitions-vinyl.png">
            </div>
            <img class="aspect-square relative rounded shadow-xl" src="http://playground.webflow.com/playground/img/transitions-clogs.png">
            <div class="absolute left-0 top-0 w-full h-full flex justify-center items-center">
              <div class="text-white rounded-full bg-gradient-to-b size-16 justify-center items-center border border-neutral-300/50 to-neutral-900/90 backdrop-blur-sm text-2xl opacity-0 group-hover:opacity-100 transition-all flex from-neutral-700/90">
                <div class="nf nf-fa-play relative left-1"></div>
              </div>
            </div>
          </div>
          <div class="mt-6 font-bold">
            Last Song
          </div>
          <div class="italic text-neutral-600">
            Clogs
          </div>
        </div>
        <div>
          <div class="relative group">
            <div class="left-0 top-0 absolute w-full h-full p-4">
              <img class="aspect-square transition-all translate-x-14 group-hover:translate-x-20" src="http://playground.webflow.com/playground/img/transitions-vinyl.png">
            </div>
            <img class="aspect-square relative rounded shadow-xl" src="http://playground.webflow.com/playground/img/transitions-gallows.png">
            <div class="absolute left-0 top-0 w-full h-full flex justify-center items-center">
              <div class="text-white rounded-full bg-gradient-to-b size-16 justify-center items-center border border-neutral-300/50 to-neutral-900/90 backdrop-blur-sm text-2xl opacity-0 group-hover:opacity-100 transition-all flex from-neutral-700/90">
                <div class="nf nf-fa-play relative left-1"></div>
              </div>
            </div>
          </div>
          <div class="mt-6 font-bold">
            Belly of the Sharks
          </div>
          <div class="italic text-neutral-600">
            Gallows
          </div>
        </div>
        <div>
          <div class="relative group">
            <div class="left-0 top-0 absolute w-full h-full p-4">
              <img class="aspect-square transition-all translate-x-14 group-hover:translate-x-20" src="http://playground.webflow.com/playground/img/transitions-vinyl.png">
            </div>
            <img class="aspect-square relative rounded shadow-xl" src="http://playground.webflow.com/playground/img/transitions-vhs.png">
            <div class="absolute left-0 top-0 w-full h-full flex justify-center items-center">
              <div class="text-white rounded-full bg-gradient-to-b size-16 justify-center items-center border border-neutral-300/50 to-neutral-900/90 backdrop-blur-sm text-2xl opacity-0 group-hover:opacity-100 transition-all flex from-neutral-700/90">
                <div class="nf nf-fa-play relative left-1"></div>
              </div>
            </div>
          </div>
          <div class="mt-6 font-bold">
            Bring on the Comets
          </div>
          <div class="italic text-neutral-600">
            VHS or Beta
          </div>
        </div>
        <div>
          <div class="relative group">
            <div class="left-0 top-0 absolute w-full h-full p-4">
              <img class="aspect-square transition-all translate-x-14 group-hover:translate-x-20" src="http://playground.webflow.com/playground/img/transitions-vinyl.png">
            </div>
            <img class="aspect-square relative rounded shadow-xl" src="http://playground.webflow.com/playground/img/transitions-apparat.png">
            <div class="absolute left-0 top-0 w-full h-full flex justify-center items-center">
              <div class="text-white rounded-full bg-gradient-to-b size-16 justify-center items-center border border-neutral-300/50 to-neutral-900/90 backdrop-blur-sm text-2xl opacity-0 group-hover:opacity-100 transition-all flex from-neutral-700/90">
                <div class="nf nf-fa-play relative left-1"></div>
              </div>
            </div>
          </div>
          <div class="mt-6 font-bold">
            Song of Los
          </div>
          <div class="italic text-neutral-600">
            Apparat
          </div>
        </div>
      </div>
      <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-8 wf-view-html">
        <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
        <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
          View / Change HTML
        </div>
      </button>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Product Grid
      </h2>
      <div class="mt-6 grid lg:grid-cols-6 grid-cols-2 sm:gap-8 gap-3 sm:grid-cols-3">
        <div class="bg-white rounded shadow border border-neutral-300 group p-5">
          <img class="mx-auto h-[40vh] relative group-hover:-translate-y-2 transition-all drop-shadow-lg" src="http://playground.webflow.com/playground/img/product-1.png">
          <div class="mt-6 text-center">
            Takeover
          </div>
          <div class="flex justify-center mt-2">
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-neutral-400"></div>
          </div>
          <div class="text-center font-bold mt-4">
            $142.95
          </div>
          <button class="block w-full rounded-full mt-2 border border-neutral-400 from-white bg-gradient-to-b to-neutral-200 py-2 hover:to-neutral-300 px-2">
            Buy Now
          </button>
        </div>
        <div class="bg-white rounded shadow border border-neutral-300 group p-5">
          <img class="mx-auto h-[40vh] relative group-hover:-translate-y-2 transition-all drop-shadow-lg" src="http://playground.webflow.com/playground/img/product-2.png">
          <div class="mt-6 text-center">
            Hammer
          </div>
          <div class="flex justify-center mt-2">
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-neutral-400"></div>
          </div>
          <div class="text-center font-bold mt-4">
            $144.95
          </div>
          <button class="block w-full rounded-full mt-2 border border-neutral-400 from-white bg-gradient-to-b to-neutral-200 py-2 hover:to-neutral-300 px-2">
            Buy Now
          </button>
        </div>
        <div class="bg-white rounded shadow border border-neutral-300 group p-5">
          <img class="mx-auto h-[40vh] relative group-hover:-translate-y-2 transition-all drop-shadow-lg" src="http://playground.webflow.com/playground/img/product-3.png">
          <div class="mt-6 text-center">
            Grease Shark
          </div>
          <div class="flex justify-center mt-2">
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-neutral-400"></div>
          </div>
          <div class="text-center font-bold mt-4">
            $139.95
          </div>
          <button class="block w-full rounded-full mt-2 border border-neutral-400 from-white bg-gradient-to-b to-neutral-200 py-2 hover:to-neutral-300 px-2">
            Buy Now
          </button>
        </div>
        <div class="bg-white rounded shadow border border-neutral-300 group p-5">
          <img class="mx-auto h-[40vh] relative group-hover:-translate-y-2 transition-all drop-shadow-lg" src="http://playground.webflow.com/playground/img/product-4.png">
          <div class="mt-6 text-center">
            Voodoo Doll
          </div>
          <div class="flex justify-center mt-2">
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-neutral-400"></div>
          </div>
          <div class="text-center font-bold mt-4">
            $129.95
          </div>
          <button class="block w-full rounded-full mt-2 border border-neutral-400 from-white bg-gradient-to-b to-neutral-200 py-2 hover:to-neutral-300 px-2">
            Buy Now
          </button>
        </div>
        <div class="bg-white rounded shadow border border-neutral-300 group p-5">
          <img class="mx-auto h-[40vh] relative group-hover:-translate-y-2 transition-all drop-shadow-lg" src="http://playground.webflow.com/playground/img/product-5.png">
          <div class="mt-6 text-center">
            Voodoo D2
          </div>
          <div class="flex justify-center mt-2">
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-neutral-400"></div>
          </div>
          <div class="text-center font-bold mt-4">
            $139.95
          </div>
          <button class="block w-full rounded-full mt-2 border border-neutral-400 from-white bg-gradient-to-b to-neutral-200 py-2 hover:to-neutral-300 px-2">
            Buy Now
          </button>
        </div>
        <div class="bg-white rounded shadow border border-neutral-300 group p-5">
          <img class="mx-auto h-[40vh] relative group-hover:-translate-y-2 transition-all drop-shadow-lg" src="http://playground.webflow.com/playground/img/product-6.png">
          <div class="mt-6 text-center">
            Voodoo XI
          </div>
          <div class="flex justify-center mt-2">
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-yellow-500"></div>
            <div class="nf nf-fa-star text-neutral-400"></div>
          </div>
          <div class="text-center font-bold mt-4">
            $149.95
          </div>
          <button class="block w-full rounded-full mt-2 border border-neutral-400 from-white bg-gradient-to-b to-neutral-200 py-2 hover:to-neutral-300 px-2">
            Buy Now
          </button>
        </div>
      </div>
      <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto mt-8 wf-view-html">
        <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
        <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
          View / Change HTML
        </div>
      </button>
      <div class="h-2 my-24" style="background-image: url(&quot;http://playground.webflow.com/playground/img/page-divider.png&quot;);"></div>
      <h2 class="text-4xl">
        Complex Footer
      </h2>
    </div>
    <div class="border-t border-neutral-400 mt-8 border-b">
      <div class="h-[100px] flex flex-col justify-end" style="background-image: url(&quot;http://playground.webflow.com/playground/img/footer-bg-stripes.jpg&quot;);">
        <div style="background-image: url(&quot;http://playground.webflow.com/playground/img/footer-stitch.png&quot;);"></div>
      </div>
      <div class="bg-cover" style="background-image: url(&quot;http://playground.webflow.com/playground/img/footer-bg-dark.jpg&quot;);">
        <div class="flex flex-col items-center bg-cover" style="background-image: url(&quot;http://playground.webflow.com/playground/img/footer-bg.png&quot;);">
          <img class="w-32 -mt-16 relative -top-2" src="http://playground.webflow.com/playground/img/footer-emblem.png">
          <div class="w-screen max-w-5xl grid sm:grid-cols-4 mt-4 text-center sm:text-left space-y-4 sm:space-y-0 px-8 gap-3">
            <div>
              <div class="uppercase text-neutral-300 text-xl gfont-[Oswald]">
                Main Pages
              </div>
              <div class="space-y-2 mt-4">
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Home Sweet Home
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Our Stocked Beers
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Majestic Brew Masters
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Our Story
                </div>
              </div>
            </div>
            <div>
              <div class="uppercase text-neutral-300 text-xl gfont-[Oswald]">
                Our Story
              </div>
              <div class="space-y-2 mt-4">
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  A Man is Born
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  The Hard Hike Up
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Mountain Hops
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  The First Batch
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Stolen Paintings
                </div>
              </div>
            </div>
            <div>
              <div class="uppercase text-neutral-300 text-xl gfont-[Oswald]">
                Glorious Beers
              </div>
              <div class="space-y-2 mt-4">
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Lakewood Stout
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Lakewood Porter
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Lakewood IPA
                </div>
                <div class="hover:text-[#D4CEBC] text-[#949083]">
                  Lakewood Irish Red
                </div>
              </div>
            </div>
            <div>
              <div class="uppercase text-neutral-300 text-xl gfont-[Oswald]">
                Our Beer News
              </div>
              <input class="min-h-[16px] bg-black/40 px-4 py-2 mt-4 outline-none border border-neutral-600 w-full" placeholder="Your email">
              <button class="min-h-[16px] px-4 py-2 bg-[#988e68] text-white rounded mt-4">
                OK
              </button>
            </div>
          </div>
          <div class="gfont-[Tahoma] font-bold uppercase text-3xl text-[#c2b385] mt-8">
            Lakewood Stout Co.
          </div>
          <div class="font-bold text-[#c2b385] gfont-[Great_Vibes] text-neutral-100 mt-2 text-2xl mb-4">
            "Shut up and drink."
          </div>
        </div>
      </div>
    </div>
    <button class="rounded-lg border border-gray-300 flex overflow-hidden justify-self-center outline-none mx-auto my-8 wf-view-html">
      <div class="w-10 flex justify-center items-center nf nf-fa-code bg-sky-600 text-white"></div>
      <div class="font-bold text-gray-600 px-4 py-2 row-start-2">
        View / Change HTML
      </div>
    </button>
  </div>
</body>`;

let defaultHtml = `<!doctype html>
<meta charset="utf-8">
<head>
  <link class="wf-nf-link" rel="stylesheet" href="https://www.nerdfonts.com/assets/css/webfont.css">
  <script class="wf-tw-script" src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script class="wf-tw-setup">
    tailwind.config = {
      darkMode: location.href.includes('/preview/') ? 'media' : 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'hsl(222.2, 47.4%, 11.2%)',
              foreground: 'hsl(210, 40%, 98%)',
            },
            secondary: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(222.2, 47.4%, 11.2%)',
            },
            muted: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(215.4, 16.3%, 46.9%)',
            },
          },
        },
      },
    };
  </script>
  <script class="wf-gfonts-script">
    let observer = new MutationObserver(muts => {
      let gfonts = [];
      for (let mut of muts) {
        if (mut.type === 'childList') {
          for (let x of mut.addedNodes) {
            if (x.nodeType !== 1) { continue }
            for (let y of [x, ...x.querySelectorAll('*')]) {
              gfonts.push(...[...y.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
            }
          }
        } else if (mut.type === 'attributes') {
          gfonts.push(...[...mut.target.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
        }
      }

      for (let x of gfonts) {
        let id = \`gfont-[\${x}]\`;
        let style = document.getElementById(id);
        if (style) { continue }
        style = document.createElement('style');
        style.id = id;
        style.textContent = \`
          @import url('https://fonts.googleapis.com/css2?family=\${x.replace(/_/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          .gfont-\\\\[\${x}\\\\] { font-family: "\${x.replace(/_/g, ' ')}" }
        \`;
        document.head.append(style);
      }
    });

    observer.observe(document, { attributes: true, childList: true, subtree: true });
  </script>
  <style class="wf-preflight">
    [hidden] { display: none !important }
    .component-pattern {
      background-color: #06c;
      background-image: linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px),
        linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
      background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
      background-position:-2px -2px, -2px -2px, -1px -1px, -1px -1px;
    }
  </style>
</head>
<body class="min-h-screen">
  <div class="p-16 text-center font-sm italic">Page intentionally left blank.</div>
</body>`;

let defaultComponentHtml = `<!doctype html>
<meta charset="utf-8">
<head>
  <link class="wf-nf-link" rel="stylesheet" href="https://www.nerdfonts.com/assets/css/webfont.css">
  <script class="wf-tw-script" src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script class="wf-tw-setup">
    tailwind.config = {
      darkMode: location.href.includes('/preview/') ? 'media' : 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'hsl(222.2, 47.4%, 11.2%)',
              foreground: 'hsl(210, 40%, 98%)',
            },
            secondary: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(222.2, 47.4%, 11.2%)',
            },
            muted: {
              DEFAULT: 'hsl(210, 40%, 96.1%)',
              foreground: 'hsl(215.4, 16.3%, 46.9%)',
            },
          },
        },
      },
    };
  </script>
  <script class="wf-gfonts-script">
    let observer = new MutationObserver(muts => {
      let gfonts = [];
      for (let mut of muts) {
        if (mut.type === 'childList') {
          for (let x of mut.addedNodes) {
            if (x.nodeType !== 1) { continue }
            for (let y of [x, ...x.querySelectorAll('*')]) {
              gfonts.push(...[...y.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
            }
          }
        } else if (mut.type === 'attributes') {
          gfonts.push(...[...mut.target.classList].filter(x => x.match(/^gfont-\\[.+?\\]$/)).map(x => x.slice('gfont-['.length, -1)));
        }
      }

      for (let x of gfonts) {
        let id = \`gfont-[\${x}]\`;
        let style = document.getElementById(id);
        if (style) { continue }
        style = document.createElement('style');
        style.id = id;
        style.textContent = \`
          @import url('https://fonts.googleapis.com/css2?family=\${x.replace(/_/g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          .gfont-\\\\[\${x}\\\\] { font-family: "\${x.replace(/_/g, ' ')}" }
        \`;
        document.head.append(style);
      }
    });

    observer.observe(document, { attributes: true, childList: true, subtree: true });
  </script>
  <style class="wf-preflight">
    [hidden] { display: none !important }
  </style>
  <style class="wf-component-preflight">
    body{
      background-color: #06c;
      background-image: linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px),
        linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
      background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
      background-position:-2px -2px, -2px -2px, -1px -1px, -1px -1px;
    }
  </style>
</head>
<body class="flex justify-center items-center min-h-screen">
  <div class="border border-neutral-200 rounded-md bg-white shadow-xl">
    <div class="p-16 text-center font-sm italic">Component intentionally left blank.</div>
  </div>
</body>`;

class AppCtrl {
  state = {
    enabledSidebarIcons: {
      wf: true,
      sites: true,
      files: () => !!this.state.currentSite,
      styles: () => !this.state.preview && this.state.s,
      actions: () => !this.state.preview && this.state.s,
      play: () => this.state.currentFile?.match?.(/^pages\/.+\.html$/) && !this.state.preview,
      pause: () => this.state.preview,
    },

    currentPanel: 'wf',
    sites: [],
    currentSite: null,
    files: [],
    expandedPaths: new Set(['pages/']),

    expandedPath: path => {
      if (!path) { return true }
      let paths = [];
      let currentPath = '';
      for (let part of path.split('/').slice(0, -1)) {
        currentPath += `${part}/`;
        paths.push(currentPath);
      }
      return paths.every(x => this.state.expandedPaths.has(x));
    },

    currentFile: null,
    designerWidth: '100%',
    designerHeight: '100vh',
    preview: false,

    buildFrameSrc: () => {
      if (!this.state.currentSite || !this.state.currentFile) { return '' }
      let src = `${this.state.preview ? 'preview' : 'files'}/${this.state.currentSite}/${!this.state.preview ? this.state.currentFile : this.state.currentFile.replace('pages/', '')}`
      if (this.state.qsPreview) { src += `?${this.state.qsPreview}` }
      return src;
    },

    hasActionHandler: key => this.state.actions && Boolean(this.state.actions.kbds[key]),
    s: null,

    get styles() {
      let { s } = this;

      if (s instanceof Set) {
        return [...[...s].map(x => new Set([...x.classList, ...getWfClass(x)])).reduce((a, b) => a.intersection(b))];
      } else {
        let styles = s ? [...s.classList] : [];
        if (s.tagName === 'BODY' && styles.includes('min-h-screen')) { styles.splice(styles.indexOf('min-h-screen'), 1) }
        s && styles.push(...getWfClass(s));
        return styles;
      }
    },

    tourDisable: new Set(),
  };

  actions = {
    reset: async () => {
      await post('app.loadSites');

      let url = new URL(location.href);
      if (url.searchParams.get('import')) {
        history.replaceState(null, '', location.href.split('?')[0]);
        await post('app.importZipFromUrl', url.searchParams.get('import'));
      }
    },

    tourDisable: (...xs) => xs.forEach(x => this.state.tourDisable.add(x)),
    tourEnable: (...xs) => xs.forEach(x => this.state.tourDisable.delete(x)),
    clearTourDisable: () => this.state.tourDisable = new Set(),

    selectIcon: x => {
      this.state.prevPanel = null;
      if (x !== 'play' && x !== 'pause') { this.state.currentPanel = x } else { post('app.togglePreview') }
    },

    togglePreview: () => {
      this.state.preview = !this.state.preview;
      if (this.state.preview) {
        post('app.changeSelected', null);
        if (this.state.currentPanel === 'styles') { this.state.currentPanel = 'files' }
      }
    },

    loadSites: async () => {
      if (loadman.has('app.loadSites')) { return }

      try {
        loadman.add('app.loadSites');
        this.state.sites = await rsites.loadSites();
      } finally {
        loadman.rm('app.loadSites');
      }
    },

    createSite: async () => {
      let [btn, x] = await showModal(d.el(PromptDialog, { title: 'Create site', placeholder: 'Site name', allowEmpty: false }));
      if (btn !== 'ok') { return }
      let id = await post('app.doCreateSite', x);
      await post('app.selectFile', 'pages/index.html');
      return id;
    },

    doCreateSite: async x => {
      let id = crypto.randomUUID();
      await rsites.saveSite(id, { name: x });
      await post('app.injectBuiltins', id, true, true);
      await post('app.loadSites');
      await post('app.selectSite', id);
      await post('app.generateReflections');
      return id;
    },

    selectSite: async x => {
      try {
        loadman.add('app.selectSite');
        this.state.currentSite = x;
        this.state.currentFile = null;
        this.state.replacingStyle = null;
        this.state.preview = false;
        await post('app.changeSelected', null);
        await post('app.injectBuiltins', x);
        await post('app.loadFiles');
        await post('app.selectIcon', 'files');
      } finally {
        loadman.rm('app.selectSite');
      }
    },

    renameSite: async x => {
      let [btn, name] = await showModal(d.el(PromptDialog, { title: 'Rename site', placeholder: 'Site name', allowEmpty: false, initialValue: this.state.sites.find(y => y.id === x).name }));
      if (btn !== 'ok') { return }
      rsites.saveSite(x, { ...rsites.loadSite(x), name });
      post('app.loadSites');
    },

    deleteSite: async x => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { title: 'Delete site?' }));
      if (btn !== 'yes') { return }
      await Promise.all((await rfiles.loadFiles(x)).map(y => rfiles.deleteFile(x, y)));
      rsites.deleteSite(x);
      if (this.state.currentSite === x) { this.state.currentSite = this.state.currentFile = this.state.replacingClass = null; await post('app.changeSelected', null) }
      await post('app.loadSites');
    },

    injectBuiltins: async (id, wf, firstTime) => {
      let files = Object.fromEntries(await Promise.all([
        'webfoundry/app.js',
        'webfoundry/dominant.js',
        'index.html',
      ].map(async x => [x, await fetchFile(`builtin/${x}`)])));

      await rfiles.saveFile(id, 'components/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'controllers/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'images/.keep', new Blob([''], { type: 'text/plain' }));
      await rfiles.saveFile(id, 'pages/.keep', new Blob([''], { type: 'text/plain' }));
      for (let [k, v] of Object.entries(files)) { await rfiles.saveFile(id, k, v) }

      if (wf) {
        await rfiles.saveFile(id, 'webfoundry/templates.json', new Blob(['{}'], { type: 'application/json' }));
        await rfiles.saveFile(id, 'webfoundry/scripts.json', new Blob(['[]'], { type: 'application/json' }));
      }

      if (firstTime) { await rfiles.saveFile(id, 'pages/index.html', new Blob([playgroundHtml], { type: 'text/html' })) }
    },

    generateReflections: async () => {
      let templ = {};
      let files = await rfiles.loadFiles(this.state.currentSite);
      for (let x of files.filter(x => x.endsWith('.html'))) { templ[x] = await (await rfiles.loadFile(this.state.currentSite, x)).text() }
      await rfiles.saveFile(this.state.currentSite, 'webfoundry/templates.json', new Blob([JSON.stringify(templ)], { type: 'application/json' }));
      let scripts = files.filter(x => x.endsWith('.js'));
      await rfiles.saveFile(this.state.currentSite, 'webfoundry/scripts.json', new Blob([JSON.stringify(scripts)], { type: 'application/json' }));
    },

    loadFiles: async () => {
      let files = await rfiles.loadFiles(this.state.currentSite);
      this.state.files = structuredFiles(files.filter(x => localStorage.getItem('webfoundry:showInternal') || (!x.startsWith('webfoundry/') && x !== 'index.html')));
    },

    selectFile: async (x, isDir) => {
      if (isDir) {
        let path = x + '/';
        if (this.state.expandedPaths.has(path)) { this.state.expandedPaths.delete(path) } else { this.state.expandedPaths.add(path) }
      } else {
        this.state.currentFile = this.state.replacingStyle = null;
        await d.update();
        await post('app.changeSelected', null);
        if (!isImage(x) && !x.endsWith('.html')) { let blob = await rfiles.loadFile(this.state.currentSite, x); this.state.editorText = await blob.text() }
        this.state.currentFile = x;
        this.state.preview = false;
        this.state.designerLoading = true;
        this.state.history = { entries: [], i: -1 };
      }
    },

    createFile: async x => {
      let [btn, type, name] = await showModal(d.el(CreateFileDialog));
      if (btn !== 'ok') { return }

      if (type === 'file' && !name.includes('.')) {
        let [choice] = await showModal(d.el(FileExtensionWarningDialog));
        if (!choice) { return }
        if (choice === 'html') { name += '.html' }
      }

      let path = joinPath(x, name);
      if (await rfiles.loadFile(this.state.currentSite, path)) {
        let [btn2] = await showModal(d.el(ConfirmationDialog, { title: 'File exists. Overwrite?' }));
        if (btn2 !== 'yes') { return }
      }

      if (type === 'file') {
        let content = new Blob([path.endsWith('.html') ? (path.startsWith('components/') ? defaultComponentHtml : defaultHtml) : ''], { type: mimeLookup(path) });
        await rfiles.saveFile(this.state.currentSite, path, content);
        (path.startsWith('controllers/') || path.endsWith('.html')) && await post('app.generateReflections');
        await post('app.loadFiles');
        await post('app.selectFile', path);
      } else {
        await rfiles.saveFile(this.state.currentSite, `${path}/.keep`, '');
        await post('app.loadFiles')
      }

      // TODO: Toggle path
    },

    renameFile: async (x, isDir) => {
      let [btn, name] = await showModal(d.el(RenameFileDialog, { initialValue: x.split('/').at(-1) }));
      if (btn !== 'ok') { return }
      let newPath = [...x.split('/').slice(0, -1), name].join('/');
      if (isDir) { await post('app.doRenameFolder', x, newPath) }
      else { await post('app.doRenameFile', x, newPath) }
    },

    doRenameFile: async (x, newPath) => {
      await rfiles.renameFile(this.state.currentSite, x, newPath);
      if (this.state.currentFile === x) { await post('app.selectFile', newPath) }
      await post('app.loadFiles');
    },

    doRenameFolder: async (x, newPath) => {
      await rfiles.renameFolder(this.state.currentSite, x, newPath);
      if (this.state.currentFile?.startsWith?.(`${x}/`)) { await post('app.selectFile', this.state.currentFile.replace(x, newPath)) }
      await post('app.loadFiles');
    },

    deleteFile: async (x, isDir) => {
      let [btn] = await showModal(d.el(ConfirmationDialog, { title: 'Delete this file or folder?' }));
      if (btn !== 'yes') { return }

      if (isDir) {
        await rfiles.deleteFolder(this.state.currentSite, x);
        if (this.state.currentFile?.startsWith?.(`${x}/`)) { this.state.currentFile = this.state.replacingStyle = null; await post('app.changeSelected', null) }
      } else {
        await rfiles.deleteFile(this.state.currentSite, x);
        if (this.state.currentFile === x) { this.state.currentFile = this.state.replacingStyle = null; await post('app.changeSelected', null) }
      }

      await post('app.loadFiles');
    },

    dragStartFile: (ev, path) => {
      if (ev.target.closest('[disabled], [wf-disabled]')) { return }
      ev.dataTransfer.effectAllowed = 'move';
      this.state.draggedFile = path;
    },

    dragOverFile: ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move' },
    dropFile: (ev, path) => { ev.preventDefault(); ev.stopPropagation(); post('app.mvFile', this.state.draggedFile, path) },

    mvFile: async (path, newPath) => {
      if (newPath.startsWith(`${path}/`)) { return }
      let isDir = await rfiles.loadFile(this.state.currentSite, `${path}/.keep`) != null;
      let isNewPathDir = await rfiles.loadFile(this.state.currentSite, `${newPath}/.keep`) != null;
      if (!isNewPathDir) { newPath = newPath.split('/').slice(0, -1).join('/') }
      let leaf = path.split('/').at(-1);
      if (isDir) { await post('app.doRenameFolder', path, [newPath, leaf].filter(Boolean).join('/')) }
      else { await post('app.doRenameFile', path, [newPath, leaf].filter(Boolean).join('/')) }
    },

    saveFile: async (x, content) => {
      if (x.endsWith('.html')) {
        let doc = new DOMParser().parseFromString(content, 'text/html');
        clearComponents(doc);
        content = new Blob([`<!doctype html>\n<html>${doc.head.outerHTML}\n${doc.body.outerHTML}\n</html>`], { type: 'text/html' });
      } else {
        content = new Blob([content], { type: mimeLookup(x) });
      }
      await rfiles.saveFile(this.state.currentSite, x, content);
      (x.startsWith('controllers/') || x.endsWith('.html')) && await post('app.generateReflections');
      await post('app.loadFiles');
    },

    loadDesigner: async ev => {
      let iframe = ev.target;
      let contents = iframe.closest('.Designer-contents');
      this.state.gloves?.destroy?.();
      this.state.actions = null;
      if (this.state.preview) { this.state.designerLoading = false; return }
      this.state.gloves = new MagicGloves(iframe);
      await setComponents(this.state.currentSite, iframe.contentDocument.documentElement);
      this.state.editorWindow = iframe.contentWindow;
      this.state.editorDocument = iframe.contentDocument;
      this.state.actions = new ActionHandler();
      this.state.designerLoading = false;
      post('app.pushHistory');
      let mutobs = new MutationObserver(() => post('app.saveFile', this.state.currentFile, `<!doctype html>\n${this.state.editorDocument.documentElement.outerHTML}`));
      mutobs.observe(this.state.editorDocument.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
      setTimeout(() => post('app.snapshot'), 1000);
    },


    snapshot: async () => {
      if (this.state.currentFile !== 'pages/index.html') { return }
      let canvas = await html2canvas(this.state.editorDocument.body, { height: 720 });
      canvas.toBlob(blob => rfiles.saveFile(this.state.currentSite, 'webfoundry/snapshot.png', blob));
    },

    resizeDesigner: ev => {
      ev.target.setPointerCapture(ev.pointerId);
      ev.target.addEventListener('pointermove', this.onResizeDesignerPointerMove);
      ev.target.addEventListener('pointerup', this.onResizeDesignerPointerUp, { once: true });
    },

    changeSelected: x => {
      this.state.s = x;
      if (x && this.state.prevPanel) { this.state.currentPanel = this.state.prevPanel }
      if (!x && (this.state.currentPanel === 'styles' || this.state.currentPanel === 'actions')) {
        this.state.prevPanel = this.state.currentPanel;
        this.state.currentPanel = 'files';
      }
    },

    addSelection: x => {
      if (!(this.state.s instanceof Set)) { this.state.s = new Set([this.state.s]) }
      this.state.s.add(x);
      if (x && this.state.prevPanel) { this.state.currentPanel = this.state.prevPanel }
      if (!x && (this.state.currentPanel === 'styles' || this.state.currentPanel === 'actions')) {
        this.state.prevPanel = this.state.currentPanel;
        this.state.currentPanel = 'files';
      }
    },

    editorAction: x => this.state.actions.kbds[x](),

    addStyleKeyDown: async ev => {
      if (ev.key !== 'Enter') { return }
      await post('app.addStyle', ev.target.value.trim());
      ev.target.value = '';
    },

    editStyle: x => this.state.replacingStyle = x,
    replaceStyleKeyDown: ev => ev.key === 'Enter' && ev.target.blur(),

    replaceStyleBlur: async ev => {
      await post('app.deleteStyle', this.state.replacingStyle);
      await post('app.addStyle', ev.target.value.trim());
      this.state.replacingStyle = null;
      ev.target.value = '';
    },

    addStyle: async x => {
      if (/^{{.+?}}$/.test(x)) { this.state.s instanceof Set ? this.state.s.forEach(sx => addWfClass(sx, x)) : addWfClass(this.state.s, x)}
      else { this.state.s instanceof Set ? this.state.s.forEach(sx => sx.classList.add(x)) : this.state.s.classList.add(x)}
      await post('app.pushHistory');
    },

    deleteStyle: async x => {
      if (/^{{.+?}}$/.test(x)) { this.state.s instanceof Set ? this.state.s.forEach(sx => rmWfClass(sx, x)) : rmWfClass(this.state.s, x)}
      else { this.state.s instanceof Set ? this.state.s.forEach(sx => sx.classList.remove(x)) : this.state.s.classList.remove(x)}
      await post('app.pushHistory');
    },

    contextMenu: where => {
      let iframe = document.querySelector('.Designer iframe');
      let onNestedContextMenu = ev => ev.preventDefault();

      let closeContextMenu = () => {
        removeEventListener('click', onClick);
        removeEventListener('contextmenu', onNestedContextMenu);
        this.state.contextMenu = null;
        iframe.classList.remove('pointer-events-none');
        d.updateSync();
        iframe.focus();
      };

      let onClick = ev => !this.state.contextMenu.contains(ev.target) && closeContextMenu();
      addEventListener('click', onClick);

      iframe.blur();
      addEventListener('contextmenu', onNestedContextMenu);
      let { x, y } = where;
      let iframeRect = iframe.getBoundingClientRect();
      x += iframeRect.left - 10;
      y += iframeRect.top - 10;
      iframe.classList.add('pointer-events-none');
      this.state.contextMenu = d.html`
        <div class="fixed z-[1000]" ${{ style: { left: `${x}px`, top: `${y}px` } }}>
          ${d.el(DesignerContextMenu, { state, post, close: closeContextMenu })}
        </div>
      `;
      d.update();
    },

    pushHistory: () => {
      let iframe = document.querySelector('.Designer iframe');
      let html = iframe.contentDocument.documentElement.outerHTML;
      let { history } = this.state;
      history.entries.splice(history.i + 1, 99999);
      history.entries.push(html);
      history.i++;
    },

    undo: () => {
      let iframe = document.querySelector('.Designer iframe');
      let { history } = this.state;
      if (!history.i) { return }
      this.state.s && post('app.changeSelected', null);
      history.i--;
      morphdom(iframe.contentDocument.documentElement, history.entries[history.i]);
    },

    redo: () => {
      let iframe = document.querySelector('.Designer iframe');
      let { history } = this.state;
      if (history.i >= history.entries.length - 1) { return }
      this.state.s && post('app.changeSelected', null);
      history.i++;
      morphdom(iframe.contentDocument.documentElement, history.entries[history.i]);
    },

    importZip: async () => {
      let input = d.html`<input class="hidden" type="file" accept=".zip">`;

      input.onchange = async () => {
        try {
          let [file] = input.files;
          if (!file) { return }
          this.state.importing = true;
          showModal(d.el(ImportingDialog, { done: () => !this.state.importing }));
          await rfiles.importZip(this.state.currentSite, file);
          await post('app.injectBuiltins', this.state.currentSite, true);
          await post('app.generateReflections');
          await post('app.loadFiles');
        } finally {
          this.state.importing = false;
        }
      }

      document.body.append(input);
      input.click();
      input.remove();
    },

    importZipFromUrl: async url => {
      try {
        this.state.importing = true;
        showModal(d.el(ImportingDialog, { done: () => !this.state.importing }));
        let res = await fetch(url);
        if (!res.ok) { throw new Error(`Error fetching ZIP file: ${res.statusText}`) }
        let name = atob(url.split('/').pop().split('.').slice(0, -1).join('.'));
        let id = await post('app.doCreateSite', name);
        await rfiles.importZip(id, await res.blob());
        this.state.currentSite = id;
        this.state.currentTab = 'files';
        await post('app.loadSites');
        await post('app.loadFiles');
      } finally {
        this.state.importing = false;
      }
    },

    exportZip: async () => {
      let blob = await rfiles.exportZip(this.state.currentSite);
      let a = d.html`<a class="hidden" ${{ download: `${this.state.sites[this.state.currentSite].name}.zip`, href: URL.createObjectURL(blob) }}>`;
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    },

    netlifyDeploy: async () => {
      let [btn, x] = await showModal(d.el(NetlifyDeployDialog));
      if (btn !== 'ok') { return }
      await showModal(d.el(NetlifyDeployDoneDialog, { url: x }));
    },

    editorChange: async (site, path, x) => await rfiles.saveFile(site, path, new Blob([x], { type: mimeLookup(this.state.currentFile) })),
  };

  onResizeDesignerPointerMove = ev => {
    let w = Math.max(320, ev.clientX - document.querySelector('.Designer-padder').getBoundingClientRect().right);
    this.state.designerWidth = `min(100%, ${w}px)`;
    this.state.designerHeight = w >= 640 ? '100vh' : `${w * 1.777}px`;
    d.update();
  };

  onResizeDesignerPointerUp = ev => {
    ev.target.removeEventListener('pointermove', this.onResizeDesignerPointerMove);
    ev.target.releasePointerCapture(ev.pointerId);
  };
}

addEventListener('message', ev => ev.data.type === 'action' && post(ev.data.action, ...ev.data.args));

async function fetchFile(x) {
  let res = await fetch(x);
  if (!res.ok) { throw new Error('Fetch error') }
  return res.blob();
}

function getWfClass(x) { return (x.getAttribute('wf-class') || '').split(/({{.+?}})/g).filter(x => x.trim()) }

function addWfClass(x, y) {
  let attr = getWfClass(x);
  attr.push(y);
  attr = attr.join(' ');
  attr ? x.setAttribute('wf-class', attr) : x.removeAttribute('wf-class');
}

function rmWfClass(x, y) {
  let attr = getWfClass(x);
  let i = attr.indexOf(y);
  i !== -1 && attr.splice(i, 1);
  attr = attr.join(' ');
  attr ? x.setAttribute('wf-class', attr) : x.removeAttribute('wf-class');
}

export default AppCtrl;
