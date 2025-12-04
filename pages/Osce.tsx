
import React, { useState } from 'react';
import { Plus, Calendar, Clock, Map, List, ChevronRight, Settings, Users, ArrowLeft, Trash2, Save, X, LayoutGrid, ArrowRight } from 'lucide-react';
import { OsceSession, OsceCircuit, OsceStation, Checklist } from '../types';

interface OsceProps {
  osceSessions: OsceSession[];
  setOsceSessions: React.Dispatch<React.SetStateAction<OsceSession[]>>;
  checklists: Checklist[];
}

const Osce: React.FC<OsceProps> = ({ osceSessions, setOsceSessions, checklists }) => {
  // Navigation State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'schedule'>('setup');

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCircuitModalOpen, setIsCircuitModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  // Form States (Session)
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');

  // Form States (Circuit)
  const [circuitTitle, setCircuitTitle] = useState('');
  
  // Form States (Station)
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);
  const [stationTitle, setStationTitle] = useState('');
  const [stationDesc, setStationDesc] = useState('');
  const [stationDuration, setStationDuration] = useState(10);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');

  // --- Handlers: Session ---

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: OsceSession = {
        id: crypto.randomUUID(),
        title: sessionTitle,
        date: sessionDate,
        startTime: sessionTime,
        status: 'upcoming',
        circuits: []
    };
    setOsceSessions([...osceSessions, newSession]);
    resetSessionForm();
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Delete this exam session?")) {
        setOsceSessions(osceSessions.filter(s => s.id !== id));
        if (selectedSessionId === id) setSelectedSessionId(null);
    }
  };

  const resetSessionForm = () => {
    setSessionTitle('');
    setSessionDate('');
    setSessionTime('');
    setIsSessionModalOpen(false);
  };

  // --- Handlers: Circuit ---

  const handleSaveCircuit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) return;

    setOsceSessions(prev => prev.map(session => {
        if (session.id === selectedSessionId) {
            return {
                ...session,
                circuits: [...session.circuits, {
                    id: crypto.randomUUID(),
                    title: circuitTitle,
                    stations: []
                }]
            };
        }
        return session;
    }));
    setCircuitTitle('');
    setIsCircuitModalOpen(false);
  };

  const deleteCircuit = (circuitId: string) => {
    if (!selectedSessionId) return;
    if(confirm("Delete this circuit?")) {
        setOsceSessions(prev => prev.map(session => {
            if (session.id === selectedSessionId) {
                return {
                    ...session,
                    circuits: session.circuits.filter(c => c.id !== circuitId)
                };
            }
            return session;
        }));
    }
  };

  // --- Handlers: Station ---

  const openStationModal = (circuitId: string) => {
    setSelectedCircuitId(circuitId);
    setIsStationModalOpen(true);
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !selectedCircuitId) return;

    // Find Checklist Title
    const cl = checklists.find(c => c.id === selectedChecklistId);
    
    setOsceSessions(prev => prev.map(session => {
        if (session.id === selectedSessionId) {
            return {
                ...session,
                circuits: session.circuits.map(circuit => {
                    if (circuit.id === selectedCircuitId) {
                        return {
                            ...circuit,
                            stations: [...circuit.stations, {
                                id: crypto.randomUUID(),
                                number: circuit.stations.length + 1,
                                title: stationTitle,
                                description: stationDesc,
                                durationMinutes: stationDuration,
                                checklistId: selectedChecklistId,
                                checklistTitle: cl ? cl.title : 'Unknown'
                            }]
                        };
                    }
                    return circuit;
                })
            };
        }
        return session;
    }));

    resetStationForm();
  };

  const deleteStation = (circuitId: string, stationId: string) => {
    if (!selectedSessionId) return;
    setOsceSessions(prev => prev.map(session => {
        if (session.id === selectedSessionId) {
            return {
                ...session,
                circuits: session.circuits.map(circuit => {
                    if (circuit.id === circuitId) {
                        return {
                            ...circuit,
                            stations: circuit.stations.filter(s => s.id !== stationId)
                        };
                    }
                    return circuit;
                })
            };
        }
        return session;
    }));
  };

  const resetStationForm = () => {
    setStationTitle('');
    setStationDesc('');
    setStationDuration(10);
    setSelectedChecklistId('');
    setSelectedCircuitId(null);
    setIsStationModalOpen(false);
  };

  // --- Render Helpers ---

  const selectedSession = osceSessions.find(s => s.id === selectedSessionId);

  // VIEW 1: Session List
  if (!selectedSessionId) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">OSCE Examination Management</h2>
                    <p className="text-slate-500">Coordinate Objectively Structured Clinical Exams.</p>
                </div>
                <button
                    onClick={() => setIsSessionModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
                >
                    <Plus size={18} />
                    New Exam Session
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {osceSessions.map(session => (
                    <div 
                        key={session.id} 
                        onClick={() => setSelectedSessionId(session.id)}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                                <Clock size={24} />
                            </div>
                            <button 
                                onClick={(e) => deleteSession(e, session.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
                            {session.title}
                        </h3>
                        <div className="space-y-2 mt-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                {session.date || 'Date TBD'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Settings size={16} className="text-slate-400" />
                                {session.circuits.length} Circuits Configured
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                                session.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 
                                session.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {session.status}
                            </span>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}

                {osceSessions.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Clock size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-slate-600 font-medium">No Exams Scheduled</h3>
                        <p className="text-slate-400 text-sm">Create a new session to get started.</p>
                    </div>
                )}
            </div>

            {/* New Session Modal */}
            {isSessionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Exam</h3>
                        <form onSubmit={handleSaveSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
                                <input required type="text" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Final Year OSCE" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input required type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                    <input required type="time" value={sessionTime} onChange={e => setSessionTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={resetSessionForm} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
  }

  // VIEW 2: Session Detail Manager
  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSelectedSessionId(null)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedSession?.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {selectedSession?.date}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {selectedSession?.startTime}</span>
                        <span className="flex items-center gap-1"><Map size={14} /> {selectedSession?.circuits.length} Circuits</span>
                    </div>
                </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('setup')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'setup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    <Settings size={16} /> Setup & Stations
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    <Users size={16} /> Schedule
                </button>
            </div>
        </div>

        {activeTab === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Col: Circuit List */}
                <div className="lg:col-span-1 space-y-4">
                    <button 
                        onClick={() => setIsCircuitModalOpen(true)}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Circuit
                    </button>

                    <div className="space-y-3">
                        {selectedSession?.circuits.map((circuit, index) => (
                             <div key={circuit.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-800">{circuit.title}</h4>
                                    <button onClick={() => deleteCircuit(circuit.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                                <p className="text-xs text-slate-500">{circuit.stations.length} Active Stations</p>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Right Col: Station Builder */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedSession?.circuits.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Add a circuit on the left to start building stations.
                        </div>
                    ) : (
                        selectedSession?.circuits.map(circuit => (
                            <div key={circuit.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <LayoutGrid size={18} /> {circuit.title} - Station Configuration
                                    </h3>
                                    <button 
                                        onClick={() => openStationModal(circuit.id)}
                                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Add Station
                                    </button>
                                </div>
                                <div className="p-4">
                                    {circuit.stations.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {circuit.stations.map((station, idx) => (
                                                <div key={station.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-800">{station.title}</h4>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {station.durationMinutes} mins</span>
                                                            <span className="flex items-center gap-1"><List size={14} /> Checklist: {station.checklistTitle}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{station.description}</p>
                                                    </div>
                                                    <button onClick={() => deleteStation(circuit.id, station.id)} className="p-2 text-slate-300 hover:text-red-500">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-sm italic">
                                            No stations in this circuit yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Rotation Schedule</h3>
                        <p className="text-sm text-slate-500">Visual matrix of student rotation.</p>
                    </div>
                </div>

                {/* Mock Schedule Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Time Slot</th>
                                {selectedSession?.circuits.flatMap(c => c.stations.map((s, i) => (
                                    <th key={s.id} className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap">
                                        {c.title} - St {i + 1}
                                    </th>
                                )))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="px-6 py-4 font-mono text-sm text-slate-500">09:00 - 09:10</td>
                                {selectedSession?.circuits.flatMap(c => c.stations.map(s => (
                                    <td key={s.id} className="px-6 py-4">
                                        <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                                            Student A
                                        </span>
                                    </td>
                                )))}
                            </tr>
                             <tr className="border-b border-slate-100">
                                <td className="px-6 py-4 font-mono text-sm text-slate-500">09:10 - 09:20</td>
                                {selectedSession?.circuits.flatMap(c => c.stations.map(s => (
                                    <td key={s.id} className="px-6 py-4">
                                        <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                                            Student B
                                        </span>
                                    </td>
                                )))}
                            </tr>
                            {selectedSession?.circuits.flatMap(c => c.stations).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400">Configure stations to generate schedule</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Modal: Add Circuit */}
        {isCircuitModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                    <h3 className="font-bold text-lg mb-4">Add Circuit / Track</h3>
                    <input autoFocus type="text" value={circuitTitle} onChange={e => setCircuitTitle(e.target.value)} className="w-full border p-2 rounded-lg mb-4" placeholder="e.g. Circuit A" />
                    <div className="flex gap-2">
                         <button onClick={() => setIsCircuitModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                         <button onClick={handleSaveCircuit} className="flex-1 py-2 bg-slate-900 text-white rounded-lg">Add</button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal: Add Station */}
        {isStationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                 <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                    <h3 className="font-bold text-lg mb-4">Configure Station</h3>
                    <form onSubmit={handleSaveStation} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Station Title</label>
                            <input required type="text" value={stationTitle} onChange={e => setStationTitle(e.target.value)} className="w-full border p-2 rounded-lg mt-1" placeholder="e.g. Abdominal Exam" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Scenario Description</label>
                            <textarea value={stationDesc} onChange={e => setStationDesc(e.target.value)} className="w-full border p-2 rounded-lg mt-1 h-20" placeholder="Instructions for student..." />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Custom Checklist (Grading)</label>
                            <select required value={selectedChecklistId} onChange={e => setSelectedChecklistId(e.target.value)} className="w-full border p-2 rounded-lg mt-1 bg-white">
                                <option value="">Select Base Checklist...</option>
                                {checklists.map(c => (
                                    <option key={c.id} value={c.id}>{c.title} ({c.yearLevel})</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">This checklist will be used to grade this specific station.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Duration (Minutes)</label>
                            <input type="number" value={stationDuration} onChange={e => setStationDuration(parseInt(e.target.value))} className="w-full border p-2 rounded-lg mt-1" />
                        </div>
                        <div className="flex gap-2 pt-2">
                             <button type="button" onClick={resetStationForm} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                             <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium">Save Station</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Osce;
