import React, { useState } from 'react';
import { Project, Report, User } from '../types';
import { Save, ExternalLink, User as UserIcon } from 'lucide-react';

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
    note: '',
    recorder_name: '' // Will store in attachment_url
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
      alert("กรุณาเลือกโครงการ");
      return;
    }
    if (!formData.recorder_name.trim()) {
        alert("กรุณาระบุชื่อผู้บันทึกข้อมูล");
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
      // บันทึกชื่อผู้บันทึกข้อมูลลงใน attachment_url ตามที่ได้รับมอบหมาย
      attachment_url: formData.recorder_name, 
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
      note: '',
      recorder_name: ''
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
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4 flex items-center gap-2">
        <Save className="text-emerald-500" /> บันทึกผลการดำเนินงาน
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

        {/* File Link & Recorder Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             {/* Recorder Name */}
             <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <label className="block text-slate-300 text-sm mb-2 flex items-center gap-2">
                    <UserIcon size={16} /> ผู้บันทึกข้อมูล (ยศ-ชื่อ-สกุล) <span className="text-red-400">*</span>
                </label>
                <input 
                    type="text"
                    required
                    placeholder="เช่น ร.อ. รักชาติ ยิ่งชีพ"
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2.5 text-white outline-none focus:border-emerald-500"
                    value={formData.recorder_name}
                    onChange={e => setFormData({...formData, recorder_name: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-2">* ข้อมูลนี้จะถูกบันทึกเพื่อใช้อ้างอิง</p>
             </div>

             {/* Google Drive Link */}
             <div className="bg-slate-900 p-4 rounded border border-slate-700 flex flex-col justify-center h-full">
                <label className="block text-slate-300 text-sm mb-2">แนบไฟล์เอกสาร/รูปภาพ</label>
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <p className="text-xs text-slate-400 text-center">
                        กรุณาอัปโหลดไฟล์ที่เกี่ยวข้องลงใน Google Drive ส่วนกลาง
                    </p>
                    <a 
                        href="https://drive.google.com/drive/folders/1l4vwKinSMtlMUW_w3hrgbM5Gn0o6LNwp" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        <ExternalLink size={16} /> ไปที่ Google Drive
                    </a>
                </div>
             </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all mt-6"
        >
          {loading ? 'กำลังบันทึก...' : <><Save /> ยืนยันการบันทึกข้อมูล</>}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
