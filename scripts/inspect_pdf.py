import fitz
import os

PDF_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_results')

def inspect_context(roll):
    if not os.path.exists(PDF_DIR):
        print(f"Directory not found: {PDF_DIR}")
        return

    pdf_files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith('.pdf')]
    for pdf_file in pdf_files:
        pdf_path = os.path.join(PDF_DIR, pdf_file)
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            if page.search_for(str(roll)):
                print(f"--- Found in {pdf_file} on Page {page_num + 1} ---")
                # Get text blocks to see layout
                blocks = page.get_text("blocks")
                # Sort by vertical position
                blocks.sort(key=lambda b: b[1])
                
                for b in blocks:
                    print(b[4].strip())
        doc.close()

if __name__ == "__main__":
    import sys
    roll_to_inspect = sys.argv[1] if len(sys.argv) > 1 else 601108
    inspect_context(roll_to_inspect)
