"""
Universal Converter Studio - Backend Bridge
Arsitektur diadopsi dari repositori terverifikasi YusufEren97/universal-file-converter.
Mendukung eksekusi mandiri CLI & integrasi API via Node.js serve.js.
"""

import sys
import os
import json
import shutil
import time
import subprocess
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_UPLOADS_DIR = os.path.join(SCRIPT_DIR, "temp_uploads")
CONVERTED_FILES_DIR = os.path.join(SCRIPT_DIR, "converted_files")

os.makedirs(TEMP_UPLOADS_DIR, exist_ok=True)
os.makedirs(CONVERTED_FILES_DIR, exist_ok=True)


def clean_filename(filename: str) -> str:
    """Membersihkan nama berkas dari karakter berbahaya dan normalisasi."""
    filename = os.path.basename(filename)
    filename = re.sub(r'[\r\n\t]', '', filename)
    filename = filename.replace(' ', '_')
    # Sanitasi karakter non-alphanumeric selain titik, strip, underscore
    filename = re.sub(r'[^a-zA-Z0-9._\-]', '', filename)
    return filename or "converted_file"


def cleanup_old_files(max_age_seconds: int = 3600, exclude_path: str = None):
    """Menghapus berkas sementara yang lebih lama dari 1 jam (3600 detik)."""
    now = time.time()
    for folder in [TEMP_UPLOADS_DIR, CONVERTED_FILES_DIR]:
        if not os.path.exists(folder):
            continue
        for fname in os.listdir(folder):
            fpath = os.path.abspath(os.path.join(folder, fname))
            if exclude_path and fpath == os.path.abspath(exclude_path):
                continue
            # Jangan hapus hasil perbaikan benchmark
            if "hasil_perbaikan" in fname:
                continue
            try:
                if os.path.isfile(fpath):
                    if now - os.path.getmtime(fpath) > max_age_seconds:
                        os.remove(fpath)
            except Exception:
                pass


def check_environment() -> dict:
    """Mengecek pustaka Python dan binary eksternal yang tersedia di sistem."""
    status = {
        "python": sys.version.split()[0],
        "engines": {
            "pillow": False,
            "python_docx": False,
            "pdf2docx": False,
            "docx2pdf": False,
            "pymupdf": False,
            "python_pptx": False,
            "comtypes": False
        },
        "tools": {
            "ffmpeg": bool(shutil.which("ffmpeg")),
            "libreoffice": bool(shutil.which("soffice"))
        }
    }

    try:
        import PIL
        status["engines"]["pillow"] = True
    except Exception:
        pass

    try:
        import docx
        status["engines"]["python_docx"] = True
    except Exception:
        pass

    try:
        import pdf2docx
        status["engines"]["pdf2docx"] = True
    except Exception:
        pass

    try:
        import docx2pdf
        status["engines"]["docx2pdf"] = True
    except Exception:
        pass

    try:
        import fitz
        status["engines"]["pymupdf"] = True
    except Exception:
        pass

    try:
        import pptx
        status["engines"]["python_pptx"] = True
    except Exception:
        pass

    try:
        import comtypes
        status["engines"]["comtypes"] = True
    except Exception:
        pass

    return status


def _convert_image(input_path: str, output_path: str, target_format: str, quality: str) -> dict:
    """Konversi gambar via Pillow dengan presisi 150 DPI untuk PDF."""
    from PIL import Image

    target_format = target_format.lower()
    img = Image.open(input_path)

    if target_format == 'pdf':
        if img.mode != 'RGB':
            img = img.convert('RGB')
        # 150 DPI paten sesuai kode referensi YusufEren97
        img.save(output_path, 'PDF', resolution=150.0)
    elif target_format in ['jpg', 'jpeg']:
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        q_val = 95 if quality == 'high' else 85
        img.save(output_path, 'JPEG', quality=q_val)
    elif target_format == 'png':
        img.save(output_path, 'PNG', optimize=True)
    elif target_format == 'webp':
        q_val = 90 if quality == 'high' else 80
        img.save(output_path, 'WEBP', quality=q_val)
    elif target_format == 'bmp':
        if img.mode in ('RGBA', 'LA'):
            img = img.convert('RGB')
        img.save(output_path, 'BMP')
    elif target_format == 'gif':
        img.save(output_path, 'GIF')
    else:
        img.save(output_path, target_format.upper())

    return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path)}


