import d from '../../other/dominant.js';
import styles from '../../other/styles.js';

class FileExtensionWarningDialog {
  render = () => d.html`
    <dialog class="rounded-lg shadow-xl text-neutral-100 bg-[#091017] w-64 p-3 pt-2 min-w-[480px]">
      <form method="dialog">
        <div>HTML or text file?</div>
        <div class="mt-2 whitespace-pre-wrap">You've entered a file name with no extension.
Are you sure you want to create a text file with no extension?
To use the visual editor, you must create an HTML file instead.</div>
        <div class="flex justify-end gap-1.5 mt-3">
          <button value="text" ${{ class: styles.secondaryBtn }}>Text file</button>
          <button value="html" ${{ class: styles.primaryBtn }}>HTML file</button>
        </div>
      </form>
    </dialog>
  `;
}

export default FileExtensionWarningDialog;
