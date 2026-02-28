import os
import re
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

PDF_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_results')

def parse_result_content(raw_text, status):
    """
    Parses the raw content string into structured data.
    """
    parsed_data = {
        "semesters": [],
        "failed_subjects": []
    }

    # Clean up whitespace
    raw_text = raw_text.strip()
    
    if status == 'passed':
        # Format: gpa7: 2.80, gpa6: 2.86
        # Split by comma
        parts = raw_text.split(',')
        for part in parts:
            part = part.strip()
            if ':' in part:
                label, value = part.split(':', 1)
                parsed_data["semesters"].append({
                    "label": label.strip().replace('gpa', 'Semester '),
                    "value": value.strip(),
                    "status": "passed"
                })
    
    elif status == 'referred':
        # Format: gpa7: ref, gpa6: 3.82, ..., ref_sub: 26473(T)
        # We need to extract 'ref_sub' separately
        
        # Regex to find ref_sub part
        # specific handling for the layout
        ref_sub_match = re.search(r'ref_sub:\s*(.*)', raw_text, re.IGNORECASE | re.DOTALL)
        if ref_sub_match:
            ref_sub_text = ref_sub_match.group(1).strip()
            # It might end with a comma if there was more text (unlikely based on example) but let's be safe
            # Actually ref_sub is usually at the end.
            parsed_data["failed_subjects"] = [s.strip() for s in ref_sub_text.split(',') if s.strip()]
            
            # Remove ref_sub from raw_text to parse GPAs
            raw_text = raw_text[:ref_sub_match.start()].strip()
            if raw_text.endswith(','): raw_text = raw_text[:-1]

        parts = raw_text.split(',')
        for part in parts:
            part = part.strip()
            if ':' in part:
                label, value = part.split(':', 1)
                value = value.strip()
                status_code = "passed"
                if "ref" in value.lower():
                    status_code = "referred"
                
                parsed_data["semesters"].append({
                    "label": label.strip().replace('gpa', 'Semester '),
                    "value": value,
                    "status": status_code
                })

    elif status == 'failed':
        # Format: 25851(T), 25912(T)
        # Just a list of subjects
        parsed_data["failed_subjects"] = [s.strip() for s in raw_text.split(',') if s.strip()]

    return parsed_data

def get_status_from_match(match_text, bracket_type):
    if bracket_type == '(':
        return 'passed'
    if 'gpa' in match_text.lower():
        return 'referred'
    return 'failed'

def search_pdf(roll):
    if not os.path.exists(PDF_DIR):
        return None, "PDF results directory not found."

    pdf_files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith('.pdf')]
    if not pdf_files:
        return None, "No PDF result files found in data/pdf_results/."

    roll_pattern = str(roll)

    for pdf_file in pdf_files:
        pdf_path = os.path.join(PDF_DIR, pdf_file)
        try:
            doc = fitz.open(pdf_path)
        except Exception as e:
            print(f"Error opening {pdf_file}: {str(e)}")
            continue

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            hits = page.search_for(roll_pattern)
            
            if hits:
                text = page.get_text("text")
                
                # Check for { ... } (Referred/Failed)
                pattern_brace = re.compile(rf"\b{re.escape(roll_pattern)}\s*(\{{[\s\S]*?\}})""")
                match_brace = pattern_brace.search(text)
                
                if match_brace:
                    raw_content = match_brace.group(1) 
                    inner_text = raw_content[1:-1].strip()
                    
                    status = get_status_from_match(inner_text, '{')
                    structured_data = parse_result_content(inner_text, status)
                    
                    institute = get_institute_name(doc, page_num, roll)
                    
                    return {
                        "roll": roll,
                        "institute": institute,
                        "status": status,
                        "data": structured_data,
                        "raw_text": inner_text,
                        "source_file": pdf_file
                    }, None

                # Check for ( ... ) (Passed)
                pattern_paren = re.compile(rf"\b{re.escape(roll_pattern)}\s*(\([\s\S]*?\))""")
                match_paren = pattern_paren.search(text)
                
                if match_paren:
                    raw_content = match_paren.group(1)
                    inner_text = raw_content[1:-1].strip()
                    
                    status = 'passed'
                    structured_data = parse_result_content(inner_text, status)
                    
                    institute = get_institute_name(doc, page_num, roll)

                    return {
                        "roll": roll,
                        "institute": institute,
                        "status": status,
                        "data": structured_data,
                        "raw_text": inner_text,
                        "source_file": pdf_file
                    }, None
        doc.close()

    return None, "Roll number not found."

def get_institute_name(doc, start_page, roll):
    """
    Backtracks from the found page to find the Institute Name header.
    Format: ##### - Institute Name
    """
    # Look for 5 digits at start of line, followed by - 
    header_pattern = re.compile(r'^\d{5}\s+-[^\n]+', re.MULTILINE)

    # Limit backtracking to avoid infinite loops (e.g., 20 pages max)
    for page_idx in range(start_page, max(-1, start_page - 20), -1):
        page = doc.load_page(page_idx)
        text = page.get_text("text")
        
        # Find all headers on this page
        matches = list(header_pattern.finditer(text))
        
        if not matches:
            continue
            
        # If we are on the start_page, we must ensure the header is BEFORE the roll
        if page_idx == start_page:
            roll_idx = text.find(str(roll))
            # Filter matches that appear before the roll
            valid_matches = [m for m in matches if m.start() < roll_idx]
            if valid_matches:
                # The last valid match is the closest one above
                return valid_matches[-1].group(0).strip()
        else:
            # On previous pages, the last header found is the governing one
            return matches[-1].group(0).strip()
            
    return "Institute Not Found"

@app.route('/search')
@app.route('/api/search')
def search():
    roll = request.args.get('roll')
    if not roll:
        return jsonify({"error": "Roll number is required"}), 400

    result, error = search_pdf(roll)
    
    if error:
        return jsonify({"error": error}), 404
        
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
