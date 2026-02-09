
import React, { useState, useMemo, useCallback } from 'react';
import { EVALUATION_SECTIONS, RUMAH_SUKAN_OPTIONS, SCRIPT_URL, SHEET_EXPORT_URL, ADMIN_PASSWORD } from './constants';
import { FormData, SummaryResult } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const splitCSVLine = (line: string) => {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    let char = line[i];
    if (char === '"') inQuote = !inQuote;
    else if (char === ',' && !inQuote) {
      result.push(cur.trim());
      cur = "";
    } else cur += char;
  }
  result.push(cur.trim());
  return result;
};

const App: React.FC = () => {
  const [view, setView] = useState<'evaluation' | 'results'>('evaluation');
  const [isSaving, setIsSaving] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<null | 'success' | 'error'>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [summaryResults, setSummaryResults] = useState<SummaryResult[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    rumahSukan: '',
    namaHakim: '',
    ulasan: '',
    scores: {}
  });

  const sectionTotals = useMemo(() => {
    return EVALUATION_SECTIONS.reduce((acc, section) => {
      acc[section.id] = section.criteria.reduce((sum, c) => sum + (formData.scores[c.id] || 0), 0);
      return acc;
    }, {} as Record<string, number>);
  }, [formData.scores]);

  const grandTotal = useMemo(() => Object.values(sectionTotals).reduce((a: number, b: number) => a + b, 0), [sectionTotals]);

  const handleScoreChange = (id: string, val: number, max: number) => {
    const score = Math.min(Math.max(0, val), max);
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [id]: score }
    }));
  };

  const handleSave = async () => {
    if (!formData.rumahSukan || !formData.namaHakim) {
      alert("Sila pilih Rumah Sukan dan isi Nama Hakim!");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        rumahSukan: formData.rumahSukan,
        namaHakim: formData.namaHakim,
        sectionA: sectionTotals['A'],
        sectionB: sectionTotals['B'],
        sectionC: sectionTotals['C'],
        sectionD: sectionTotals['D'],
        sectionE: sectionTotals['E'],
        totalScore: grandTotal,
        ulasan: formData.ulasan
      };
      
      await fetch(SCRIPT_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload) 
      });
      
      setSubmissionStatus('success');
    } catch (e) {
      console.error(e);
      setSubmissionStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchResults = useCallback(async () => {
    setIsLoadingResults(true);
    try {
      const response = await fetch(`${SHEET_EXPORT_URL}&t=${Date.now()}`);
      const csvText = await response.text();
      const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
      
      if (lines.length > 1) {
        const summaryRows = lines.slice(1).map(splitCSVLine);
        const results: SummaryResult[] = summaryRows.map(row => {
          return {
            rumahSukan: row[0] || 'N/A',
            totalScore: parseFloat(row[1]) || 0,
            count: 0
          };
        }).filter(r => r.rumahSukan !== 'N/A' && r.rumahSukan !== '');

        setSummaryResults(results.sort((a,b) => b.totalScore - a.totalScore));
      }
    } catch (e) {
      console.error("Gagal mengambil data", e);
    } finally {
      setIsLoadingResults(false);
    }
  }, []);

  const handleAuth = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setShowPasswordModal(false);
      setView('results');
      fetchResults();
    } else {
      alert("Kata laluan salah!");
    }
  };

  const getHouseColor = (name: string) => {
    if (name.includes('Merah')) return '#E63946';
    if (name.includes('Biru')) return '#0077B6';
    if (name.includes('Hijau')) return '#2A9D8F';
    if (name.includes('Kuning')) return '#FFD166';
    return '#1A1A1A';
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Mecha White Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#E63946] rounded-sm flex items-center justify-center shadow-[4px_4px_0_#1A1A1A]">
              <i className="fa-solid fa-microchip text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-orbitron font-black text-2xl tracking-tight text-[#1A1A1A]">
                MARCHING<span className="text-[#E63946]">PRO</span> <span className="text-[#FFD166] drop-shadow-sm">v6</span>
              </h1>
              <p className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-[0.4em] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#E63946] block"></span> Mecha White Protocol
              </p>
            </div>
          </div>
          
          <nav className="flex gap-4">
            <button 
              onClick={() => setView('evaluation')}
              className={`tab-mecha ${view === 'evaluation' ? 'active' : 'text-gray-400 hover:text-black'}`}
            >
              Penilaian
            </button>
            <button 
              onClick={() => isAuthorized ? setView('results') : setShowPasswordModal(true)}
              className={`tab-mecha ${view === 'results' ? 'active' : 'text-gray-400 hover:text-black'}`}
            >
              Analisis
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 md:p-10 flex-grow">
        {view === 'evaluation' ? (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Control Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="mecha-card p-10">
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 text-[#1A1A1A]">
                    <i className="fa-solid fa-fingerprint"></i>
                  </div>
                  <h3 className="font-orbitron font-bold text-xs uppercase tracking-widest text-gray-800">Operator Identity</h3>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#E63946] mb-3 block tracking-widest">Target Unit</label>
                    <select 
                      value={formData.rumahSukan}
                      onChange={e => setFormData({...formData, rumahSukan: e.target.value})}
                      className="w-full bg-[#F2F2F2] border-none p-4 rounded-none font-bold text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#E63946] transition-all appearance-none uppercase"
                    >
                      <option value="">PILIH UNIT KAWAD</option>
                      {RUMAH_SUKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#E63946] mb-3 block tracking-widest">Hakim Name</label>
                    <input 
                      type="text"
                      placeholder="NAMA HAKIM"
                      value={formData.namaHakim}
                      onChange={e => setFormData({...formData, namaHakim: e.target.value.toUpperCase()})}
                      className="w-full bg-[#F2F2F2] border-none p-4 rounded-none font-bold text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#E63946] transition-all placeholder:text-gray-400 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* High Score Visualizer */}
              <div className="mecha-card p-10 bg-white relative">
                <div className="flex flex-col items-center text-center">
                  <p className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.5em] mb-6">Aggregate Power Score</p>
                  <div className="relative">
                     <span className="text-9xl font-orbitron font-black text-[#1A1A1A] leading-none">{grandTotal}</span>
                     <div className="absolute -top-4 -right-8 bg-[#FFD166] text-black px-2 py-0.5 text-[10px] font-bold">PTS</div>
                  </div>
                  <div className="mt-8 w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className="h-full bg-[#E63946] transition-all duration-700 ease-out"
                      style={{ width: `${grandTotal}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full btn-mecha flex items-center justify-center gap-4 text-sm"
              >
                {isSaving ? <i className="fa-solid fa-gear animate-spin"></i> : <i className="fa-solid fa-upload"></i>}
                {isSaving ? 'MEMPROSES DATA...' : 'HANTAR SKOR UNIT'}
              </button>
            </div>

            {/* Assessment Area */}
            <div className="lg:col-span-8 space-y-10">
              {EVALUATION_SECTIONS.map((section) => (
                <div key={section.id} className="mecha-card">
                  <div className="bg-[#F2F2F2] p-8 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white border border-gray-200 rounded-sm flex items-center justify-center text-[#E63946] text-xl shadow-sm">
                        <i className={`fa-solid ${section.icon}`}></i>
                      </div>
                      <div>
                        <h4 className="font-orbitron font-bold text-sm uppercase text-[#1A1A1A] tracking-wider">{section.title}</h4>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sector Protocol {section.id}</p>
                      </div>
                    </div>
                    <div className="bg-white px-8 py-3 border border-gray-200 flex items-center gap-4 shadow-sm">
                      <span className="text-4xl font-orbitron font-black text-[#1A1A1A]">{sectionTotals[section.id]}</span>
                      <div className="h-8 w-[1px] bg-gray-200"></div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">MAX {section.totalMax}</span>
                    </div>
                  </div>
                  
                  <div className="p-10 space-y-12">
                    {section.criteria.map(c => (
                      <div key={c.id}>
                        <div className="flex justify-between items-end mb-6">
                          <p className="font-bold text-[#1A1A1A] text-lg max-w-[70%] leading-tight tracking-tight uppercase">{c.description}</p>
                          <div className="text-right bg-[#F2F2F2] px-6 py-2 border-l-4 border-[#FFD166]">
                             <span className="text-3xl font-orbitron font-bold text-[#1A1A1A]">{formData.scores[c.id] || 0}</span>
                             <span className="text-[10px] text-gray-400 ml-2">/ {c.maxScore}</span>
                          </div>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max={c.maxScore}
                          value={formData.scores[c.id] || 0}
                          onChange={e => handleScoreChange(c.id, parseInt(e.target.value), c.maxScore)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mecha-card p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                    <i className="fa-solid fa-terminal text-[#E63946]"></i>
                  </div>
                  <h3 className="font-orbitron font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">Technical Commentary</h3>
                </div>
                <textarea 
                  placeholder="LOG INPUT >_"
                  value={formData.ulasan}
                  onChange={e => setFormData({...formData, ulasan: e.target.value})}
                  className="w-full bg-[#F2F2F2] border-none p-6 text-[#1A1A1A] font-mono text-sm placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#E63946] min-h-[160px] transition-all uppercase"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Results Dashboard */}
            <div className="mecha-card p-12 md:p-16 relative bg-white">
               <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
                 <div>
                   <h2 className="font-orbitron font-black text-4xl md:text-6xl tracking-tighter text-[#1A1A1A] uppercase italic">
                     ANALYTIC<span className="text-[#E63946]">OVERVIEW</span>
                   </h2>
                   <div className="tech-line mt-4"></div>
                   <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.6em] mt-2">Real-time Performance Metrics</p>
                 </div>
                 <button onClick={fetchResults} className="w-20 h-20 bg-[#1A1A1A] flex items-center justify-center hover:bg-[#E63946] text-white transition-all shadow-lg group">
                   <i className={`fa-solid fa-rotate text-3xl ${isLoadingResults ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}></i>
                 </button>
               </div>

               <div className="h-[450px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={summaryResults} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                     <XAxis 
                       dataKey="rumahSukan" 
                       axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }}
                       tickLine={false}
                       fontSize={10} 
                       tickFormatter={(v) => v.split(' ')[0].toUpperCase()} 
                       tick={{ fontWeight: '800', fill: '#1A1A1A', fontFamily: 'Orbitron' }}
                     />
                     <YAxis axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} tickLine={false} fontSize={10} domain={[0, 100]} tick={{ fill: '#1A1A1A', fontWeight: 'bold' }} />
                     <Tooltip 
                       cursor={{ fill: 'rgba(230, 57, 70, 0.05)' }}
                       contentStyle={{ backgroundColor: '#FFF', border: '2px solid #1A1A1A', borderRadius: '0', color: '#1A1A1A', fontFamily: 'Orbitron', fontWeight: 'bold' }}
                     />
                     <Bar dataKey="totalScore" radius={[0, 0, 0, 0]} barSize={50}>
                       {summaryResults.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={getHouseColor(entry.rumahSukan)} stroke="#1A1A1A" strokeWidth={1} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Ranking Matrix */}
            <div className="mecha-card overflow-hidden">
               <div className="bg-[#1A1A1A] p-8 flex items-center justify-between">
                  <h3 className="font-orbitron font-black text-sm uppercase tracking-[0.3em] text-white">Ranking Matrix</h3>
                  <div className="flex gap-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/10 px-4 py-1">Auto-Sync Enabled</span>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                      <tr className="bg-[#F2F2F2] text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                        <th className="px-12 py-8 text-left">POS</th>
                        <th className="px-12 py-8 text-left">Unit Designation</th>
                        <th className="px-12 py-8 text-right">Final Aggregate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summaryResults.map((res, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-all group">
                          <td className="px-12 py-10">
                            <span className={`w-14 h-14 flex items-center justify-center font-orbitron font-black text-2xl border-2 ${i === 0 ? 'bg-[#FFD166] border-[#1A1A1A] text-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A]' : 'bg-white border-gray-200 text-gray-300'}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-12 py-10">
                            <div className="flex items-center gap-8">
                               <div className="w-12 h-12 flex items-center justify-center text-white text-sm font-black shadow-md" style={{backgroundColor: getHouseColor(res.rumahSukan)}}>
                                  {res.rumahSukan.charAt(0)}
                               </div>
                               <span className="font-orbitron font-bold text-2xl tracking-tighter uppercase text-[#1A1A1A] group-hover:text-[#E63946] transition-colors">{res.rumahSukan}</span>
                            </div>
                          </td>
                          <td className="px-12 py-10 text-right">
                             <span className="font-orbitron font-black text-5xl text-[#1A1A1A] group-hover:scale-110 inline-block transition-transform">{res.totalScore.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Overlay Mecha White */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] bg-[#1A1A1A]/90 backdrop-blur-md flex items-center justify-center p-6">
           <div className="mecha-card p-12 max-w-md w-full text-center border-t-8 border-[#E63946]">
              <div className="w-24 h-24 bg-gray-100 text-[#1A1A1A] rounded-full flex items-center justify-center text-4xl mx-auto mb-10 shadow-[0_0_0_8px_rgba(255,255,255,0.1)]">
                <i className="fa-solid fa-key"></i>
              </div>
              <h3 className="font-orbitron font-black text-xl uppercase mb-3 text-[#1A1A1A]">Override Required</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-12">Authorized Personnel Only</p>
              <input 
                type="password"
                placeholder="••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-[#F2F2F2] border-b-4 border-[#1A1A1A] p-6 text-center text-4xl font-black text-[#E63946] outline-none mb-10 focus:border-[#FFD166] transition-all tracking-[0.4em]"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
              <button onClick={handleAuth} className="w-full btn-mecha">Initialize Override</button>
              <button onClick={() => setShowPasswordModal(false)} className="mt-8 text-gray-400 text-[10px] font-black uppercase hover:text-black transition-colors tracking-widest">Abort Process</button>
           </div>
        </div>
      )}

      {/* Transmission Success Portal */}
      {submissionStatus === 'success' && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6">
           <div className="text-center relative z-10 max-w-xl">
              <div className="w-40 h-40 bg-[#E63946] text-white flex items-center justify-center text-8xl mx-auto mb-12 shadow-[12px_12px_0_#1A1A1A] success-pulse">
                 <i className="fa-solid fa-satellite-dish"></i>
              </div>
              <h2 className="font-orbitron font-black text-6xl mb-6 tracking-tighter text-[#1A1A1A] uppercase italic">
                TRANSMISSION<br/><span className="text-[#E63946]">COMPLETE</span>
              </h2>
              <p className="font-bold text-gray-400 uppercase tracking-[0.6em] text-[12px] mb-16">Data Packets Successfully Synchronized to Central Registry</p>
              <button 
                onClick={() => { setSubmissionStatus(null); setFormData({ rumahSukan: '', namaHakim: '', ulasan: '', scores: {} }); }}
                className="btn-mecha px-20 py-6"
              >
                Return to Deck
              </button>
           </div>
           
           {/* Technical grid background for success page */}
           <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="h-full w-full bg-[linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] [background-size:20px_20px]"></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
