class NoSafari {
  constructor() {
  }

  sayYoureSorry =  () => this.typewrite('Beep-boop! 🤖 Sorry, but Safari is currently not supported.\nPlease try Firefox or any Chrome-based browser.');

  async typewrite(x) {
    for (let y of x) {
      this.root.textContent += y;
      await new Promise(res => setTimeout(res, 30));
    }
  };

  render = () => this.root = d.html`<h1 class="p-16 tracking-widest leading-relaxed text-4xl whitespace-pre" ${{ onAttach: this.sayYoureSorry }}></h1>`;
}

export default NoSafari;
