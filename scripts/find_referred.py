import fitz
import re

import os
PDF_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_results')

def find_referred():
    if not os.path.exists(PDF_DIR):
        return None
    pdf_files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith('.pdf')]
    for pdf_file in pdf_files:
        pdf_path = os.path.join(PDF_DIR, pdf_file)
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            # Look for 123456 { gpa... ref... }
            matches = re.findall(r'\d{6}\s*\{[^{}]*?\}', text)
            for m in matches:
                content = m[6:].strip()[1:-1].strip()
                if 'gpa' in content.lower() and 'ref' in content.lower():
                    roll = m[:6]
                    print(f"Roll: {roll} Content: {content} (File: {pdf_file})")
                    doc.close()
                    return roll
        doc.close()
    return None

if __name__ == "__main__":
    find_referred()
