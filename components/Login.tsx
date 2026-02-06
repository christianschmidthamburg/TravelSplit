
import React, { useState } from 'react';
import { Plane, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"><Plane className="w-8 h-8 text-white" /></div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">TripSplit</h1>
        <p className="text-slate-500 mb-10">Reiseausgaben einfach verwalten.</p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(password); }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-left space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
            <div className="relative">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" required />
              <Lock className="w-5 h-5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Anmelden</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
