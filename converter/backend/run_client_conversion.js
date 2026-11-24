const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log('Navigating to http://localhost:8081/converter/ ...');
    await page.goto('http://localhost:8081/converter/', { waitUntil: 'networkidle2' });

    // Wait for ConverterEngine
    await page.waitForFunction(() => typeof window.ConverterEngine !== 'undefined');

    const docxPath = path.resolve('c:/Users/Raden/OneDrive/Documents/TestGithub/converter/backend/temp_uploads/Rancangan_Pembahasan_Pengujian_Konversi_PDF_Word.docx');
    console.log('Reading DOCX from:', docxPath);
    const fileBuffer = fs.readFileSync(docxPath);
    const base64Data = fileBuffer.toString('base64');
    const fileName = path.basename(docxPath);

    console.log('Triggering client-side ConverterEngine.docxToPdf in page context...');
    const resultBase64 = await page.evaluate(async (base64, name) => {
      // Decode base64 to File object
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      // Call docxToPdf
      const blob = await window.ConverterEngine.docxToPdf(file, {}, (pct, msg) => {
        console.log(`[Progress ${pct}%] ${msg}`);
      });

      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          const base64Str = res.split(',')[1];
          resolve(base64Str);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }, base64Data, fileName);

    const outDir = path.resolve('c:/Users/Raden/OneDrive/Documents/TestGithub/converter/backend/converted_files');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPdfPath = path.join(outDir, 'hasil_perbaikan_a_client.pdf');
    fs.writeFileSync(outPdfPath, Buffer.from(resultBase64, 'base64'));
    console.log('Successfully saved Perbaikan A PDF to:', outPdfPath);
    console.log('File size:', fs.statSync(outPdfPath).size, 'bytes');
  } catch (err) {
    console.error('Error during client conversion:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
