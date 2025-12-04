
import React, { useState } from 'react';
import { Plus, Trash2, ListChecks, Sparkles, Loader2, X, AlignLeft, Search, FolderOpen, BookOpen, Edit } from 'lucide-react';
import { Checklist, Subject } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface ChecklistsProps {
  checklists: Checklist[];
  setChecklists: React.Dispatch<React.SetStateAction<Checklist[]>>;
  subjects: Subject[];
}

const Checklists: React.FC<ChecklistsProps> = ({ checklists, setChecklists, subjects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [entryMode, setEntryMode] = useState<'list' | 'text'>('list');

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) return;
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleEdit = (checklist: Checklist) => {
    setEditingId(checklist.id);
    setTitle(checklist.title);
    setSubjectId(checklist.subjectId || '');
    setYearLevel(checklist.yearLevel);
    setSteps([...checklist.steps]);
    setEntryMode('list'); // Default to list view on open
    setIsModalOpen(true);
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    const validSteps = steps.filter(s => s.trim() !== '');
    if (validSteps.length === 0) {
        alert("Please add at least one step.");
        return;
    }
    
    // Find subject name for display cache
    const selectedSubject = subjects.find(s => s.id === subjectId);
    const subjectTitle = selectedSubject ? selectedSubject.title : 'General';

    if (editingId) {
        // Update existing
        setChecklists(checklists.map(c => c.id === editingId ? {
            ...c,
            title,
            subjectId,
            subject: subjectTitle,
            yearLevel,
            steps: validSteps,
        } : c));
    } else {
        // Create new
        const newChecklist: Checklist = {
            id: crypto.randomUUID(),
            title,
            subjectId,
            subject: subjectTitle,
            yearLevel,
            steps: validSteps,
        };
        setChecklists([...checklists, newChecklist]);
    }

    resetForm();
  };

  const deleteChecklist = (id: string) => {
    if (window.confirm("Are you sure you want to delete this checklist?")) {
        setChecklists(checklists.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubjectId('');
    setYearLevel('');
    setSteps(['']);
    setEditingId(null);
    setIsModalOpen(false);
    setIsGenerating(false);
    setEntryMode('list');
  };

  const generateWithAI = async () => {
    if (!title) {
        alert("Please enter a title first to generate steps.");
        return;
    }
    setIsGenerating(true);
    
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
             throw new Error("API Key not found");
        }

        const selectedSubject = subjects.find(s => s.id === subjectId);
        const subjectName = selectedSubject ? selectedSubject.title : 'Clinical Skills';

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Create a clinical skills checklist for medical students. 
        Title: "${title}". 
        Subject: "${subjectName}".
        Level: "Year ${yearLevel || 'General'}".
        Return ONLY a JSON object with a "steps" property which is an array of strings representing the checklist steps in chronological order. Limit to 10 key steps.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        steps: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text;
        if (jsonText) {
            const parsed = JSON.parse(jsonText);
            if (parsed.steps && Array.isArray(parsed.steps)) {
                setSteps(parsed.steps);
            }
        }
    } catch (error) {
        console.error("AI Generation failed", error);
        alert("Could not generate steps. Please try manually or check your API key.");
    } finally {
        setIsGenerating(false);
    }
  };

  // Filter and Group Logic
  const filteredChecklists = checklists.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.yearLevel.includes(searchTerm)
  );

  // Group by Year Level
  const groupedChecklists = filteredChecklists.reduce((groups, checklist) => {
    const year = checklist.yearLevel;
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(checklist);
    return groups;
  }, {} as Record<string, Checklist[]>);

  // Sort Years (numeric if possible, otherwise string sort)
  const sortedYears = Object.keys(groupedChecklists).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Checklist Library</h2>
          <p className="text-slate-500">Define clinical competencies by year and subject.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={18} />
          Create Checklist
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by title, subject, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
        />
      </div>

      {/* Grouped Display */}
      <div className="space-y-8">
        {sortedYears.length > 0 ? (
            sortedYears.map((year) => (
                <div key={year} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                            <FolderOpen size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Year {year}</h3>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {groupedChecklists[year].length}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {groupedChecklists[year].map((checklist) => (
                            <div key={checklist.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                <div 
                                    className="p-5 cursor-pointer"
                                    onClick={() => handleEdit(checklist)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <BookOpen size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wide truncate max-w-[120px]">{checklist.subject}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteChecklist(checklist.id); }}
                                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-base font-bold text-slate-900 mb-1 leading-tight">{checklist.title}</h4>
                                    
                                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <ListChecks size={14} /> {checklist.steps.length} Steps
                                        </span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEdit(checklist); }}
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            View & Edit
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-5 py-2 border-t border-slate-100">
                                    <div className="w-full bg-slate-200 rounded-full h-1">
                                        <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                    <ListChecks size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No checklists found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your search or create a new one.</p>
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Checklist' : 'New Checklist'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="checklistForm" onSubmit={handleSaveChecklist} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Checklist Title</label>
                        <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. IV Cannulation"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Module</label>
                            <select
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none bg-white"
                                value={subjectId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSubjectId(val);
                                    // Auto-select year based on subject
                                    const selectedSub = subjects.find(s => s.id === val);
                                    if (selectedSub) {
                                        setYearLevel(selectedSub.yearLevel);
                                    }
                                }}
                            >
                                <option value="">Select Subject...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.code} - {s.title}</option>
                                ))}
                            </select>
                            {subjects.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">No subjects found. Please register subjects first.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Year Level</label>
                            <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                            value={yearLevel}
                            onChange={(e) => setYearLevel(e.target.value)}
                            placeholder="e.g. 3"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900">AI Assist</h4>
                        <p className="text-xs text-indigo-700">Auto-generate standard clinical steps based on title.</p>
                    </div>
                    <button 
                        type="button"
                        onClick={generateWithAI}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Generate Steps
                    </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">Procedural Steps</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setEntryMode('list')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${entryMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <ListChecks size={14} /> List
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntryMode('text')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${entryMode === 'text' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <AlignLeft size={14} /> Bulk Text
                        </button>
                    </div>
                  </div>

                  {entryMode === 'list' ? (
                    <>
                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <div key={index} className="flex gap-2">
                            <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500 text-sm font-bold">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              required
                              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                              value={step}
                              onChange={(e) => handleStepChange(index, e.target.value)}
                              placeholder={`Step ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(index)}
                              className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                              disabled={steps.length === 1}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 py-2 px-3 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Plus size={16} /> Add Next Step
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                         <textarea
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none font-medium text-slate-600 min-h-[300px] leading-relaxed"
                            value={steps.join('\n')}
                            onChange={(e) => setSteps(e.target.value.split('\n'))}
                            placeholder={`1. Wash hands\n2. Introduce self\n3. Check patient ID...`}
                        />
                        <p className="text-xs text-slate-400 text-right">Each line represents one step.</p>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
               <button 
                type="submit" 
                form="checklistForm"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
               >
                  {editingId ? 'Update Checklist' : 'Save Checklist'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklists;
