## BTEB Student Result Finder

A high-performance, modern web application for searching and analyzing academic results from BTEB PDF files. This tool supports searching across multiple PDF documents, viewing semester-wise performance, calculating CGPA, and downloading official-style transcripts.

---

## 🚀 Key Features

- **Multi-PDF Search**: Automatically crawls and searches for student rolls across all PDF files in the result directory.
- **Semester Performance Dashboard**: Visualizes GPA and status for all semesters.
- **Automatic Subject Lookup**: Resolves subject codes to full names using a pre-processed booklist.
- **CGPA Calculator**: Interactive tool to calculate and simulate CGPA based on semester results.
- **Professional PDF Exports**: Generate and download premium, transcript-style PDFs of search results.
- **Premium UI**: Ultra-clean, responsive design with glassmorphism and smooth animations.

---

## 🏛️ About Bangladesh Technical Education Board (BTEB)

The **Bangladesh Technical Education Board (BTEB)** is a state regulatory board responsible for the supervision and development of technical and vocational education in Bangladesh. Established in 1967, it plays a critical role in producing skilled manpower for the nation.

### Key Responsibilities:
- **Curriculum Development**: Designing and updating curricula for various technical programs including Diploma in Engineering, Agriculture, Textile Engineering, and more.
- **Examination Management**: Conducting public examinations and publishing results for over 73 different curricula.
- **Accreditation**: Granting recognition to technical institutions across the country.

### Official Resources:
- **Official Website**: [bteb.gov.bd](http://bteb.gov.bd)
- **Admission Portal**: [btebadmission.gov.bd](http://www.btebadmission.gov.bd)
- **Results Publication**: Results are typically published as PDF files categorized by technology and semester.

---

## 🛠️ System Architecture

The project is built with a decoupled architecture for maximum flexibility:

1.  **Backend (Python/Flask)**:
    - Uses `PyMuPDF` (fitz) for high-speed, accurate PDF text extraction and search.
    - Implements a REST API that serves search results in structured JSON format.
    - Path backtracking logic to automatically find the student's institute name from PDF headers.

2.  **Frontend (React/Vite)**:
    - Modern React 19 components with Tailwind CSS for styling.
    - `@react-pdf/renderer` for client-side professional PDF generation.
    - Optimized for performance with Vite.

---

## 💻 Local Setup Guide

### 1. Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### 2. Backend Setup
```bash
# Navigate to the backend directory (or stay in root if using specific commands)
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```
*The backend will start at `http://127.0.0.1:5000`.*

### 3. Frontend Setup
```bash
# In the project root
npm install

# Run the development server
npm run dev
```
*The frontend will start at `http://localhost:5173`.*

---

## 📂 Project Structure

- `backend/`: Flask application, API logic, and templates.
- `scripts/`: Utility scripts for processing PDFs and updating the booklist.
- `data/pdf_results/`: **Drop all result PDF files here.** The system will search all files in this folder.
- `src/`: React source code (App, Components, Styles).
- `public/`: Static assets.

---

## 🌐 Deployment to Vercel

This project is pre-configured for deployment on Vercel as a hybrid application.

### Step-by-Step Guide:

1.  **Install Vercel CLI**:
    ```bash
    npm install -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```

3.  **Deploy**:
    Run the following command in the project root:
    ```bash
    vercel
    ```
    - Follow the prompts to link the project.
    - Vercel will automatically detect the `vercel.json` configuration.
    - It will build the React frontend and deploy the Python backend as serverless functions.

4.  **Production Deployment**:
    ```bash
    vercel --prod
    ```

### Vercel Configuration Details
The included `vercel.json` handles:
- Routing `/api/*` requests to the Flask backend.
- Serving the React application for all other routes.
- Configuring the Python runtime for serverless functions.

---

## 🛠️ Maintenance & Utilities

- **Updating Booklist**: If you modify `data/all-booklist.md`, run:
  ```bash
  python scripts/parse_booklist.py
  ```
- **Inspecting PDFs**: To see how a specific roll appears in the PDF layout:
  ```bash
  python scripts/inspect_pdf.py [roll_number]
  ```

---

*Powered by BTEB Results ❤️ for students.*
