import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResultPDF from './ResultPDF';
import booklist from './booklist.json';
import CGPACalculator from './CGPACalculator';

function App() {
  const [view, setView] = useState('portal'); // 'portal' or 'calculator'
  const [roll, setRoll] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('landscape');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!roll) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/search?roll=${roll}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Result not found');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'portal', label: 'Result Portal', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'calculator', label: 'CGPA Calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01m-10-6h18' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navigation Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('portal')}>
              <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">BTEB <span className="text-indigo-600">Results</span></span>
            </div>

            <div className="hidden md:flex gap-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === item.id
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="md:hidden flex gap-2">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setView(item.id)} className={`p-2 rounded-lg ${view === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">
        {view === 'calculator' ? (
          <CGPACalculator initialGpas={result ? result.data.semesters : []} />
        ) : (
          <div className="space-y-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Student Result Finder</h1>
              <p className="text-slate-500">Enter your roll number to access your official academic records.</p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleSearch} className="flex gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 relative">
                <div className="flex-1 flex items-center px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="number"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder="Enter Roll Number..."
                    className="w-full py-3 focus:outline-none text-lg font-medium bg-transparent text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transform transition active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Search Result"}
                </button>
              </form>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium animate-pulse">
                  {error}
                </div>
              )}
            </div>

            {/* Result Display Area */}
            {result && (
              <div id="result-content" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Sidebar: Student Info */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex flex-col items-center mb-6 text-center">
                      <div className="w-24 h-24 bg-indigo-50 rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center text-indigo-500">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{result.institute ? result.institute.replace(/^\d+\s+-\s+/, '') : 'Unknown Institute'}</h3>
                      <span className="text-slate-500 font-medium text-sm mt-2 block">
                        Code: {result.institute ? result.institute.split(' ')[0] : 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-4 border-t pt-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Roll Number</span>
                        <span className="font-bold text-slate-700">{result.roll}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Status</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getResultStatusStyle(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.data.failed_subjects && result.data.failed_subjects.length > 0 && (
                    <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                      <h3 className="text-red-800 font-bold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        {result.status === 'referred' ? 'Pending Subjects' : 'Failed Subjects'}
                      </h3>
                      <div className="space-y-2">
                        {result.data.failed_subjects.map((sub, idx) => {
                          const cleanCode = sub.split('(')[0].trim();
                          const book = booklist.find(b => b.code === cleanCode);
                          const bookDisplay = book ? `${book.bookname} (${sub})` : `Subject ${sub}`;

                          return (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-red-200 flex justify-between items-center">
                              <span className="text-sm font-semibold text-slate-700">{bookDisplay}</span>
                              <span className="text-xs text-red-500 font-medium whitespace-nowrap ml-2">Re-appear</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Content: Grades Table */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-slate-800 text-center md:text-left">Performance Dashboard</h3>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Premium Compact Layout</p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button onClick={() => setOrientation('portrait')} className={`px-2 py-1 text-[10px] font-bold rounded-lg ${orientation === 'portrait' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>PORTRAIT</button>
                          <button onClick={() => setOrientation('landscape')} className={`px-2 py-1 text-[10px] font-bold rounded-lg ${orientation === 'landscape' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>LANDSCAPE</button>
                        </div>
                        <select
                          value={pageSize}
                          onChange={(e) => setPageSize(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="A4">A4</option>
                          <option value="LETTER">LETTER</option>
                          <option value="LEGAL">LEGAL</option>
                        </select>
                        <PDFDownloadLink
                          document={<ResultPDF result={result} pageSize={pageSize} orientation={orientation} />}
                          fileName={`Result_${result.roll}_Dashboard.pdf`}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                        >
                          {({ loading }) => (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                              {loading ? 'Preparing PDF...' : 'Download Transcript'}
                            </>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>

                    <div className="p-8">
                      {result.data.semesters && result.data.semesters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.data.semesters.map((sem, idx) => (
                            <div key={idx} className={`p-5 border rounded-2xl flex justify-between items-center group transition cursor-default
                                ${sem.status === 'referred'
                                ? 'border-red-50 bg-red-50/20'
                                : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md'
                              }`}>
                              <span className="text-slate-500 font-medium">{sem.label}</span>
                              {sem.status === 'referred' ? (
                                <span className="text-sm font-black text-red-500 uppercase tracking-widest">Referred</span>
                              ) : (
                                <span className="text-lg font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg border">{sem.value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 py-10">
                          No semester GPA details available.
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="text-center p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
                          <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wider">Status</p>
                          <h4 className="text-xl font-black">{result.status.toUpperCase()}</h4>
                        </div>
                        <div className="text-center p-6 bg-white border border-slate-200 rounded-3xl">
                          <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Credits</p>
                          <h4 className="text-3xl font-black text-slate-800">--</h4>
                        </div>
                        <div className="text-center p-6 bg-white border border-slate-200 rounded-3xl">
                          <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Institute</p>
                          <h4 className="text-sm font-bold text-slate-700 line-clamp-2">{result.institute ? result.institute.replace(/^\d+\s+-\s+/, '') : 'BTEB'}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BTEB Information Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-slate-200 pt-16">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-6">About the Bangladesh Technical Education Board</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    The **BTEB** is the state regulatory board for technical and vocational education in Bangladesh. It oversees curriculum development, accreditation, and the examination process for over 73 technical programs.
                  </p>
                  <p>
                    Students can find official circulars, semester-wise PDF results, and admission guidelines at the official BTEB portal.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <a href="http://bteb.gov.bd" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                      Official Website <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                    <a href="http://www.btebadmission.gov.bd" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                      Admission Portal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Diploma in Engineering</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">Core Responsibilities & Standards</p>
                <div className="space-y-4">
                  {[
                    "Standardized 4-year technical curriculum",
                    "Semester-wise GPA based evaluation system",
                    "Industrial training integration for seniors",
                    "Nationwide certification valid for govt. sectors"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="bg-indigo-50 text-indigo-600 rounded-full p-1 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="text-slate-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm font-medium italic">Powered by BTEB Results ❤️ for students</p>
      </footer>
    </div>
  );
}

function getResultStatusStyle(status) {
  switch (status) {
    case 'passed': return 'bg-green-50 text-green-700 border-green-200';
    case 'referred': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'failed': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-50 text-slate-700';
  }
}

export default App;
