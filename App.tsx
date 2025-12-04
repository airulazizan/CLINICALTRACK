
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Checklists from './pages/Checklists';
import Subjects from './pages/Subjects';
import Assessors from './pages/Assessors';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Osce from './pages/Osce';
import { View, Student, Checklist, Assessment as AssessmentType, Assessor, Subject, User, UserRole, OsceSession } from './types';
import { Menu, Loader2 } from 'lucide-react';
import { api } from './services/api';

// Initial Users for Auth (In a real app, this moves to API too)
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@clinic.com', password: 'password', role: 'Admin' }
];

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [loginError, setLoginError] = useState('');

  // App State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [osceSessions, setOsceSessions] = useState<OsceSession[]>([]);

  // Navigation Guard State
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);

  // Fetch Data on Login
  useEffect(() => {
    if (currentUser) {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const [studentsData, subjectsData, checklistsData, assessorsData, assessmentsData] = await Promise.all([
                    api.getStudents(),
                    api.getSubjects(),
                    api.getChecklists(),
                    api.getAssessors(),
                    api.getAssessments()
                ]);
                
                setStudents(studentsData);
                setSubjects(subjectsData);
                setChecklists(checklistsData);
                setAssessors(assessorsData);
                setAssessments(assessmentsData);
            } catch (error) {
                console.error("Failed to load data from MySQL:", error);
                // Fallback or error notification logic here
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }
  }, [currentUser]);

  // --- Auth Handlers ---
  const handleLogin = (email: string, pass: string) => {
    // For now, keeping auth local/mock. 
    // Ideally, api.login(email, pass) should be implemented.
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
        setCurrentUser(foundUser);
        setLoginError('');
    } else {
        setLoginError('Invalid email or password.');
    }
  };

  const handleSignUp = (name: string, email: string, pass: string, role: UserRole) => {
    if (users.some(u => u.email === email)) {
        alert("Email already registered.");
        return;
    }
    
    const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        password: pass,
        role
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser); // Auto-login
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setAuthView('login');
  };

  // --- App Handlers ---
  // Wrappers to update both Local State (UI) and Backend (MySQL)

  const handleAddAssessment = async (assessment: AssessmentType) => {
    // Optimistic Update
    setAssessments(prev => [...prev, assessment]);
    try {
        await api.createAssessment(assessment);
    } catch (e) {
        console.error("Failed to save assessment to DB", e);
        alert("Error saving assessment to database.");
    }
  };

  // In a real app, you would wrap handleAddStudent, handleAddChecklist similarly.
  // For this example, we'll just expose the setters to children, 
  // but children pages need to be updated to call api.create... alongside set...
  // Or better, update children to call a prop function passed from here that handles both.

  const handlePromoteStudents = () => {
    setStudents(prevStudents => {
        return prevStudents.map(student => {
            const currentYear = parseInt(student.yearLevel);
            if (!isNaN(currentYear)) {
                return { ...student, yearLevel: (currentYear + 1).toString() };
            }
            return student;
        });
    });
    // Note: You would also need an api.updateStudent call here loop
  };

  const handleViewChange = (view: View) => {
    if (isAssessmentActive && currentView === 'assess' && view !== 'assess') {
      const confirmLeave = window.confirm(
        "⚠️ Assessment in Progress\n\nIf you leave this page now, your current assessment progress will be lost.\n\nAre you sure you want to navigate away?"
      );
      if (!confirmLeave) return;
      setIsAssessmentActive(false);
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    if (isLoadingData) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 size={48} className="animate-spin text-slate-300" />
            </div>
        );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard students={students} checklists={checklists} assessments={assessments} />;
      case 'students':
        return <Students 
          students={students} 
          setStudents={setStudents} 
          checklists={checklists}
          assessments={assessments}
          subjects={subjects}
        />;
      case 'subjects':
        return <Subjects subjects={subjects} setSubjects={setSubjects} />;
      case 'checklists':
        return <Checklists checklists={checklists} setChecklists={setChecklists} subjects={subjects} />;
      case 'osce':
        return <Osce osceSessions={osceSessions} setOsceSessions={setOsceSessions} checklists={checklists} />;
      case 'assessors':
        return <Assessors assessors={assessors} setAssessors={setAssessors} />;
      case 'assess':
        return <Assessment 
          students={students} 
          checklists={checklists} 
          assessors={assessors}
          assessments={assessments}
          addAssessment={handleAddAssessment} 
          setView={setCurrentView}
          setIsAssessmentActive={setIsAssessmentActive}
        />;
      case 'results':
        return <Results assessments={assessments} />;
      case 'settings':
        return <Settings onPromoteStudents={handlePromoteStudents} studentCount={students.length} />;
      default:
        return <Dashboard students={students} checklists={checklists} assessments={assessments} />;
    }
  };

  // --- Authentication View Guard ---
  if (!currentUser) {
    if (authView === 'login') {
        return <Login onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} error={loginError} />;
    } else {
        return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  // --- Authenticated App Layout ---
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-bold text-slate-800">ClinicalTrack</div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
