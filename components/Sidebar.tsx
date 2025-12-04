
import React from 'react';
import { LayoutDashboard, Users, ClipboardList, Stethoscope, BarChart3, Activity, UserCheck, Book, Settings, LogOut, Timer } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isMobileMenuOpen, closeMobileMenu, user, onLogout }) => {
  const menuItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'students', label: 'Students', icon: <Users size={20} /> },
    { id: 'subjects', label: 'Subjects', icon: <Book size={20} /> },
    { id: 'checklists', label: 'Checklists', icon: <ClipboardList size={20} /> },
    { id: 'osce', label: 'OSCE Exam', icon: <Timer size={20} /> },
    { id: 'assessors', label: 'Assessors', icon: <UserCheck size={20} /> },
    { id: 'assess', label: 'Assessment', icon: <Stethoscope size={20} /> },
    { id: 'results', label: 'Results', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobileMenu}
      />
      
      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ClinicalTrack</h1>
            <p className="text-xs text-slate-400">Pro Management</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                closeMobileMenu();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentView === item.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           {user && (
            <div className="flex items-center gap-3 px-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.role}</p>
                </div>
            </div>
           )}
           
           <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
           >
             <LogOut size={16} />
             <span>Sign Out</span>
           </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
