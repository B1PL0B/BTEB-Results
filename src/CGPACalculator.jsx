import React, { useState, useEffect } from 'react';

const BTEB_REGULATIONS = {
    '2022': [2, 2, 5, 10, 10, 20, 25, 26],
    '2016': [5, 5, 5, 10, 15, 20, 25, 15],
    '2010': [5, 5, 5, 10, 10, 20, 25, 20],
};

const CGPACalculator = ({ initialGpas = [] }) => {
    const [regulation, setRegulation] = useState('2022');
    const [gpas, setGpas] = useState(Array(8).fill(''));
    const [inputRoll, setInputRoll] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // Autofill if initialGpas change
    useEffect(() => {
        if (initialGpas && initialGpas.length > 0) {
            populateFromResults(initialGpas);
        }
    }, [initialGpas]);

    const populateFromResults = (semesters) => {
        const newGpas = Array(8).fill('');
        semesters.forEach((gpaObj) => {
            const match = gpaObj.label.match(/Semester\s+(\d+)/i);
            if (match) {
                const semesterNum = parseInt(match[1]);
                if (semesterNum >= 1 && semesterNum <= 8 && gpaObj.status === 'passed') {
                    newGpas[semesterNum - 1] = gpaObj.value;
                }
            }
        });
        setGpas(newGpas);
    };

    const handleFetchRoll = async () => {
        if (!inputRoll) return;
        setIsFetching(true);
        setFetchError('');

        try {
            const response = await fetch(`http://127.0.0.1:5000/search?roll=${inputRoll}`);
            const data = await response.json();

            if (response.ok) {
                populateFromResults(data.data.semesters);
            } else {
                setFetchError(data.error || 'Roll not found');
            }
        } catch (err) {
            setFetchError('Failed to fetch results');
        } finally {
            setIsFetching(false);
        }
    };

    const handleGpaChange = (index, value) => {
        const newGpas = [...gpas];
        newGpas[index] = value;
        setGpas(newGpas);
    };

    const calculateCGPA = () => {
        const weights = BTEB_REGULATIONS[regulation];
        let totalWeightedGpa = 0;
        let totalWeightUsed = 0;

        gpas.forEach((gpa, index) => {
            const gpaNum = parseFloat(gpa);
            if (!isNaN(gpaNum)) {
                totalWeightedGpa += gpaNum * (weights[index] / 100);
                totalWeightUsed += weights[index];
            }
        });

        if (totalWeightUsed === 0) return '0.00';
        const finalCgpa = (totalWeightedGpa / (totalWeightUsed / 100));
        return finalCgpa.toFixed(2);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">BTEB CGPA Calculator</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    Calculate your Cumulative Grade Point Average (CGPA) for BTEB diploma programs.
                    Supports regulations 2010, 2016, and 2022 with accurate weightage.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Calculator Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-800">Enter Semester GPAs</h3>
                                    <p className="text-sm text-slate-500">Leave blank for semesters not yet completed.</p>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-2xl">
                                    {Object.keys(BTEB_REGULATIONS).map((reg) => (
                                        <button
                                            key={reg}
                                            onClick={() => setRegulation(reg)}
                                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${regulation === reg
                                                    ? 'bg-white text-indigo-600 shadow-sm scale-105'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {reg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {gpas.map((gpa, index) => (
                                    <div key={index} className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                            {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Semest
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={gpa}
                                            onChange={(e) => handleGpaChange(index, e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-center font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none placeholder:text-slate-200"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-200">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Your CGPA Result</p>
                                        <h2 className="text-4xl font-black text-indigo-600 tabular-nums">{calculateCGPA()}</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setGpas(Array(8).fill('')); setInputRoll(''); setFetchError(''); }}
                                    className="group flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines Block */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-black">?</span>
                            How to Use
                        </h3>
                        <ul className="space-y-4 text-slate-300">
                            <li className="flex gap-4">
                                <span className="font-bold text-indigo-400">01.</span>
                                Select your Regulation year (2010, 2016, or 2022).
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-indigo-400">02.</span>
                                Enter your GPA for each completed semester manually or use the Autofill.
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-indigo-400">03.</span>
                                The CGPA will update instantly based on mandated weightage.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sidebar info */}
                <div className="space-y-6">
                    {/* Autofill Card */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100 border border-white">
                        <h4 className="font-bold text-slate-800 mb-2 px-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Autofill
                        </h4>
                        <p className="text-xs text-slate-500 mb-6 px-2">Fetch your GPAs instantly from our database using your roll number.</p>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={inputRoll}
                                    onChange={(e) => setInputRoll(e.target.value)}
                                    placeholder="Enter Roll Number"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={handleFetchRoll}
                                disabled={isFetching || !inputRoll}
                                className="w-full bg-slate-900 text-white rounded-2xl py-3 text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isFetching ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : 'Fetch GPAs'}
                            </button>
                            {fetchError && <p className="text-[10px] text-red-500 font-bold text-center mt-2">{fetchError}</p>}
                        </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white shadow-xl">
                        <h4 className="font-bold text-slate-800 mb-6 px-2">Semester Weightage</h4>
                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3">Sem</th>
                                        <th className="px-4 py-3">2010</th>
                                        <th className="px-4 py-3">2016</th>
                                        <th className="px-4 py-3">2022</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-600">{idx + 1}st</td>
                                            <td className="px-4 py-3 text-slate-500">{BTEB_REGULATIONS['2010'][idx]}%</td>
                                            <td className="px-4 py-3 text-slate-500">{BTEB_REGULATIONS['2016'][idx]}%</td>
                                            <td className="px-4 py-3 text-slate-500">{BTEB_REGULATIONS['2022'][idx]}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2">Pro Tip</h4>
                        <p className="text-indigo-700 text-sm leading-relaxed">
                            Use the result search first to automatically fetch your GPAs! After finding a result, switch back here to see your Autofilled CGPA.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CGPACalculator;
