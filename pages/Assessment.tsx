
import React, { useState, useEffect, useMemo } from 'react';
import { Student, Checklist, Assessor, Assessment as AssessmentType } from '../types';
import { User, ClipboardCheck, ArrowRight, Save, UserCheck, ShieldCheck, X, AlertCircle, CheckCircle2, Sparkles, Flame } from 'lucide-react';

interface AssessmentProps {
  students: Student[];
  checklists: Checklist[];
  assessors: Assessor[];
  assessments: AssessmentType[];
  addAssessment: (assessment: AssessmentType) => void;
  setView: (view: any) => void;
  setIsAssessmentActive: (active: boolean) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ students, checklists, assessors, assessments, addAssessment, setView, setIsAssessmentActive }) => {
  // Selection State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [selectedAssessorId, setSelectedAssessorId] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  // Filter State
  const [studentYearFilter, setStudentYearFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [checklistYearFilter, setChecklistYearFilter] = useState('');

  // Active Assessment State
  // Mapping index -> score (0, 1, or 2). Default undefined means 0.
  const [stepScores, setStepScores] = useState<Record<number, number>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Verification Modal State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Sync active state with parent App for navigation protection
  useEffect(() => {
    // Notify parent about assessment state
    setIsAssessmentActive(isStarted);

    // Prevent browser level refresh/back
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted) {
        e.preventDefault();
        e.returnValue = ''; // Standard for Chrome
      }
    };

    if (isStarted) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Ensure we reset parent state when unmounting (e.g. finishing successfully)
      setIsAssessmentActive(false);
    };
  }, [isStarted, setIsAssessmentActive]);

  // Derived Objects
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedChecklist = checklists.find(c => c.id === selectedChecklistId);
  const selectedAssessor = assessors.find(a => a.id === selectedAssessorId);

  // Determine Popular Checklists based on Assessment History
  const popularChecklists = useMemo(() => {
    const counts: Record<string, number> = {};
    assessments.forEach(a => {
        counts[a.checklistId] = (counts[a.checklistId] || 0) + 1;
    });

    return checklists
        .map(c => ({ ...c, count: counts[c.id] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4) // Top 4
        .filter(c => c.count > 0); // Only show if used at least once
  }, [assessments, checklists]);

  const handleQuickSelect = (checklist: Checklist) => {
    // Auto-set the year filter to match the checklist so dropdown is consistent
    setChecklistYearFilter(checklist.yearLevel);
    setSelectedChecklistId(checklist.id);
  };

  // Timer
  useEffect(() => {
    let interval: any;
    if (isStarted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted]);

  // --- Student Filtering Logic ---
  const uniqueStudentYears = Array.from(new Set(students.map(s => s.yearLevel))).sort();

  const availableGroups = React.useMemo(() => {
    let list = students;
    if (studentYearFilter) {
      list = list.filter(s => s.yearLevel === studentYearFilter);
    }
    return Array.from(new Set(list.map(s => s.group))).sort();
  }, [students, studentYearFilter]);

  const filteredStudents = students.filter(s => {
    const matchYear = studentYearFilter ? s.yearLevel === studentYearFilter : true;
    const matchGroup = groupFilter ? s.group === groupFilter : true;
    return matchYear && matchGroup;
  });

  // --- Checklist Filtering Logic ---
  const uniqueChecklistYears = Array.from(new Set(checklists.map(c => c.yearLevel))).sort();
  
  const filteredChecklists = checklistYearFilter 
    ? checklists.filter(c => c.yearLevel === checklistYearFilter) 
    : checklists;

  // --- Handlers ---
  const handleStudentYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStudentYearFilter(e.target.value);
    setGroupFilter(''); // Reset group as it might not exist in new year
    setSelectedStudentId('');
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupFilter(e.target.value);
    setSelectedStudentId('');
  };

  const handleScoreChange = (index: number, score: number) => {
    setStepScores(prev => ({
        ...prev,
        [index]: score
    }));
  };

  const handleFinishClick = () => {
    if (!selectedStudent || !selectedChecklist || !selectedAssessor) return;
    setIsVerifying(true);
    setVerificationError('');
    setVerificationPin('');
  };

  const confirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessor || !selectedChecklist) return;

    if (verificationPin !== selectedAssessor.verificationCode) {
        setVerificationError("Incorrect PIN. Please try again.");
        return;
    }

    // Success Calculation
    const totalSteps = selectedChecklist.steps.length;
    const maxPossibleScore = totalSteps * 2; // 2 points per step
    
    // Calculate sum of scores
    // Casting to number[] to avoid 'unknown' type error in reduce
    const earnedScore = (Object.values(stepScores) as number[]).reduce((acc, curr) => acc + curr, 0);
    
    // Calculate percentage
    const finalPercentage = maxPossibleScore > 0 
        ? Math.round((earnedScore / maxPossibleScore) * 100) 
        : 0;

    // Determine "Fully Completed" steps (where score is 2) for legacy compatibility/reporting
    const completedIndices = Object.entries(stepScores)
        .filter(([_, score]) => score === 2)
        .map(([index, _]) => parseInt(index));
    
    // Create Step Scores Array (fill 0 if undefined)
    const scoresArray = Array.from({ length: totalSteps }, (_, i) => stepScores[i] || 0);

    const assessment: AssessmentType = {
      id: crypto.randomUUID(),
      studentId: selectedStudent!.id,
      checklistId: selectedChecklist!.id,
      checklistTitle: selectedChecklist!.title,
      studentName: selectedStudent!.name,
      assessorName: selectedAssessor.name,
      completedStepIndices: completedIndices,
      stepScores: scoresArray,
      totalSteps: totalSteps,
      score: finalPercentage,
      timestamp: new Date().toISOString(),
    };

    addAssessment(assessment);
    
    // Explicitly clear active state before navigating so guard doesn't trigger
    setIsAssessmentActive(false);
    setView('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isStarted && selectedStudent && selectedChecklist && selectedAssessor) {
    // Live Calculation for Progress Bar
    // Casting to number[] to avoid 'unknown' type error in reduce
    const earnedScore = (Object.values(stepScores) as number[]).reduce((acc, curr) => acc + curr, 0);
    const maxPossible = selectedChecklist.steps.length * 2;
    const progressPercent = maxPossible > 0 ? Math.round((earnedScore / maxPossible) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center sticky top-4 z-10 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{selectedChecklist.title}</h2>
            <div className="flex items-center gap-3 text-sm mt-1">
                <span className="text-slate-500">Student: <span className="font-semibold text-slate-900">{selectedStudent.name}</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Assessor: <span className="font-semibold text-slate-900">{selectedAssessor.name}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
             <div className="text-right">
                <div className="text-2xl font-mono font-bold text-slate-900">{formatTime(timeElapsed)}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Duration</div>
             </div>
             <button 
                onClick={handleFinishClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-colors"
             >
                <Save size={20} />
                Finalize
             </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Current Score</span>
                <span className="text-sm font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                        progressPercent >= 80 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 px-2">
                <AlertCircle size={14} />
                <span><strong>0</strong> = Not Performed, <strong>1</strong> = Partially Performed, <strong>2</strong> = Fully Performed</span>
            </div>
            {selectedChecklist.steps.map((step, index) => {
                const score = stepScores[index] ?? 0;
                return (
                    <div 
                        key={index}
                        className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center gap-4 ${
                            score === 2 
                            ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' 
                            : score === 1 
                            ? 'bg-orange-50/50 border-orange-100'
                            : 'bg-white border-slate-100'
                        }`}
                    >
                        <div className="flex-1">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mt-0.5">
                                    {index + 1}
                                </span>
                                <p className={`text-base font-medium transition-colors ${
                                    score === 2 ? 'text-emerald-900' : score === 1 ? 'text-orange-900' : 'text-slate-700'
                                }`}>
                                    {step}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end md:self-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <button
                                onClick={() => handleScoreChange(index, 0)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    score === 0 
                                    ? 'bg-red-100 text-red-700 shadow-sm' 
                                    : 'text-slate-400 hover:text-red-500 hover:bg-white'
                                }`}
                            >
                                0
                            </button>
                            <button
                                onClick={() => handleScoreChange(index, 1)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    score === 1 
                                    ? 'bg-orange-100 text-orange-700 shadow-sm' 
                                    : 'text-slate-400 hover:text-orange-500 hover:bg-white'
                                }`}
                            >
                                1
                            </button>
                            <button
                                onClick={() => handleScoreChange(index, 2)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    score === 2 
                                    ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                                    : 'text-slate-400 hover:text-emerald-500 hover:bg-white'
                                }`}
                            >
                                2
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Verification Modal */}
        {isVerifying && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-600" size={20} />
                            Assessor Verification
                        </h3>
                        <button onClick={() => setIsVerifying(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={confirmVerification} className="p-6 space-y-4">
                        <div className="text-center mb-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2">
                                <UserCheck size={24} className="text-slate-600" />
                            </div>
                            <p className="font-medium text-slate-800">{selectedAssessor.name}</p>
                            <p className="text-xs text-slate-500">Please enter your verification PIN to sign off.</p>
                        </div>

                        <div>
                             <input
                                autoFocus
                                type="password"
                                className={`w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                                    verificationError 
                                    ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900' 
                                    : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
                                }`}
                                value={verificationPin}
                                onChange={(e) => setVerificationPin(e.target.value)}
                                placeholder="••••"
                                maxLength={8}
                             />
                             {verificationError && (
                                 <p className="text-xs text-red-500 mt-2 text-center font-medium">{verificationError}</p>
                             )}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center text-sm">
                            <span className="text-slate-500">Final Score:</span>
                            <span className="font-bold text-slate-900">{
                                maxPossible > 0 ? Math.round((earnedScore / maxPossible) * 100) : 0
                            }%</span>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-colors"
                        >
                            Verify & Submit Record
                        </button>
                    </form>
                 </div>
             </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4">
            <ClipboardCheck size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Start Assessment</h2>
        <p className="text-slate-500">Configure the session parameters below.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-8">
            
            {/* Student Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-2">
                    <User size={20} className="text-blue-500" />
                    <h3>Select Student</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Year of Study</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={studentYearFilter}
                            onChange={handleStudentYearChange}
                        >
                            <option value="">All Years</option>
                            {uniqueStudentYears.map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter Group</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={groupFilter}
                            onChange={handleGroupChange}
                        >
                            <option value="">All Groups</option>
                            {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="col-span-1 sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Student Name</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            disabled={filteredStudents.length === 0}
                        >
                            <option value="">
                                {filteredStudents.length === 0 
                                    ? 'No students found for selection' 
                                    : 'Choose Student...'}
                            </option>
                            {filteredStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.matricNumber})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Checklist Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-2">
                    <ClipboardCheck size={20} className="text-purple-500" />
                    <h3>Select Procedure</h3>
                </div>

                {/* Quick Shortcuts */}
                {popularChecklists.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 mb-2">
                            <Flame size={14} className="fill-orange-600" />
                            QUICK SHORTCUTS
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {popularChecklists.map(checklist => (
                                <button
                                    key={checklist.id}
                                    onClick={() => handleQuickSelect(checklist)}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-all text-left flex items-center gap-2 ${
                                        selectedChecklistId === checklist.id
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                    }`}
                                >
                                    <span className="truncate max-w-[150px]">{checklist.title}</span>
                                    <span className="text-[10px] opacity-70 bg-black/10 px-1.5 rounded-full">{checklist.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter Year</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={checklistYearFilter}
                            onChange={(e) => setChecklistYearFilter(e.target.value)}
                        >
                            <option value="">All Years</option>
                            {uniqueChecklistYears.map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Checklist</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={selectedChecklistId}
                            onChange={(e) => setSelectedChecklistId(e.target.value)}
                        >
                            <option value="">Choose Checklist...</option>
                            {filteredChecklists.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Assessor Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-2">
                    <UserCheck size={20} className="text-emerald-500" />
                    <h3>Select Assessor</h3>
                </div>
                
                <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Assessor</label>
                     <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={selectedAssessorId}
                        onChange={(e) => setSelectedAssessorId(e.target.value)}
                    >
                        <option value="">Choose Assessor...</option>
                        {assessors.map(a => (
                            <option key={a.id} value={a.id}>{a.name} {a.role ? `(${a.role})` : ''}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
            <button
                disabled={!selectedStudentId || !selectedChecklistId || !selectedAssessorId}
                onClick={() => setIsStarted(true)}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
            >
                Begin Assessment <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
