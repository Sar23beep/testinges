import fitz # PyMuPDF
import os, sys
from pathlib import Path
from PIL import Image
import io

sys.stdout.reconfigure(encoding='utf-8')

downloads = Path(os.environ['USERPROFILE']) / 'Downloads'
model_pdfs = [
    downloads / "Ashley 💖 Model Profile.pdf",
    downloads / "Sonia Singh 💘💕 (1).pdf",
    downloads / "Dolly ki doli💃💞(All rounder).pdf",
    downloads / "Sonia Singh 💘💕.pdf"
]

output_dir = Path(r"C:\Escort\images\extracted_models")
output_dir.mkdir(parents=True, exist_ok=True)

extracted_files = []

for pdf_path in model_pdfs:
    if not pdf_path.exists():
        continue
    base_name = pdf_path.stem.split()[0]
    print(f"Reading {pdf_path.name}...")
    doc = fitz.open(pdf_path)
    print(f"  Pages: {len(doc)}")
    
    # Check text
    full_text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        full_text += f"\n--- Page {page_num+1} ---\n" + page.get_text()
        
        # Render page as high-res image
        pix = page.get_pixmap(dpi=200)
        img_filename = f"{base_name}_page_{page_num+1}.jpeg"
        img_path = output_dir / img_filename
        pix.save(img_path)
        extracted_files.append(img_path)
        print(f"  Rendered page {page_num+1} -> {img_filename} ({pix.width}x{pix.height})")
        
        # Also extract raw embedded images if any
        image_list = page.get_images(full=True)
        for img_idx, img_info in enumerate(image_list):
            xref = img_info[0]
            base_img = doc.extract_image(xref)
            image_bytes = base_img["image"]
            image_ext = base_img["ext"]
            raw_img = Image.open(io.BytesIO(image_bytes))
            if raw_img.width > 200 and raw_img.height > 200:
                raw_filename = f"{base_name}_raw_p{page_num+1}_img{img_idx+1}.{image_ext}"
                raw_path = output_dir / raw_filename
                with open(raw_path, "wb") as f:
                    f.write(image_bytes)
                print(f"    Extracted embedded image: {raw_filename} ({raw_img.width}x{raw_img.height})")

    print(f"  Text content:\n{full_text.strip()}")

print(f"\nTotal extracted images: {len(extracted_files)}")