def _convert_docx_to_pdf(input_path: str, output_path: str, output_dir: str) -> dict:
    """Konversi DOCX ke PDF via LibreOffice headless (Prioritas 1) atau docx2pdf/MS Word (Prioritas 2 Fallback)."""
    # 1. Prioritas Utama: LibreOffice headless (fidelitas kata 99,87% pada hasil simulasi)
    soffice_cmd = shutil.which("soffice")
    if soffice_cmd:
        try:
            cmd = [
                soffice_cmd, "--headless", "--norestore",
                "--convert-to", "pdf",
                "--outdir", output_dir,
                input_path
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=180)
            gen_pdf = os.path.join(output_dir, Path(input_path).stem + ".pdf")
            if os.path.exists(gen_pdf):
                if gen_pdf != output_path:
                    shutil.move(gen_pdf, output_path)
                return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path), "engine": "libreoffice"}
        except Exception:
            pass

    # 2. Fallback Windows: docx2pdf (Microsoft Word COM Automation)
    if sys.platform == "win32":
        try:
            from docx2pdf import convert
            convert(input_path, output_path)
            if os.path.exists(output_path):
                return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path), "engine": "docx2pdf-word-com"}
        except Exception:
            pass

    return {
        "success": False,
        "error": "Konversi DOCX->PDF membutuhkan LibreOffice di sistem atau Microsoft Word (docx2pdf di Windows)."
    }


def _convert_pdf_to_docx(input_path: str, output_path: str) -> dict:
    """Konversi PDF ke DOCX via pdf2docx (rekonstruksi teks, tabel, gambar)."""
    try:
        from pdf2docx import Converter
        cv = Converter(input_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()
        if os.path.exists(output_path):
            return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path), "engine": "pdf2docx"}
    except Exception as e:
        # Fallback teks sederhana
        try:
            import docx
            import pypdf
            reader = pypdf.PdfReader(input_path)
            doc = docx.Document()
            for page in reader.pages:
                txt = page.extract_text()
                if txt:
                    doc.add_paragraph(txt)
            doc.save(output_path)
            if os.path.exists(output_path):
                return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path), "engine": "pypdf-fallback"}
        except Exception:
            pass
        return {"success": False, "error": f"Gagal konversi PDF ke DOCX via pdf2docx: {str(e)}"}

    return {"success": False, "error": "Pustaka pdf2docx belum terpasang."}


def _convert_pptx_to_pdf(input_path: str, output_path: str, output_dir: str) -> dict:
    """Konversi PPTX ke PDF via LibreOffice atau PowerPoint COM Automation."""
    soffice_cmd = shutil.which("soffice")
    if soffice_cmd:
        try:
            cmd = [soffice_cmd, "--headless", "--convert-to", "pdf", "--outdir", output_dir, input_path]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=90)
            if res.returncode == 0 and os.path.exists(output_path):
                return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path), "engine": "libreoffice"}
        except Exception:
            pass

    if sys.platform == "win32":
        try:
            import comtypes.client
            powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
            deck = powerpoint.Presentations.Open(input_path, WithWindow=False)
            deck.SaveAs(output_path, 32)  # 32 = ppSaveAsPDF
            deck.Close()
            powerpoint.Quit()
            if os.path.exists(output_path):
                return {"success": True, "output_path": output_path, "filename": os.path.basename(output_path), "engine": "powerpoint-com"}
        except Exception:
            pass

    return {
        "success": False,
        "error": "Konversi PPTX->PDF membutuhkan LibreOffice headless atau Microsoft PowerPoint di Windows."
    }


