
import React, { useState } from 'react';
import { Plus, Trash2, Upload, X, Search, GraduationCap, Edit, ChevronDown, ChevronUp, BarChart3, Mail, Phone, Contact } from 'lucide-react';
import { Student, Checklist, Assessment, Subject } from '../types';

interface StudentsProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  checklists: Checklist[];
  assessments: Assessment[];
  subjects: Subject[];
}

const Students: React.FC<StudentsProps> = ({ students, setStudents, checklists, assessments, subjects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('All');
  
  // Expanded State for Progress
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Individual Form State
  const [newName, setNewName] = useState('');
  const [newMatric, setNewMatric] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Bulk Form State
  const [bulkData, setBulkData] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedStudentId(prev => prev === id ? null : id);
  };

  const handleEdit = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling expand when clicking edit
    setEditingId(student.id);
    setNewName(student.name);
    setNewMatric(student.matricNumber);
    setNewGroup(student.group);
    setNewYear(student.yearLevel);
    setNewEmail(student.email || '');
    setNewPhone(student.phoneNumber || '');
    
    // Ensure we are in individual mode
    setIsBulkMode(false);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        // Update existing student
        setStudents(students.map(s => s.id === editingId ? {
            ...s,
            name: newName,
            matricNumber: newMatric,
            group: newGroup,
            yearLevel: newYear || '1',
            email: newEmail,
            phoneNumber: newPhone,
        } : s));
    } else {
        // Create new student
        const student: Student = {
            id: crypto.randomUUID(),
            name: newName,
            matricNumber: newMatric,
            group: newGroup,
            yearLevel: newYear || '1',
            email: newEmail,
            phoneNumber: newPhone,
        };
        setStudents([...students, student]);
    }
    resetForm();
  };

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkData.trim().split('\n');
    const newStudents: Student[] = lines.map(line => {
      const parts = line.split(',').map(s => s.trim());
      // Expecting: Name, Matric, Group, Year, Email, Phone
      return {
        id: crypto.randomUUID(),
        name: parts[0] || 'Unknown',
        matricNumber: parts[1] || 'N/A',
        group: parts[2] || 'General',
        yearLevel: parts[3] || '1',
        email: parts[4] || '',
        phoneNumber: parts[5] || '',
      };
    }).filter(s => s.name !== 'Unknown');

    setStudents([...students, ...newStudents]);
    resetForm();
  };

  const deleteStudent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling expand when clicking delete
    if (window.confirm("Are you sure you want to remove this student?")) {
        setStudents(students.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewMatric('');
    setNewGroup('');
    setNewYear('');
    setNewEmail('');
    setNewPhone('');
    setBulkData('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  // Helper to calculate progress per subject for a specific student
  const getStudentProgress = (studentId: string) => {
    // 1. Get all unique checklists completed by this student
    const studentCompletedIds = new Set(
        assessments
            .filter(a => a.studentId === studentId)
            .map(a => a.checklistId)
    );

    // 2. Map through REGISTERED SUBJECTS to ensure all are shown
    const progress = subjects.map(subject => {
        // Find all checklists associated with this subject
        const subjectChecklists = checklists.filter(c => c.subjectId === subject.id || c.subject === subject.title);
        const total = subjectChecklists.length;
        
        let completed = 0;
        subjectChecklists.forEach(c => {
            if (studentCompletedIds.has(c.id)) {
                completed++;
            }
        });
        
        return {
            subjectTitle: subject.title,
            subjectCode: subject.code,
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }).sort((a, b) => b.percentage - a.percentage);

    return progress;
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYearFilter === 'All' || s.yearLevel === selectedYearFilter;
    return matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const uniqueYears = ['All', ...Array.from(new Set(students.map(s => s.yearLevel))).sort()];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Directory</h2>
          <p className="text-slate-500">Manage student cohorts and track individual progress.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsBulkMode(false); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or matric number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>

        {/* Year Filter Tabs/Dropdown */}
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
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Student Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Matric No.</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Year Level</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Group</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isExpanded = expandedStudentId === student.id;
                  const progressData = isExpanded ? getStudentProgress(student.id) : [];

                  return (
                    <React.Fragment key={student.id}>
                        <tr 
                            className={`border-b border-slate-100 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                        >
                            <td className="px-6 py-4" onClick={() => toggleExpand(student.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shadow-sm">
                                        {student.name.charAt(0)}
                                    </div>
                                    <span className="text-slate-800 font-medium">{student.name}</span>
                                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-sm" onClick={() => toggleExpand(student.id)}>{student.matricNumber}</td>
                            <td className="px-6 py-4" onClick={() => toggleExpand(student.id)}>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    <GraduationCap size={14} /> Year {student.yearLevel}
                                </span>
                            </td>
                            <td className="px-6 py-4" onClick={() => toggleExpand(student.id)}>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                    {student.group}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={(e) => handleEdit(student, e)}
                                        className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => deleteStudent(student.id, e)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {/* Expandable Details Row */}
                        {isExpanded && (
                            <tr className="bg-slate-50/80 animate-in fade-in slide-in-from-top-2 duration-200">
                                <td colSpan={5} className="px-6 py-4 pb-6">
                                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            
                                            {/* Left: Contact Info */}
                                            <div className="lg:col-span-1 space-y-4 border-r border-slate-100 pr-6">
                                                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase tracking-wide mb-2">
                                                    <Contact size={16} className="text-indigo-500" />
                                                    Student Profile
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs text-slate-400 uppercase font-semibold">Email</label>
                                                        <div className="flex items-center gap-2 text-slate-700 mt-0.5">
                                                            <Mail size={14} className="text-slate-400" />
                                                            <span className="text-sm font-medium">{student.email || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 uppercase font-semibold">Phone</label>
                                                        <div className="flex items-center gap-2 text-slate-700 mt-0.5">
                                                            <Phone size={14} className="text-slate-400" />
                                                            <span className="text-sm font-medium">{student.phoneNumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                                        <div>
                                                             <label className="text-xs text-slate-400 uppercase font-semibold">Matric</label>
                                                             <p className="font-mono text-sm text-slate-600">{student.matricNumber}</p>
                                                        </div>
                                                        <div>
                                                             <label className="text-xs text-slate-400 uppercase font-semibold">Group</label>
                                                             <p className="font-mono text-sm text-slate-600">{student.group}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Progress */}
                                            <div className="lg:col-span-2 pl-2">
                                                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm uppercase tracking-wide">
                                                    <BarChart3 size={16} className="text-emerald-500" />
                                                    Course Procedures Progress
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                    {progressData.length > 0 ? (
                                                        progressData.map((data) => (
                                                            <div key={data.subjectCode}>
                                                                <div className="flex justify-between items-end mb-1">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-slate-700">{data.subjectTitle}</span>
                                                                        <span className="text-[10px] font-mono text-slate-400">{data.subjectCode}</span>
                                                                    </div>
                                                                    <span className="text-xs font-medium text-slate-500">
                                                                        {data.completed} / {data.total} <span className="text-slate-400">procedures</span>
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                                    <div 
                                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                                            data.percentage === 100 ? 'bg-emerald-500' :
                                                                            data.percentage >= 50 ? 'bg-blue-500' : 
                                                                            'bg-slate-300'
                                                                        }`} 
                                                                        style={{ width: `${data.percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic col-span-2">No subjects registered.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No students found matching your filters.
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId 
                  ? 'Edit Student' 
                  : (isBulkMode ? 'Bulk Entry' : 'Add New Student')
                }
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* Toggle Mode (Only show if not editing) */}
              {!editingId && (
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isBulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    onClick={() => setIsBulkMode(false)}
                    >
                    Individual
                    </button>
                    <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isBulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    onClick={() => setIsBulkMode(true)}
                    >
                    Bulk Import
                    </button>
                </div>
              )}

              {!isBulkMode ? (
                <form onSubmit={handleSaveStudent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="student@uni.edu"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="+1 555-0000"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        placeholder="e.g. 1"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Matric No.</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                        value={newMatric}
                        onChange={(e) => setNewMatric(e.target.value)}
                        placeholder="e.g. A12345"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        placeholder="e.g. A1"
                    />
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                      {editingId ? 'Update Student' : 'Save Student'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleBulkAdd} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                    <p className="text-sm text-blue-800 font-medium">Format: Name, Matric, Group, Year, Email, Phone</p>
                    <p className="text-xs text-blue-600 mt-1">Example: John Doe, A123, GroupA, 1, john@uni.edu, 555-0123</p>
                  </div>
                  <textarea
                    required
                    className="w-full h-48 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none font-mono text-sm"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder={`John Doe, A123, A, 1, john@mail.com, 555-100\nJane Smith, B456, B, 2, jane@mail.com, 555-200`}
                  />
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      <Upload size={18} /> Process Batch
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
