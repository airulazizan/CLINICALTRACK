
import React, { useState } from 'react';
import { Plus, Trash2, X, Search, UserCheck, KeyRound, Edit } from 'lucide-react';
import { Assessor } from '../types';

interface AssessorsProps {
  assessors: Assessor[];
  setAssessors: React.Dispatch<React.SetStateAction<Assessor[]>>;
}

const Assessors: React.FC<AssessorsProps> = ({ assessors, setAssessors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleEdit = (assessor: Assessor) => {
    setEditingId(assessor.id);
    setName(assessor.name);
    setRole(assessor.role || '');
    setVerificationCode(assessor.verificationCode);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setAssessors(assessors.map(a => a.id === editingId ? {
        ...a,
        name,
        role,
        verificationCode
      } : a));
    } else {
      const newAssessor: Assessor = {
        id: crypto.randomUUID(),
        name,
        role,
        verificationCode
      };
      setAssessors([...assessors, newAssessor]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this assessor?")) {
      setAssessors(assessors.filter(a => a.id !== id));
    }
  };

  const resetForm = () => {
    setName('');
    setRole('');
    setVerificationCode('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const filteredAssessors = assessors.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.role && a.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assessor Management</h2>
          <p className="text-slate-500">Register faculty and staff authorized to conduct assessments.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={18} />
          Add Assessor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Assessor Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Role/Designation</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Verification PIN</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessors.length > 0 ? (
                filteredAssessors.map((assessor) => (
                  <tr key={assessor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {assessor.name.charAt(0)}
                        </div>
                        <span className="text-slate-800 font-medium">{assessor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{assessor.role || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <KeyRound size={14} className="text-slate-400" />
                        {assessor.verificationCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(assessor)}
                          className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(assessor.id)}
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
                    No assessors found.
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
                {editingId ? 'Edit Assessor' : 'Add Assessor'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Connor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Clinical Supervisor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verification PIN</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none font-mono tracking-widest"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="1234"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">This PIN is required to finalize assessments.</p>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                  {editingId ? 'Update Assessor' : 'Save Assessor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessors;
