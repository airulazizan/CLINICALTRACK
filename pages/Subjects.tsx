
import React, { useState } from 'react';
import { Plus, Trash2, X, Search, Edit, GraduationCap } from 'lucide-react';
import { Subject } from '../types';

interface SubjectsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

const Subjects: React.FC<SubjectsProps> = ({ subjects, setSubjects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [yearLevel, setYearLevel] = useState('');

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setCode(subject.code);
    setTitle(subject.title);
    setYearLevel(subject.yearLevel || '1');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setSubjects(subjects.map(s => s.id === editingId ? {
        ...s,
        code,
        title,
        yearLevel: yearLevel || '1'
      } : s));
    } else {
      const newSubject: Subject = {
        id: crypto.randomUUID(),
        code,
        title,
        yearLevel: yearLevel || '1'
      };
      setSubjects([...subjects, newSubject]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this subject? Checklists linked to this subject will need to be updated.")) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setCode('');
    setTitle('');
    setYearLevel('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYearFilter === 'All' || s.yearLevel === selectedYearFilter;
    return matchesSearch && matchesYear;
  });

  // Get unique years
  const uniqueYears = ['All', ...Array.from(new Set(subjects.map(s => s.yearLevel || '1'))).sort()];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subject Registry</h2>
          <p className="text-slate-500">Manage courses and clinical modules by year.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={18} />
          Register Subject
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>

        {/* Year Filter */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex overflow-x-auto min-w-0 md:w-auto">
            {uniqueYears.map((year) => (
                <button
                    key={year}
                    onClick={() => setSelectedYearFilter(year)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        selectedYearFilter === year 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {year === 'All' ? 'All Years' : `Year ${year}`}
                </button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Year</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Subject Code</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Subject Title</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                     <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <GraduationCap size={14} /> Year {subject.yearLevel || '1'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">
                            {subject.code}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{subject.title}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Subject' : 'Register New Subject'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Code</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none uppercase font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Title</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clinical Skills Foundation"
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year Level</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                  {editingId ? 'Update Subject' : 'Register Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;