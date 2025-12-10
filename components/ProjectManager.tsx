import React, { useState } from 'react';
import { Project, UnitName } from '../types';
import { UNITS } from '../constants';
import { Plus, Trash2, Edit } from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  onAdd: (p: Project) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    project_name: '',
    unit_name: UNITS[0],
    start_date: '',
    end_date: '',
    budget: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name || !formData.unit_name) return;

    setLoading(true);
    const newProject: Project = {
      project_id: `P${Date.now()}`,
      project_name: formData.project_name,
      unit_name: formData.unit_name,
      start_date: formData.start_date || '',
      end_date: formData.end_date || '',
      budget: Number(formData.budget) || 0
    };

    await onAdd(newProject);
    setLoading(false);
    setIsModalOpen(false);
    setFormData({ project_name: '', unit_name: UNITS[0], start_date: '', end_date: '', budget: 0 });
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">จัดการแผนงาน/โครงการ</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} /> เพิ่มแผนงาน
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="p-3">ชื่อแผนงาน</th>
              <th className="p-3">หน่วยรับผิดชอบ</th>
              <th className="p-3">งบประมาณ</th>
              <th className="p-3">ระยะเวลา</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.project_id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-3 text-white">{project.project_name}</td>
                <td className="p-3 text-slate-300">{project.unit_name}</td>
                <td className="p-3 text-slate-300">{project.budget.toLocaleString()}</td>
                <td className="p-3 text-slate-300 text-sm">
                  {project.start_date} - {project.end_date}
                </td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => onDelete(project.project_id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    title="ลบ"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  ไม่พบข้อมูลแผนงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg w-full max-w-md p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">เพิ่มแผนงานใหม่</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">ชื่อโครงการ</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
                  value={formData.project_name}
                  onChange={e => setFormData({...formData, project_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-1">หน่วยรับผิดชอบ</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
                  value={formData.unit_name}
                  onChange={e => setFormData({...formData, unit_name: e.target.value})}
                >
                  {UNITS.filter(u => u !== UnitName.ADMIN).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">วันเริ่ม</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">วันสิ้นสุด</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">งบประมาณ (บาท)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;