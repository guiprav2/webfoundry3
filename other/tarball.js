import tar from 'https://cdn.skypack.dev/tar-stream';

function readBlobAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      return reject(new Error('Argument is not a Blob'));
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function tarball(files) {
  return new Promise((resolve, reject) => {
    const pack = tar.pack(); // Create a new tar pack stream
    const chunks = [];

    // Listen for the 'data' event to collect chunks
    pack.on('data', chunk => {
      chunks.push(chunk);
    });

    // Listen for the 'end' event to resolve the promise with the complete buffer
    pack.on('end', () => {
      const tarball = new Blob(chunks, { type: 'application/x-tar' });
      resolve(tarball);
    });

    // Listen for the 'error' event to reject the promise
    pack.on('error', err => {
      reject(err);
    });

    const processFiles = async () => {
      try {
        for (const [filePath, blob] of Object.entries(files)) {
          if (!(blob instanceof Blob)) { console.log(filePath, 'is not a blob.') }
          const buffer = await readBlobAsArrayBuffer(blob);
          pack.entry({ name: filePath }, new Uint8Array(buffer), err => {
            if (err) throw err;
          });
        }
        pack.finalize(); // Finalize the tarball
      } catch (err) {
        reject(new Error(`Error processing files: ${err.message}`));
      }
    };

    processFiles();
  });
}

export default tarball;
