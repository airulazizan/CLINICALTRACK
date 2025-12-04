import React from 'react';
import { Users, ClipboardList, CheckCircle2, TrendingUp, BookOpen, GraduationCap, BarChart } from 'lucide-react';
import { Student, Checklist, Assessment } from '../types';

interface DashboardProps {
  students: Student[];
  checklists: Checklist[];
  assessments: Assessment[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, checklists, assessments }) => {
  const averageScore = assessments.length > 0
    ? Math.round(assessments.reduce((acc, curr) => acc + curr.score, 0) / assessments.length)
    : 0;

  // -- Computations for New Sections --

  // 1. Performance by Year of Study
  const yearPerformance = React.useMemo(() => {
    const years: Record<string, { totalScore: number; count: number }> = {};
    
    assessments.forEach(assessment => {
      const student = students.find(s => s.id === assessment.studentId);
      if (student) {
        const year = student.yearLevel;
        if (!years[year]) years[year] = { totalScore: 0, count: 0 };
        years[year].totalScore += assessment.score;
        years[year].count += 1;
      }
    });

    return Object.entries(years)
      .map(([year, data]) => ({
        year,
        avg: Math.round(data.totalScore / data.count),
        count: data.count
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [assessments, students]);

  // 2. Performance by Course/Subject
  const subjectPerformance = React.useMemo(() => {
    const subjects: Record<string, { totalScore: number; count: number }> = {};

    assessments.forEach(assessment => {
        const checklist = checklists.find(c => c.id === assessment.checklistId);
        if (checklist) {
            const subject = checklist.subject;
            if (!subjects[subject]) subjects[subject] = { totalScore: 0, count: 0 };
            subjects[subject].totalScore += assessment.score;
            subjects[subject].count += 1;
        }
    });

    return Object.entries(subjects)
      .map(([subject, data]) => ({
          subject,
          avg: Math.round(data.totalScore / data.count),
          count: data.count
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [assessments, checklists]);

  // 3. Checklist Breakdown
  const checklistStats = React.useMemo(() => {
    return checklists.map(checklist => {
        const relevantAssessments = assessments.filter(a => a.checklistId === checklist.id);
        const count = relevantAssessments.length;
        const avg = count > 0 
            ? Math.round(relevantAssessments.reduce((acc, curr) => acc + curr.score, 0) / count)
            : 0;
        return { ...checklist, count, avg };
    }).sort((a, b) => b.count - a.count); // Sort by usage popularity
  }, [checklists, assessments]);


  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users size={24} />, color: 'bg-blue-500', subtext: 'Registered' },
    { label: 'Active Checklists', value: checklists.length, icon: <ClipboardList size={24} />, color: 'bg-purple-500', subtext: 'Available' },
    { label: 'Assessments', value: assessments.length, icon: <CheckCircle2 size={24} />, color: 'bg-emerald-500', subtext: 'Completed' },
    { label: 'Avg. Score', value: `${averageScore}%`, icon: <TrendingUp size={24} />, color: 'bg-orange-500', subtext: 'Performance' },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1">Analysis by Cohort, Subject, and Performance.</p>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg shadow-current/20`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Cohort Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <GraduationCap size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Performance by Year of Study</h3>
            </div>
            
            <div className="space-y-4">
                {yearPerformance.length > 0 ? (
                    yearPerformance.map((item) => (
                        <div key={item.year}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-slate-700">Year {item.year}</span>
                                <div className="flex gap-3 text-xs">
                                    <span className="text-slate-400">{item.count} assessments</span>
                                    <span className="font-bold text-slate-900">{item.avg}% Avg</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${item.avg >= 80 ? 'bg-emerald-500' : item.avg >= 50 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                    style={{ width: `${item.avg}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No data available yet.</p>
                )}
            </div>
        </div>

        {/* Subject Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <BookOpen size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Performance by Course Title</h3>
            </div>

            <div className="space-y-4">
                {subjectPerformance.length > 0 ? (
                    subjectPerformance.map((item) => (
                        <div key={item.subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm">{item.subject}</h4>
                                <p className="text-xs text-slate-500">{item.count} records</p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                item.avg >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                                item.avg >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {item.avg}%
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No subject data available yet.</p>
                )}
            </div>
        </div>
      </div>

      {/* Checklist Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <BarChart size={20} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">Checklist Analytics</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Checklist Title</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Subject</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Target Year</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Assessments</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Avg. Score</th>
                    </tr>
                </thead>
                <tbody>
                    {checklistStats.map(c => (
                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                            <td className="px-6 py-4 font-medium text-slate-900">{c.title}</td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{c.subject}</td>
                            <td className="px-6 py-4 text-slate-600 text-sm">Year {c.yearLevel}</td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                                    {c.count}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-medium text-slate-800">
                                {c.count > 0 ? `${c.avg}%` : '-'}
                            </td>
                        </tr>
                    ))}
                    {checklistStats.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                No checklists available.
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

export default Dashboard;