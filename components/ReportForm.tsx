import React, { useState } from 'react';
import { Project, Report, User } from '../types';
import { Save, UploadCloud } from 'lucide-react';

interface ReportFormProps {
  user: User;
  projects: Project[];
  onSubmit: (r: Report) => Promise<void>;
}

const ReportForm: React.FC<ReportFormProps> = ({ user, projects, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  
  // Filter projects for this user's unit
  const myProjects = projects.filter(p => p.unit_name === user.unitName);

  const [formData, setFormData] = useState({
    project_id: '',
    report_date: new Date().toISOString().split('T')[0],
    past_result: '',
    next_plan: '',
    progress_percent: 0,
    problems: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
      alert("กรุณาเลือกโครงการ");
      return;
    }

    setLoading(true);
    
    const selectedProject = myProjects.find(p => p.project_id === formData.project_id);

    const newReport: Report = {
      report_id: `R${Date.now()}`,
      project_id: formData.project_id,
      project_name: selectedProject ? selectedProject.project_name : 'Unknown',
      unit_name: user.unitName,
      report_date: formData.report_date,
      past_result: formData.past_result,
      next_plan: formData.next_plan,
      progress_percent: Number(formData.progress_percent),
      problems: formData.problems || '-',
      note: formData.note || '',
      created_at: new Date().toISOString()
    };

    await onSubmit(newReport);
    setLoading(false);
    
    // Reset essential fields
    setFormData(prev => ({
      ...prev,
      past_result: '',
      next_plan: '',
      problems: '',
      note: ''
    }));
    alert("บันทึกข้อมูลเรียบร้อย");
  };

  const progressColor = formData.progress_percent < 30 ? 'bg-red-500' : 
                        formData.progress_percent < 70 ? 'bg-yellow-500' : 'bg-green-500';

  if (myProjects.length === 0) {
    return (
      <div className="bg-slate-800 p-8 text-center rounded-lg">
        <h3 className="text-xl text-white mb-2">ไม่พบแผนงานของหน่วยท่าน</h3>
        <p className="text-slate-400">กรุณาติดต่อ J1Admin เพื่อเพิ่มแผนงานเข้าสู่ระบบ</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
        📝 บันทึกผลการดำเนินงาน
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">เลือกแผนงาน/โครงการ <span className="text-red-400">*</span></label>
            <select 
              required
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none"
              value={formData.project_id}
              onChange={e => setFormData({...formData, project_id: e.target.value})}
            >
              <option value="">-- เลือกรายการ --</option>
              {myProjects.map(p => (
                <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">ห้วงเวลารายงาน (วันที่) <span className="text-red-400">*</span></label>
            <input 
              type="date" 
              required
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-emerald-500"
              value={formData.report_date}
              onChange={e => setFormData({...formData, report_date: e.target.value})}
            />
          </div>
        </div>

        {/* Progress Bar Input */}
        <div className="bg-slate-900 p-4 rounded border border-slate-700">
          <label className="block text-slate-300 text-sm mb-2">
            ความคืบหน้า (%) : <span className="text-white font-bold text-lg">{formData.progress_percent}%</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            value={formData.progress_percent}
            onChange={e => setFormData({...formData, progress_percent: Number(e.target.value)})}
          />
          <div className="w-full h-3 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${progressColor}`} 
              style={{ width: `${formData.progress_percent}%` }}
            ></div>
          </div>
        </div>

        {/* Text Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">1. ผลการดำเนินการที่ผ่านมา <span className="text-red-400">*</span></label>
            <textarea 
              required
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-emerald-500"
              placeholder="ระบุสิ่งที่ทำไปแล้ว..."
              value={formData.past_result}
              onChange={e => setFormData({...formData, past_result: e.target.value})}
            ></textarea>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">2. แผนการดำเนินงานต่อไป <span className="text-red-400">*</span></label>
            <textarea 
              required
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-emerald-500"
              placeholder="ระบุสิ่งที่จะทำต่อ..."
              value={formData.next_plan}
              onChange={e => setFormData({...formData, next_plan: e.target.value})}
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">3. ปัญหา/อุปสรรค</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-emerald-500"
              placeholder="ถ้าไม่มีให้ใส่ -"
              value={formData.problems}
              onChange={e => setFormData({...formData, problems: e.target.value})}
            ></textarea>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">4. หมายเหตุ</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-emerald-500"
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
            ></textarea>
          </div>
        </div>

        {/* File Attachment */}
        <div className="border border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-900 transition-colors">
            <UploadCloud className="mx-auto text-slate-400 mb-2 w-10 h-10" />
            <p className="text-slate-300 mb-2">อัปโหลดไฟล์แนบ (PDF/รูปภาพ)</p>
            <input type="file" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700" />
            <p className="text-xs text-slate-500 mt-2">ระบบจะบันทึกลง Google Drive อัตโนมัติ</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"
        >
          {loading ? 'กำลังบันทึก...' : <><Save /> ยืนยันการบันทึกข้อมูล</>}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;