const https = require('https');
const files = [
  'File:Development_Credit_Bank.svg',
  'File:Federal_bank.logo.svg',
  'File:AU-Bank-new-logo-for-GBM_1024X1024.png'
];

files.forEach(file => {
  https.get({
    hostname: 'commons.wikimedia.org',
    path: `/w/api.php?action=query&titles=${file}&prop=imageinfo&iiprop=url&format=json`,
    headers: { 'User-Agent': 'Bot/1.0 (test@example.com)' }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const pages = JSON.parse(data).query.pages;
      for (const id in pages) {
         if(pages[id].imageinfo) {
             console.log(pages[id].imageinfo[0].url);
         }
      }
    });
  }).on('error', (e) => console.error(e));
});
