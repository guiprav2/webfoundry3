import express from 'express';
import fs from 'fs';
import getPort from 'get-port';
import path from 'path';

let app = express();
let HTML_DIR = process.cwd();
if (HTML_DIR.endsWith('/src-tauri')) { HTML_DIR += '/..' }

app.use(express.static(HTML_DIR));

app.get('*', (req, res) => {
  res.sendFile(path.join(HTML_DIR, 'index.html'));
});

(async () => {
  let port = await getPort();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    fs.writeFileSync('tauri-port', port.toString());
  });
})();
