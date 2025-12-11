import React, { useState, useEffect } from 'react';
import { UnitName, Role, User, Project, Report } from './types';
import { UNITS, ADMIN_PASSCODE } from './constants';
import { api } from './services/api';

import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ReportForm from './components/ReportForm';
import HistoryTable from './components/HistoryTable';
import ChatBot from './components/ChatBot';
import { ShieldCheck, LogOut, Layout, FilePlus, Database, History, Menu } from 'lucide-react';

// --- View Types ---
type View = 'DASHBOARD' | 'REPORT_FORM' | 'PROJECTS' | 'HISTORY';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('DASHBOARD');
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  // Login State
  const [selectedUnit, setSelectedUnit] = useState<string>(UNITS[0]);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initial Data Load
  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    const p = await api.getProjects();
    const r = await api.getReports();
    setProjects(p);
    setReports(r);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (selectedUnit === UnitName.ADMIN) {
      if (password === ADMIN_PASSCODE) {
        setUser({
          id: 'admin',
          unitName: UnitName.ADMIN,
          role: Role.ADMIN
        });
        setView('DASHBOARD');
      } else {
        setLoginError('รหัสผ่านไม่ถูกต้อง');
      }
    } else {
      // Regular user login
      setUser({
        id: `user-${Date.now()}`,
        unitName: selectedUnit as UnitName,
        role: Role.USER
      });
      setView('DASHBOARD');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedUnit(UNITS[0]);
    setPassword('');
    setLoginError('');
  };

  // --- CRUD Handlers ---
  const handleAddProject = async (p: Project) => {
    await api.addProject(p);
    loadData();
  };
  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    loadData();
  };
  const handleAddReport = async (r: Report) => {
    await api.addReport(r);
    loadData();
    setView('HISTORY'); // Redirect to history after adding
  };
  const handleDeleteReport = async (id: string) => {
    await api.deleteReport(id);
    loadData();
  };

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <div className="bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500">
              <ShieldCheck className="text-emerald-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">ระบบติดตามผลการดำเนินงาน</h1>
            <p className="text-slate-400 mt-2 text-sm">ตามนโยบาย ผบ.ทสส./ผบ.ศบท. ประจำปี 2569</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">เลือกหน่วยงาน</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  setLoginError('');
                }}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {selectedUnit === UnitName.ADMIN && (
              <div className="animate-fade-in-down">
                <label className="block text-slate-300 text-sm mb-2">รหัสผ่าน (J1Admin)</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Passcode"
                />
              </div>
            )}

            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-600">
            J1 Performance Tracker System v1.0
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* 
        Sidebar: 
        - Fixed position on left
        - w-16 on mobile/tablet (icons only)
        - w-64 on desktop (lg) (full menu)
      */}
      <aside className="fixed left-0 top-0 h-screen z-40 bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 w-16 lg:w-64">
        
        {/* Logo / Header */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700 shrink-0">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-emerald-500/50">
            <ShieldCheck className="text-emerald-500 w-6 h-6" />
          </div>
          <div className="hidden lg:block ml-3">
             <h1 className="text-white font-bold text-lg leading-none">J1 Tracker</h1>
             <p className="text-emerald-500 text-xs">Performance System</p>
          </div>
        </div>

        {/* User Info (Desktop only, or simplified on mobile) */}
        <div className="hidden lg:block p-4 border-b border-slate-700 bg-slate-800/50">
           <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">หน่วยงาน</p>
           <p className="text-sm font-medium text-white truncate" title={user.unitName}>{user.unitName}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2">
          
          <button 
            onClick={() => setView('DASHBOARD')}
            title="ภาพรวม (Dashboard)"
            className={`flex items-center lg:px-4 py-3 rounded-lg transition-colors justify-center lg:justify-start ${view === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <Layout size={22} className="shrink-0" />
            <span className="hidden lg:block ml-3 font-medium">ภาพรวม</span>
          </button>

          {user.role === Role.ADMIN && (
            <button 
              onClick={() => setView('PROJECTS')}
              title="จัดการแผนงาน"
              className={`flex items-center lg:px-4 py-3 rounded-lg transition-colors justify-center lg:justify-start ${view === 'PROJECTS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Database size={22} className="shrink-0" />
              <span className="hidden lg:block ml-3 font-medium">จัดการแผนงาน</span>
            </button>
          )}

          <button 
            onClick={() => setView('REPORT_FORM')}
            title="บันทึกข้อมูล"
            className={`flex items-center lg:px-4 py-3 rounded-lg transition-colors justify-center lg:justify-start ${view === 'REPORT_FORM' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <FilePlus size={22} className="shrink-0" />
            <span className="hidden lg:block ml-3 font-medium">บันทึกข้อมูล</span>
          </button>

          <button 
            onClick={() => setView('HISTORY')}
            title="รายงานย้อนหลัง"
            className={`flex items-center lg:px-4 py-3 rounded-lg transition-colors justify-center lg:justify-start ${view === 'HISTORY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <History size={22} className="shrink-0" />
            <span className="hidden lg:block ml-3 font-medium">รายงานย้อนหลัง</span>
          </button>

        </nav>

        {/* Logout */}
        <div className="p-2 lg:p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="w-full flex items-center justify-center lg:justify-start lg:px-4 py-2 rounded border border-slate-600 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="hidden lg:block ml-3">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* Add left margin to accommodate fixed sidebar */}
      <main className="flex-1 ml-16 lg:ml-64 p-4 md:p-8 min-w-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {view === 'DASHBOARD' && (
            <Dashboard 
              projects={projects} 
              reports={reports} 
              unitFilter={user.role === Role.ADMIN ? 'ALL' : user.unitName}
            />
          )}
          
          {view === 'PROJECTS' && user.role === Role.ADMIN && (
            <ProjectManager 
              projects={projects} 
              onAdd={handleAddProject} 
              onDelete={handleDeleteProject}
            />
          )}

          {view === 'REPORT_FORM' && (
            <ReportForm 
              user={user} 
              projects={projects}
              onSubmit={handleAddReport}
            />
          )}

          {view === 'HISTORY' && (
            <HistoryTable 
              user={user} 
              reports={reports} 
              onDelete={handleDeleteReport} 
            />
          )}
        </div>
      </main>

      {/* AI Chat Bot Overlay */}
      <ChatBot projects={projects} reports={reports} />
    </div>
  );
}

export default App;
