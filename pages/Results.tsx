
import React, { useState, useMemo } from 'react';
import { Assessment } from '../types';
import { Download, Search, CheckCircle2, AlertCircle, Hash, History, ArrowUpRight } from 'lucide-react';

interface ResultsProps {
  assessments: Assessment[];
}

// Extension to include derived attempt number for display
interface EnrichedAssessment extends Assessment {
  attemptNumber: number;
}

const Results: React.FC<ResultsProps> = ({ assessments }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Process assessments to calculate attempt numbers (based on chronological order)
  const processedAssessments: EnrichedAssessment[] = useMemo(() => {
    // 1. Sort by time ascending to count attempts correctly
    const chronological = [...assessments].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const attemptsMap: Record<string, number> = {};
    
    return chronological.map(assessment => {
        // Create a unique key for Student + Checklist combo
        const key = `${assessment.studentId}_${assessment.checklistId}`;
        attemptsMap[key] = (attemptsMap[key] || 0) + 1;
        
        return {
            ...assessment,
            attemptNumber: attemptsMap[key]
        };
    });
  }, [assessments]);

  // Filter and sort by latest first for display
  const filtered = processedAssessments.filter(a => 
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.checklistTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.assessorName && a.assessorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assessment History</h2>
          <p className="text-slate-500">Review student performance, repeated attempts, and unique records.</p>
        </div>
        <button className="text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by student, checklist, assessor or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Ref ID</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Student</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Procedure</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Assessor</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Completion</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map(assessment => (
                            <tr key={assessment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 font-mono text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <Hash size={12} />
                                        <span title={assessment.id}>{assessment.id.slice(0, 8)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    {new Date(assessment.timestamp).toLocaleDateString()}
                                    <span className="block text-xs text-slate-400">
                                        {new Date(assessment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{assessment.studentName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-slate-800 text-sm">{assessment.checklistTitle}</span>
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            assessment.attemptNumber === 1 
                                            ? 'bg-slate-100 text-slate-500' 
                                            : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                            <History size={10} />
                                            Attempt {assessment.attemptNumber}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm font-medium text-indigo-900">{assessment.assessorName}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                        {assessment.completedStepIndices.length} / {assessment.totalSteps}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(assessment.score)}`}>
                                        {assessment.score >= 80 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                        {assessment.score}%
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                No assessment records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Results;
