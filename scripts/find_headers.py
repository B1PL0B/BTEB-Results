import fitz
import re
import os

def find_headers():
    PDF_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_results')
    pdf_files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith('.pdf')]
    if not pdf_files:
        print("No PDFs found.")
        return
    pdf_path = os.path.join(PDF_DIR, pdf_files[0])
    doc = fitz.open(pdf_path)
    # Check first 20 pages
    for i in range(20):
        page = doc.load_page(i)
        text = page.get_text("text")
        lines = text.split('\n')
        for line in lines:
            # Look for 5 digits at start of line, followed by text
            # OR Look for "Institute"
            if "Institute" in line or "Polytechnic" in line:
                print(f"Page {i}: {line.strip()}")
            elif re.match(r'^\d{5}\s+-', line):
                print(f"Page {i} [CODE]: {line.strip()}")

find_headers()
