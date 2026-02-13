
import React, { useState } from 'react';
import { User } from "./types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Admin login shortcut
    if (username === 'R2' && password === 'memo0000') {
      onLogin({ username: 'R2', role: 'admin', createdAt: Date.now(), messageCount: 0 });
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('my_friend_users') || '[]');
    
    if (isSignup) {
      if (savedUsers.find((u: User) => u.username === username)) {
        setError('Username already exists');
        return;
      }
      const newUser: User = { username, password, role: 'user', createdAt: Date.now(), messageCount: 0 };
      localStorage.setItem('my_friend_users', JSON.stringify([...savedUsers, newUser]));
      onLogin(newUser);
    } else {
      const user = savedUsers.find((u: User) => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md glass p-10 rounded-3xl animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
            <div className="w-8 h-8 rounded-lg bg-zinc-950" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-center mb-2">My Friend</h1>
        <p className="text-zinc-500 text-center mb-10 text-sm tracking-widest uppercase">Free Chat With Friends</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/30 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-white text-zinc-950 font-bold rounded-2xl py-4 hover:bg-zinc-200 transition-colors shadow-xl"
          >
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => setIsSignup(!isSignup)}
          className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors"
        >
          {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