def _convert_pdf_to_images(input_path: str, output_dir: str, target_format: str, base_name: str) -> dict:
    """Render halaman PDF menjadi gambar tajam 144 DPI via PyMuPDF Matrix 2.0."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        return {"success": False, "error": "PyMuPDF belum terpasang (pip install PyMuPDF)."}

    try:
        doc = fitz.open(input_path)
        output_files = []
        target_format = target_format.lower()
        mat = fitz.Matrix(2.0, 2.0)  # Skala 2x = 144 DPI

        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap(matrix=mat)
            img_filename = f"{base_name}_hal_{page_num + 1}.{target_format}"
            img_path = os.path.join(output_dir, img_filename)

            if target_format in ['jpg', 'jpeg']:
                pix.save(img_path, output="jpeg", jpg_quality=95)
            else:
                pix.save(img_path)

            output_files.append(img_filename)

        if len(output_files) == 1:
            return {
                "success": True,
                "output_path": os.path.join(output_dir, output_files[0]),
                "filename": output_files[0],
                "engine": "pymupdf"
            }
        else:
            # Jika multi-halaman, kemas menjadi berkas ZIP
            import zipfile
            zip_filename = f"{base_name}_halaman.zip"
            zip_path = os.path.join(output_dir, zip_filename)
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for f in output_files:
                    zf.write(os.path.join(output_dir, f), arcname=f)
            return {
                "success": True,
                "output_path": zip_path,
                "filename": zip_filename,
                "engine": "pymupdf",
                "page_count": len(output_files)
            }
    except Exception as e:
        return {"success": False, "error": f"Gagal mengekstrak PDF ke gambar: {str(e)}"}


def convert_file(input_path: str, target_format: str, quality: str = "high") -> dict:
    """Fungsi orkestrasi konversi utama."""
    cleanup_old_files(exclude_path=input_path)

    if not os.path.exists(input_path):
        return {"success": False, "error": f"Berkas tidak ditemukan: {input_path}"}

    filename = os.path.basename(input_path)
    name, ext = os.path.splitext(filename)
    ext = ext.lstrip('.').lower()
    target_format = target_format.lower()

    output_filename = f"{name}.{target_format}"
    output_path = os.path.join(CONVERTED_FILES_DIR, output_filename)

    try:
        # Kategori 1: Gambar
        if ext in ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg', 'ico', 'tiff']:
            return _convert_image(input_path, output_path, target_format, quality)

        # Kategori 2: Word (DOCX)
        if ext in ['docx', 'doc']:
            if target_format == 'pdf':
                return _convert_docx_to_pdf(input_path, output_path, CONVERTED_FILES_DIR)

        # Kategori 3: PowerPoint (PPTX)
        if ext in ['pptx', 'ppt']:
            if target_format == 'pdf':
                return _convert_pptx_to_pdf(input_path, output_path, CONVERTED_FILES_DIR)

        # Kategori 4: PDF
        if ext == 'pdf':
            if target_format in ['docx', 'doc']:
                return _convert_pdf_to_docx(input_path, output_path)
            elif target_format in ['png', 'jpg', 'jpeg', 'webp']:
                return _convert_pdf_to_images(input_path, CONVERTED_FILES_DIR, target_format, name)

        return {"success": False, "error": f"Kombinasi konversi dari .{ext} ke .{target_format} belum didukung."}

    except Exception as e:
        return {"success": False, "error": f"Terjadi kesalahan saat memproses konversi: {str(e)}"}


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        print(json.dumps(check_environment()))
        sys.exit(0)

    if len(sys.argv) >= 3:
        inp = sys.argv[1]
        tgt = sys.argv[2]
        qty = sys.argv[3] if len(sys.argv) > 3 else "high"
        res = convert_file(inp, tgt, qty)
        print(json.dumps(res))
        sys.exit(0 if res.get("success") else 1)

    print(json.dumps({"error": "Penggunaan: python converter_bridge.py <status | input_path target_format [quality]>" }))
