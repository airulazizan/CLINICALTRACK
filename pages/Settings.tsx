
import React, { useState } from 'react';
import { CalendarClock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SettingsProps {
  onPromoteStudents: () => void;
  studentCount: number;
}

const Settings: React.FC<SettingsProps> = ({ onPromoteStudents, studentCount }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handlePromote = () => {
    onPromoteStudents();
    setIsConfirmOpen(false);
    setSuccessMessage('Successfully updated academic year for all active students.');
    
    // Clear message after 3 seconds
    setTimeout(() => {
        setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
          <p className="text-slate-500">Manage academic sessions and global configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Academic Year Management Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <CalendarClock size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Academic Year Management</h3>
                    <p className="text-sm text-slate-500">Control the transition between academic sessions.</p>
                </div>
            </div>
            
            <div className="p-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                    <h4 className="font-semibold text-slate-800 mb-2">Advance Academic Year</h4>
                    <p className="text-sm text-slate-600 mb-4">
                        This action allows you to transition the system to the next academic year. 
                        It will automatically update student records by incrementing their "Year of Study" by 1.
                        <br/><br/>
                        <span className="font-medium italic">Example: A "Year 1" student becomes "Year 2".</span>
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                        <AlertTriangle size={16} />
                        <span>This will affect <strong>{studentCount}</strong> student records immediately.</span>
                    </div>

                    <button 
                        onClick={() => setIsConfirmOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/10"
                    >
                        Start New Academic Year <ArrowRight size={16} />
                    </button>
                </div>
                
                {successMessage && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 border border-emerald-100">
                        <CheckCircle2 size={18} />
                        {successMessage}
                    </div>
                )}
            </div>
        </div>

        {/* Placeholder for future settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 opacity-50 grayscale select-none">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Semester Configuration</h3>
            <p className="text-sm text-slate-500 mb-4">Manage semester dates and active terms (Coming Soon).</p>
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                  <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Confirm Year Rollover?</h3>
                <p className="text-sm text-red-700 mt-1">
                    You are about to increment the Year Level for all students. This action cannot be easily undone without database restoration.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="text-sm text-slate-600">
                    <p><strong>Action Summary:</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-1">
                        <li>Year 1 students &#8594; Year 2</li>
                        <li>Year 2 students &#8594; Year 3</li>
                        <li>Year 3 students &#8594; Year 4</li>
                        <li>Year 4/5 students &#8594; Year 5/6 (or Graduated)</li>
                    </ul>
                </div>
                
                <div className="pt-2 flex gap-3">
                    <button 
                        onClick={() => setIsConfirmOpen(false)}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handlePromote}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                    >
                        Yes, Promote Students
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
