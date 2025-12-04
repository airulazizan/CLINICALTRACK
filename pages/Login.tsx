
import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  onSwitchToSignUp: () => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignUp, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
            <div className="inline-flex bg-emerald-500 p-3 rounded-xl mb-4 shadow-lg shadow-emerald-900/50">
                <Activity size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ClinicalTrack Pro</h1>
            <p className="text-slate-400 mt-2 text-sm">Sign in to access the management dashboard.</p>
        </div>

        {/* Form */}
        <div className="p-8">
            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            required
                            type="email"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            placeholder="name@institution.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            required
                            type="password"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                    Sign In <ArrowRight size={18} />
                </button>
            </form>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button 
                    onClick={onSwitchToSignUp}
                    className="text-emerald-600 font-bold hover:underline"
                >
                    Create Account
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
