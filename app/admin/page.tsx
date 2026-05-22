'use client';

import { useEffect, useState } from 'react';
import { Shield, Users, BookOpen, MessageCircle } from 'lucide-react';
import DashboardLayout from '@/src/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { books: number; chatSessions: number };
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Użytkownicy', value: users.length, icon: Users },
    { label: 'Książki', value: users.reduce((a, u) => a + (u._count?.books || 0), 0), icon: BookOpen },
    { label: 'Sesje', value: users.reduce((a, u) => a + (u._count?.chatSessions || 0), 0), icon: MessageCircle },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#1d7874]" />
          Panel administratora
        </h1>
        <p className="text-sm text-[#666] mt-1">Zarządzanie użytkownikami i zasobami.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-[#e5f0ee] p-5 flex items-center gap-4 shadow-sm">
              <div className="bg-[#1d7874] text-white p-3 rounded-lg">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{s.value}</p>
                <p className="text-sm text-[#666]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-[#e5f0ee] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5f0ee]">
          <h2 className="font-semibold text-[#1a1a1a]">Użytkownicy</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d7874]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6faf9]">
                <tr>
                  <th className="px-6 py-3 font-medium text-[#666]">Email</th>
                  <th className="px-6 py-3 font-medium text-[#666]">Rola</th>
                  <th className="px-6 py-3 font-medium text-[#666]">Książki</th>
                  <th className="px-6 py-3 font-medium text-[#666]">Sesje</th>
                  <th className="px-6 py-3 font-medium text-[#666]">Utworzony</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5f0ee]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f6faf9] transition-colors">
                    <td className="px-6 py-3 text-[#1a1a1a]">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-[#1d7874]/10 text-[#1d7874]' : 'bg-[#f0f7f6] text-[#666]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[#666]">{u._count.books}</td>
                    <td className="px-6 py-3 text-[#666]">{u._count.chatSessions}</td>
                    <td className="px-6 py-3 text-[#999]">{u.createdAt.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
