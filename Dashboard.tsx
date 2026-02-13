
import React from 'react';
import { User } from './types';

interface DashboardProps {
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const users = JSON.parse(localStorage.getItem('my_friend_users') || '[]');
  
  const totalUsers = users.length;
  const totalMessages = users.reduce((acc: number, u: User) => acc + (u.messageCount || 0), 0);

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 overflow-y-auto p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Admin Dashboard</h1>
            <p className="text-zinc-500 uppercase tracking-widest text-[10px] mt-2 font-bold">Real-time Analytics</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Total Users</h3>
            <p className="text-5xl font-black">{totalUsers}</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Messages Processed</h3>
            <p className="text-5xl font-black">{totalMessages}</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Active Session</h3>
            <p className="text-5xl font-black text-emerald-400">Online</p>
          </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Username</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Joined</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Messages</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: User, idx: number) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 font-bold">{u.username}</td>
                  <td className="px-8 py-6 text-zinc-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6">{u.messageCount}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
