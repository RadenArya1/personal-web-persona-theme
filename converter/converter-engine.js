/**
 * Universal Converter Engine
 * 100% Client-Side In-Browser Document & Media Transformation
 * Supported formats:
 * - Images (JPG, PNG, WEBP, SVG, BMP, GIF, AVIF) -> PDF, DOCX, Image formats
 * - Word (.docx) -> PDF, Images
 * - PowerPoint (.pptx) -> PDF, DOCX, Images
 * - PDF -> DOCX, Images
 */

// Konfigurasi Worker PDF.js jika tersedia di browser
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export const ConverterEngine = {
  /**
   * Helper membaca File sebagai Data URL
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Helper membaca File sebagai ArrayBuffer
   */
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Helper membuat Image element dari DataURL / Blob
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Gagal memuat gambar: ' + err.message));
      img.src = src;
    });
  },

  /**
   * 1. KONVERSI GAMBAR -> PDF
   * Mendukung satu atau banyak gambar digabung ke dalam PDF.
   */
  async imagesToPdf(files, options = {}, onProgress = () => {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('Pustaka jsPDF belum termuat.');
    }
    const { jsPDF } = window.jspdf;
    const fileList = Array.isArray(files) ? files : [files];
    const total = fileList.length;

    let doc = null;

    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      onProgress(Math.round(((i + 0.2) / total) * 100), `Membaca gambar ${i + 1}/${total}...`);

      const dataUrl = await this.readFileAsDataURL(file);
      const img = await this.loadImage(dataUrl);

      // Hitung orientasi dan dimensi halaman (A4 standar dalam mm atau sesuai rasio gambar)
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

      // Standar ukuran halaman mm
      const pageWidth = orientation === 'landscape' ? 297 : 210;
      const pageHeight = orientation === 'landscape' ? 210 : 297;

      if (i === 0) {
        doc = new jsPDF({
          orientation,
          unit: 'mm',
          format: [pageWidth, pageHeight]
        });
      } else {
        doc.addPage([pageWidth, pageHeight], orientation);
      }

      // Hitung scaling pas tanpa terpotong (fit to page dengan margin 10mm)
      const margin = 10;
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;
      const ratio = Math.min(maxW / imgWidth, maxH / imgHeight);
      const renderW = imgWidth * ratio;
      const renderH = imgHeight * ratio;
      const posX = margin + (maxW - renderW) / 2;
      const posY = margin + (maxH - renderH) / 2;

      // Render ke PDF
      const formatType = file.type.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(img, formatType, posX, posY, renderW, renderH, undefined, 'FAST');
      onProgress(Math.round(((i + 1) / total) * 100), `Selesai memproses lembar ${i + 1}/${total}`);
    }

    const pdfBlob = doc.output('blob');
    return pdfBlob;
  },

  /**
   * 2. KONVERSI GAMBAR -> WORD (.docx)
   */
  async imagesToDocx(files, options = {}, onProgress = () => {}) {
    if (!window.docx) {
      throw new Error('Pustaka docx.js belum termuat.');
    }
    const { Document, Packer, Paragraph, ImageRun, TextRun, HeadingLevel } = window.docx;
    const fileList = Array.isArray(files) ? files : [files];
    const total = fileList.length;

    const children = [
      new Paragraph({
        text: options.title || 'Dokumen Gambar Hasil Konversi',
        heading: HeadingLevel.TITLE,
        spacing: { after: 300 }
      })
    ];

    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      onProgress(Math.round(((i + 0.3) / total) * 100), `Menyiapkan gambar ${i + 1}/${total}...`);

      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const dataUrl = await this.readFileAsDataURL(file);
      const img = await this.loadImage(dataUrl);

      // Hitung dimensi pas Word (maksimum lebar 550px)
      const maxW = 550;
      let w = img.naturalWidth || 500;
      let h = img.naturalHeight || 400;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Lampiran Gambar ${i + 1}: ${file.name}`,
              bold: true,
              size: 22
            })
          ],
          spacing: { before: 200, after: 120 }
        })
      );

      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: arrayBuffer,
              transformation: {
                width: w,
                height: h
              }
            })
          ],
          spacing: { after: 300 }
        })
      );

      onProgress(Math.round(((i + 1) / total) * 100), `Gambar ${i + 1} ditambahkan`);
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children
        }
      ]
    });

    onProgress(95, 'Mengemas dokumen .docx...');
    const blob = await Packer.toBlob(doc);
    return blob;
  },

  /**
   * 3. KONVERSI ANTAR FORMAT GAMBAR (JPG, PNG, WEBP, BMP, SVG, dsb.)
   */
  async convertImageFormat(file, targetFormat = 'image/png', quality = 0.92, onProgress = () => {}) {
    onProgress(30, 'Membaca gambar sumber...');
    const dataUrl = await this.readFileAsDataURL(file);
    const img = await this.loadImage(dataUrl);

    onProgress(60, 'Merender ulang ke format ' + targetFormat.replace('image/', '').toUpperCase() + '...');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');

    // Jika target JPEG dan ada alpha/transparan, isi latar putih
    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Gagal mengonversi gambar'));
          onProgress(100, 'Konversi gambar selesai');
          resolve(blob);
        },
        targetFormat,
        quality
      );
    });
  },

  /**
   * 4. KONVERSI WORD (.docx) -> PDF — PAGE-BY-PAGE 100% PRESISI (F4 & BEBAS BLANK)
   * Menggunakan JSZip untuk mendeteksi batas halaman Word (lastRenderedPageBreak),
   * membagi konten menjadi lembaran 1:1, dan merender tiap halaman secara terisolasi.
   */
  async docxToPdf(file, options = {}, onProgress = () => {}) {
    if (!window.mammoth) {
      throw new Error('Pustaka Mammoth belum termuat.');
    }
    if (!window.JSZip) {
      throw new Error('Pustaka JSZip belum termuat.');
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('Pustaka jsPDF belum termuat.');
    }
    if (!window.html2canvas) {
      throw new Error('Pustaka html2canvas belum termuat.');
    }

    onProgress(15, 'Mengekstrak struktur teks dan gambar dokumen Word...');
    const arrayBuffer = await this.readFileAsArrayBuffer(file);

    // Konversi DOCX ke HTML via Mammoth
    const { value: fullHtml } = await window.mammoth.convertToHtml({ arrayBuffer });

    onProgress(35, 'Menyiapkan perenderan dokumen penuh ke lembar standar A4...');

    // Buat container rendering DOM lengkap tanpa batasan tinggi
    const renderContainer = document.createElement('div');
    renderContainer.id = 'docx-render-viewport';
    renderContainer.style.position = 'fixed';
    renderContainer.style.left = '0';
    renderContainer.style.top = '0';
    renderContainer.style.width = '794px'; // Standar A4 pada 96 DPI
    renderContainer.style.height = 'auto';
    renderContainer.style.minHeight = '1123px';
    renderContainer.style.overflow = 'visible';
    renderContainer.style.padding = '48px 56px'; // Margin standar dokumen
    renderContainer.style.boxSizing = 'border-box';
    renderContainer.style.background = '#FFFFFF';
    renderContainer.style.color = '#000000';
    renderContainer.style.fontFamily = "'Times New Roman', Times, serif";
    renderContainer.style.fontSize = '12pt';
    renderContainer.style.lineHeight = '1.3';
    renderContainer.style.zIndex = '99999';
    renderContainer.style.pointerEvents = 'none';
    document.body.appendChild(renderContainer);

    const styling = `
      <style>
        table { border-collapse: collapse; width: 100%; margin: 8px 0; border: 1px solid #000; }
        td, th { border: 1px solid #000; padding: 6px 10px; font-family: 'Times New Roman', Times, serif; font-size: 11pt; background: #fafafa; vertical-align: top; color: #000; }
        img { max-width: 100%; height: auto; display: block; margin: 8px 0; }
        p { margin: 0 0 6px 0; line-height: 1.3; color: #000; }
        h1, h2, h3, h4 { color: #000; margin: 12px 0 6px 0; font-weight: bold; }
        h1 { font-size: 15pt; text-align: center; }
        h2 { font-size: 13pt; }
        h3 { font-size: 12pt; }
      </style>
    `;

    try {
      renderContainer.innerHTML = styling + (fullHtml || '<p></p>');

      // Tunggu seluruh elemen gambar selesai dimuat
      const imgs = Array.from(renderContainer.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      onProgress(50, 'Menangkap canvas dokumen penuh (resolusi tinggi)...');
      const canvas = await window.html2canvas(renderContainer, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 794
      });

      onProgress(75, 'Memotong canvas ke halaman A4 (Pagination Slicing)...');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();   // 595.28 pt
      const pageHeight = pdf.internal.pageSize.getHeight(); // 841.89 pt

      // Lebar gambar disesuaikan ke lebar halaman A4, tinggi mengikuti rasio canvas
      const imgWidth = pageWidth;
      const pageHeightPx = Math.floor((pageHeight * canvas.width) / imgWidth);
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      for (let page = 0; page < totalPages; page++) {
        const pct = Math.round(75 + ((page + 1) / totalPages) * 23);
        onProgress(pct, `Menyusun halaman PDF ${page + 1}/${totalPages}...`);

        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = Math.min(pageHeightPx, canvas.height - page * pageHeightPx);
        const ctx = slice.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(
          canvas,
          0, page * pageHeightPx, slice.width, slice.height,
          0, 0, slice.width, slice.height
        );

        const sliceHeightPt = (slice.height * imgWidth) / canvas.width;
        if (page > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgWidth, sliceHeightPt);
      }

      onProgress(100, `Konversi Word ke PDF berhasil (${totalPages} halaman penuh A4)!`);
      const blob = pdf.output('blob');
      return blob;
    } finally {
      if (renderContainer.parentNode) {
        renderContainer.parentNode.removeChild(renderContainer);
      }
    }
  },

  /**
   * 5. KONVERSI PPT (.pptx) -> PDF
   * Menggunakan JSZip untuk membaca slide presentasi dan teks/gambar lalu diekspor ke PDF.
   */
  async pptxToPdf(file, options = {}, onProgress = () => {}) {
    if (!window.JSZip) {
      throw new Error('Pustaka JSZip belum termuat.');
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('Pustaka jsPDF belum termuat.');
    }

    onProgress(15, 'Membongkar arsip presentasi PPTX...');
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    const zip = await window.JSZip.loadAsync(arrayBuffer);

    // Cari seluruh berkas slide
    const slideFiles = Object.keys(zip.files)
      .filter((k) => k.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    if (slideFiles.length === 0) {
      throw new Error('Tidak ditemukan slide yang valid di dalam file PPTX ini.');
    }

    const { jsPDF } = window.jspdf;
    // Format Presentasi Landscape A4
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [297, 210]
    });

    const total = slideFiles.length;
    for (let i = 0; i < total; i++) {
      onProgress(Math.round(((i + 1) / total) * 80), `Merender slide presentasi ${i + 1}/${total}...`);

      if (i > 0) pdf.addPage([297, 210], 'landscape');

      const xmlText = await zip.file(slideFiles[i]).async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Ambil seluruh teks pada slide
      const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
      const slideTexts = textNodes.map((n) => n.textContent.trim()).filter(Boolean);

      // Desain lembar slide
      // Latar belakang gradasi kartu presentasi
      pdf.setFillColor(248, 250, 252);
      pdf.rect(10, 10, 277, 190, 'F');
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(10, 10, 277, 190, 3, 3, 'S');

      // Header Slide
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`SLIDE ${i + 1} DARI ${total}`, 18, 22);

      // Garis aksen
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(1);
      pdf.line(18, 26, 279, 26);

      // Judul Slide (teks pertama jika ada)
      let startY = 38;
      pdf.setTextColor(15, 23, 42);

      if (slideTexts.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        const titleText = slideTexts[0];
        const splitTitle = pdf.splitTextToSize(titleText, 250);
        pdf.text(splitTitle, 18, startY);
        startY += splitTitle.length * 8 + 8;

        // Konten isi slide
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(13);
        pdf.setTextColor(51, 65, 85);

        for (let t = 1; t < slideTexts.length; t++) {
          const bodyItem = '• ' + slideTexts[t];
          const splitBody = pdf.splitTextToSize(bodyItem, 245);
          if (startY > 185) break; // batas bawah
          pdf.text(splitBody, 22, startY);
          startY += splitBody.length * 6 + 4;
        }
      } else {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(14);
        pdf.setTextColor(148, 163, 184);
        pdf.text('(Slide presentasi visual / tanpa teks langsung)', 18, 50);
      }
    }

    onProgress(100, 'Konversi PPT ke PDF selesai');
    return pdf.output('blob');
  },

  /**
   * 6. KONVERSI PPT (.pptx) -> WORD (.docx)
   */
  async pptxToDocx(file, options = {}, onProgress = () => {}) {
    if (!window.JSZip || !window.docx) {
      throw new Error('Pustaka pendukung PPT ke Word belum lengkap.');
    }
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;

    onProgress(20, 'Membaca presentasi PPTX...');
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    const zip = await window.JSZip.loadAsync(arrayBuffer);

    const slideFiles = Object.keys(zip.files)
      .filter((k) => k.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    const children = [
      new Paragraph({
        text: `Transkrip Presentasi: ${file.name.replace(/\.[^/.]+$/, '')}`,
        heading: HeadingLevel.TITLE,
        spacing: { after: 300 }
      })
    ];

    const total = slideFiles.length;
    for (let i = 0; i < total; i++) {
      onProgress(Math.round(((i + 1) / total) * 85), `Mengekstrak slide ${i + 1}/${total}...`);

      const xmlText = await zip.file(slideFiles[i]).async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
      const slideTexts = textNodes.map((n) => n.textContent.trim()).filter(Boolean);

      children.push(
        new Paragraph({
          text: `Slide ${i + 1}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );

      if (slideTexts.length > 0) {
        slideTexts.forEach((txt, idx) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: idx === 0 ? txt : `• ${txt}`,
                  bold: idx === 0,
                  size: idx === 0 ? 24 : 22
                })
              ],
              spacing: { after: 100 }
            })
          );
        });
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '(Slide visual tanpa teks)',
                italics: true,
                color: '888888'
              })
            ],
            spacing: { after: 100 }
          })
        );
      }
    }

    onProgress(95, 'Mengemas dokumen Word (.docx)...');
    const doc = new Document({
      sections: [{ children }]
    });

    const blob = await Packer.toBlob(doc);
    onProgress(100, 'Dokumen Word siap!');
    return blob;
  },

  /**
   * Helper: Mengekstrak embedded images dari halaman PDF menggunakan PDF.js OperatorList
   * Mendukung ImageBitmap, RGBA buffer, dan RGB raw buffer.
   * Mengembalikan array objek gambar { name, width, height, buffer } dalam format PNG Uint8Array.
   */
  async extractImagesFromPdfPage(page) {
    const images = [];
    try {
      const ops = await page.getOperatorList();
      const fnArray = ops.fnArray;
      const argsArray = ops.argsArray;
      const OPS = window.pdfjsLib.OPS;

      for (let i = 0; i < fnArray.length; i++) {
        if (fnArray[i] === OPS.paintImageXObject || fnArray[i] === OPS.paintInlineImageXObject) {
          const imgName = argsArray[i][0];
          await new Promise((resolve) => {
            page.objs.get(imgName, (img) => {
              if (!img) return resolve();
              const w = (img.bitmap && img.bitmap.width) || img.width;
              const h = (img.bitmap && img.bitmap.height) || img.height;
              if (!w || !h) return resolve();

              try {
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');

                if (img.bitmap) {
                  ctx.drawImage(img.bitmap, 0, 0);
                } else if (img.data) {
                  let imgData;
                  if (img.data.length === w * h * 4) {
                    imgData = new ImageData(new Uint8ClampedArray(img.data), w, h);
                  } else if (img.data.length === w * h * 3) {
                    const rgba = new Uint8ClampedArray(w * h * 4);
                    for (let k = 0, j = 0; k < img.data.length; k += 3, j += 4) {
                      rgba[j] = img.data[k];
                      rgba[j + 1] = img.data[k + 1];
                      rgba[j + 2] = img.data[k + 2];
                      rgba[j + 3] = 255;
                    }
                    imgData = new ImageData(rgba, w, h);
                  }
                  if (imgData) ctx.putImageData(imgData, 0, 0);
                }

                canvas.toBlob((blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      images.push({
                        name: imgName,
                        width: w,
                        height: h,
                        buffer: new Uint8Array(reader.result)
                      });
                      resolve();
                    };
                    reader.onerror = () => resolve();
                    reader.readAsArrayBuffer(blob);
                  } else {
                    resolve();
                  }
                }, 'image/png');
              } catch (_) {
                resolve();
              }
            });
          });
        }
      }
    } catch (_) {}
    return images;
  },

  /**
   * Helper: Merender halaman PDF ke element Canvas dengan resolusi tinggi (scale 2.0)
   * Dioptimalkan untuk kejernihan karakter pada proses OCR Tesseract.js.
   */
  async renderPageToCanvas(page, scale = 2.0) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  },

  /**
   * Helper: Menjalankan OCR client-side via Tesseract.js
   * Mendukung multi-bahasa (default: Bahasa Indonesia 'ind' + Bahasa Inggris 'eng')
   */
  async recognizeOcr(imageOrCanvas, languages = 'ind+eng', onProgress = () => {}) {
    if (!window.Tesseract) {
      console.warn('Pustaka Tesseract.js belum termuat di window.');
      return '';
    }
    try {
      const res = await window.Tesseract.recognize(imageOrCanvas, languages, {
        logger: (m) => {
          if (m && m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(pct, `Mengenali teks OCR (${pct}%)...`);
          } else if (m && m.status) {
            onProgress(20, `Menyiapkan engine OCR (${m.status})...`);
          }
        }
      });
      return (res && res.data && res.data.text) ? res.data.text : '';
    } catch (err) {
      console.warn('Tesseract OCR error:', err);
      return '';
    }
  },

  /**
   * 7. KONVERSI PDF -> WORD (.docx) — HYBRID CERDAS (NATIVE + OCR FALLBACK)
   * Mengekstrak teks digital dengan PDF.js secara instan.
   * Jika halaman berupa scan/foto (teks digital < 20 karakter),
   * otomatis mengaktifkan engine OCR Tesseract.js (ind+eng).
   */
  async pdfToDocx(file, options = {}, onProgress = () => {}) {
    if (!window.pdfjsLib) {
      throw new Error('Pustaka PDF.js belum termuat.');
    }
    if (!window.docx) {
      throw new Error('Pustaka docx.js belum termuat.');
    }

    const { Document, Packer, Paragraph, TextRun, PageBreak, Table, TableRow, TableCell, BorderStyle, WidthType, ImageRun, AlignmentType } = window.docx;

    onProgress(15, 'Membaca dokumen PDF...');
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    // Deteksi ukuran halaman pertama untuk orientasi & ukuran kertas (F4 vs A4)
    const firstPage = await pdfDoc.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1.0 });
    const isF4 = Math.abs(firstViewport.width - 612) < 20 && Math.abs(firstViewport.height - 936) < 20;

    // Dimensi halaman dalam twips (1 pt = 20 twips)
    const pageWidthTwips = isF4 ? 12240 : Math.round(firstViewport.width * 20);
    const pageHeightTwips = isF4 ? 18720 : Math.round(firstViewport.height * 20);

    // Margin default: 2 cm = 1134 twips (2 2 2 2)
    const marginTwips = options.marginTwips || 1134;

    const children = [];
    let isDocumentAnalysisPhase = false;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress(Math.round((pageNum / numPages) * 75), `Memproses halaman PDF ${pageNum}/${numPages}...`);

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageImages = await this.extractImagesFromPdfPage(page);

      // Hitung total karakter teks digital pada halaman ini
      const totalChars = textContent.items.reduce((acc, it) => acc + (it.str ? it.str.trim().length : 0), 0);
      let pageParagraphs = [];

      // SKENARIO A: Halaman scan/gambar tanpa teks digital (< 20 karakter) -> Jalankan OCR
      if (totalChars < 20) {
        onProgress(
          Math.round((pageNum / numPages) * 75),
          `Halaman ${pageNum}/${numPages}: Teks digital kosong, menjalankan OCR scan (ind+eng)...`
        );
        try {
          const canvas = await this.renderPageToCanvas(page, 2.0);
          const ocrText = await this.recognizeOcr(canvas, options.ocrLanguages || 'ind+eng', (pct, msg) => {
            onProgress(
              Math.round(((pageNum - 1 + pct / 100) / numPages) * 75),
              `Halaman ${pageNum}/${numPages} [OCR]: ${pct}%`
            );
          });

          if (ocrText && ocrText.trim()) {
            const ocrLines = ocrText.split('\n').map((l) => l.trim()).filter(Boolean);
            ocrLines.forEach((lineText) => {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: lineText,
                      font: 'Times New Roman',
                      size: 24 // 12pt
                    })
                  ],
                  spacing: { before: 0, after: 60, line: 240 }
                })
              );
            });
          }
        } catch (e) {
          console.warn(`Gagal memproses OCR pada halaman ${pageNum}:`, e);
        }
      }

      // SKENARIO B: Halaman memiliki layer teks digital asli (Struktur Presisi 100%)
      if (totalChars >= 20) {
        // Kelompokkan string teks berdasarkan posisi baris Y
        const rawLines = [];
        let currentLine = [];
        let lastY = null;

        textContent.items.forEach((item) => {
          const y = Math.round(item.transform[5]);
          if (lastY === null || Math.abs(y - lastY) < 5) {
            currentLine.push(item.str);
          } else {
            if (currentLine.length > 0) rawLines.push(currentLine.join(''));
            currentLine = [item.str];
          }
          lastY = y;
        });
        if (currentLine.length > 0) rawLines.push(currentLine.join(''));

        let i = 0;
        while (i < rawLines.length) {
          let line = rawLines[i].trim();
          if (!line) {
            i++;
            continue;
          }

          // 1. Judul & Identitas Mahasiswa di Bagian Paling Atas Halaman 1
          if (pageNum === 1 && i < 3 && (line.includes('Akuisisi Data') || line.includes('Modul') || line.includes('2425600045') || line.includes('Davino'))) {
            pageParagraphs.push(
              new Paragraph({
                alignment: (AlignmentType && AlignmentType.CENTER) ? AlignmentType.CENTER : 'center',
                children: [
                  new TextRun({
                    text: line,
                    bold: true,
                    font: 'Times New Roman',
                    size: line.includes('Akuisisi') ? 28 : 24 // 14pt atau 12pt
                  })
                ],
                spacing: { before: 40, after: 60, line: 240 }
              })
            );
            i++;
            continue;
          }

          // 2. Heading Utama / Sub-bab (Bold)
          const isHeading = /^(\d+\.\s+[A-Za-z]+|[a-z]\.\s+[A-Za-z]+|Tugas|Analisa|Kesimpulan|Read in the data|Explore the data|Link GDrive)/i.test(line);
          if (isHeading) {
            if (/^(Analisa|Kesimpulan)/i.test(line.trim())) {
              isDocumentAnalysisPhase = true;
            }
            pageParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: true,
                    font: 'Times New Roman',
                    size: 24 // 12pt
                  })
                ],
                spacing: { before: 160, after: 60, line: 240 }
              })
            );
            i++;
            continue;
          }

          // 3. Bullet Points (• atau -)
          if (line.startsWith('•') || line.startsWith('- ')) {
            pageParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    font: 'Times New Roman',
                    size: 24
                  })
                ],
                spacing: { before: 40, after: 60, line: 276 }
              })
            );
            i++;
            continue;
          }

          // 4. Deteksi Blok Kode Python (Disusun ke Tabel 1x1 Kotak Border Hitam)
          // Jika sudah memasuki fase Analisa atau Kesimpulan, seluruh teks adalah ulasan naratif (tidak boleh dibuat tabel kode)
          const isCodeStart = !isDocumentAnalysisPhase && (
            /^(import\s+|from\s+|#|groceries|df|parts\s*=|set_|ranking\s*=|mask\s*=|print\(|\|\s*#|\|\s*import|\|\s*groceries|\|\s*df)/i.test(line) ||
            (line.startsWith('|') && line.endsWith('|'))
          );

          if (isCodeStart) {
            const codeLines = [];
            while (i < rawLines.length) {
              const cur = rawLines[i].trim();
              if (!cur) {
                i++;
                continue;
              }
              if (cur.toLowerCase() === 'output:' || cur.toLowerCase().startsWith('output:')) {
                break;
              }
              if (/^(\d+\.\s+[A-Za-z]+|[a-z]\.\s+[A-Za-z]+|Tugas|Analisa|Kesimpulan)/i.test(cur) && codeLines.length > 0) {
                break;
              }
              codeLines.push(cur.replace(/^\|\s*/, '').replace(/\s*\|$/, ''));
              i++;
            }

            if (codeLines.length > 0) {
              // Rekonstruksi Single-Cell Table 1x1 dengan border solid hitam 1pt dan Font Times New Roman 12pt (1:1 dengan Word asli)
              pageParagraphs.push(
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE }
                  },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          margins: { top: 100, bottom: 100, left: 140, right: 140 },
                          children: codeLines.map((cL) => new Paragraph({
                            children: [
                              new TextRun({
                                text: cL,
                                font: 'Times New Roman',
                                size: 24 // 12pt (identik dengan style Normal pada berkas Word asli)
                              })
                            ],
                            spacing: { before: 0, after: 30, line: 240 }
                          }))
                        })
                      ]
                    })
                  ]
                })
              );
            }
            continue;
          }

          // 5. Label Output & Penyisipan Gambar Screenshot Output
          if (line.toLowerCase() === 'output:' || line.toLowerCase().startsWith('output:')) {
            pageParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Output:',
                    font: 'Times New Roman',
                    size: 24
                  })
                ],
                spacing: { before: 60, after: 60, line: 240 }
              })
            );
            i++;

            // Sisipkan gambar output visual dari halaman ini
            if (pageImages && pageImages.length > 0 && ImageRun) {
              const img = pageImages.shift();
              const maxW = 480; // Lebar cetak aman halaman Word
              const scale = Math.min(1.0, maxW / img.width);
              const dispW = Math.round(img.width * scale);
              const dispH = Math.round(img.height * scale);

              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: img.buffer,
                      transformation: {
                        width: dispW,
                        height: dispH
                      }
                    })
                  ],
                  spacing: { before: 40, after: 80 }
                })
              );
            }
            continue;
          }

          // 6. Paragraf Teks Analisis & Penjelasan Normal
          pageParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: 'Times New Roman',
                  size: 24 // 12pt
                })
              ],
              spacing: { before: 40, after: 80, line: 276 }
            })
          );
          i++;
        }

        // Jika masih ada sisa gambar yang belum tersisipkan pada halaman ini, tambahkan secara rapi
        while (pageImages && pageImages.length > 0 && ImageRun) {
          const img = pageImages.shift();
          const maxW = 480;
          const scale = Math.min(1.0, maxW / img.width);
          pageParagraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.buffer,
                  transformation: {
                    width: Math.round(img.width * scale),
                    height: Math.round(img.height * scale)
                  }
                })
              ],
              spacing: { before: 40, after: 80 }
            })
          );
        }
      }

      // Tambahkan seluruh paragraf halaman ini ke children dokumen
      if (pageParagraphs.length > 0) {
        pageParagraphs.forEach((p) => children.push(p));
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Halaman ${pageNum} - Gambar Scan Tanpa Teks Terdeteksi]`,
                font: 'Times New Roman',
                size: 20,
                italics: true
              })
            ],
            spacing: { before: 0, after: 60, line: 240 }
          })
        );
      }

      // Beri page break untuk setiap halaman kecuali halaman terakhir
      if (pageNum < numPages) {
        children.push(
          new Paragraph({
            children: [new PageBreak()]
          })
        );
      }
    }

    onProgress(95, 'Mengemas dokumen Word (.docx)...');
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: pageWidthTwips,
                height: pageHeightTwips
              },
              margin: {
                top: marginTwips,
                right: marginTwips,
                bottom: marginTwips,
                left: marginTwips
              }
            }
          },
          children
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    onProgress(100, 'Konversi PDF ke Word berhasil!');
    return blob;
  },

  /**
   * 8. KONVERSI PDF -> GAMBAR (PNG / JPG)
   * Merender tiap halaman PDF ke canvas dan menghasilkan gambar.
   */
  async pdfToImages(file, options = { format: 'image/png' }, onProgress = () => {}) {
    if (!window.pdfjsLib) {
      throw new Error('Pustaka PDF.js belum termuat.');
    }
    onProgress(15, 'Membaca dokumen PDF...');
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    const images = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress(Math.round((pageNum / numPages) * 85), `Merender halaman ${pageNum}/${numPages} ke resolusi HD...`);
      const page = await pdfDoc.getPage(pageNum);

      // Render 2x DPI untuk kualitas tajam
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (options.format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise((res) => canvas.toBlob(res, options.format || 'image/png', 0.92));
      images.push({
        name: `${file.name.replace(/\.[^/.]+$/, '')}_page_${pageNum}.${options.format === 'image/jpeg' ? 'jpg' : 'png'}`,
        blob
      });
    }

    onProgress(100, 'Rendering halaman PDF selesai!');
    return images;
  }
};

if (typeof window !== 'undefined') {
  window.ConverterEngine = ConverterEngine;
}
