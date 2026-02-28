import re
import json
import os

def parse_booklist(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    books = {}
    current_dept_code = "UNKNOWN"
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Match Department/Technology name and code
        # Example: # Technology Name: Civil Technology (64)
        dept_match = re.search(r'# (?:Technology Name|Technology)[\s:-]+(.*?)(?:\((\d+)\))?$', line, re.IGNORECASE)
        if dept_match:
            name_part = dept_match.group(1).strip()
            code_part = dept_match.group(2)
            if code_part:
                current_dept_code = code_part
            continue
            
        # Match Book Name and Code
        # Example: Engineering Drawing (21011) or 1. Physics-2 (25922)
        book_match = re.search(r'(?:\d+\.\s*)?(.*?)\s*\((\d+)\)?', line)
        if book_match:
            book_name = book_match.group(1).strip()
            book_code = book_match.group(2).strip()
            
            # Use book_code as key to avoid duplicates and allow easy lookup
            if book_code not in books:
                books[book_code] = {
                    "bookname": book_name,
                    "code": book_code,
                    "dept_code": current_dept_code
                }
    
    return list(books.values())

if __name__ == "__main__":
    input_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'all-booklist.md')
    output_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'booklist.json')
    
    book_data = parse_booklist(input_file)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(book_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully created {output_file} with {len(book_data)} books.")
