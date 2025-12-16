import React, { useState } from 'react';
import { Report, Role, User } from '../types';
import { Download, FileSpreadsheet, Trash2 } from 'lucide-react';

interface HistoryTableProps {
  user: User;
  reports: Report[];
  onDelete: (id: string) => Promise<void>;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ user, reports, onDelete }) => {
  const [filterText, setFilterText] = useState('');
  
  // Admin sees all, User sees only own unit
  const visibleReports = user.role === Role.ADMIN 
    ? reports 
    : reports.filter(r => r.unit_name === user.unitName);

  const filteredReports = visibleReports.filter(r => 
    r.project_name.toLowerCase().includes(filterText.toLowerCase()) ||
    r.report_date.includes(filterText)
  );

  // CSV Export Logic
  const handleExportCSV = () => {
    // Added "Recorder Name" which corresponds to attachment_url
    const headers = ["Project Name", "Unit", "Date", "Past Result", "Next Plan", "Progress %", "Problems", "Note", "Recorder Name"];
    const rows = filteredReports.map(r => [
      `"${r.project_name}"`,
      `"${r.unit_name}"`,
      r.report_date,
      `"${r.past_result.replace(/"/g, '""')}"`,
      `"${r.next_plan.replace(/"/g, '""')}"`,
      `${r.progress_percent}%`,
      `"${r.problems.replace(/"/g, '""')}"`,
      `"${r.note.replace(/"/g, '""')}"`,
      `"${(r.attachment_url || '').replace(/"/g, '""')}"` // attachment_url stores recorder name
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // 0-20: Red, 21-49: Yellow, 50-99: Sky Blue, 100: Green
  const getProgressBadgeColor = (p: number) => {
    if (p === 100) return 'bg-green-900 text-green-300';
    if (p >= 50) return 'bg-sky-900 text-sky-300';
    if (p > 20) return 'bg-yellow-900 text-yellow-300';
    return 'bg-red-900 text-red-300';
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">ประวัติรายงานผลการดำเนินงาน</h2>
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="ค้นหาชื่อโครงการ หรือ วันที่..."
            className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white outline-none focus:border-emerald-500"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
            <Download size={16} /> PDF/Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-slate-700">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-700">
              <th className="p-3 whitespace-nowrap">วันที่รายงาน</th>
              <th className="p-3">โครงการ</th>
              {user.role === Role.ADMIN && <th className="p-3">หน่วยงาน</th>}
              <th className="p-3">ผู้บันทึก</th>
              <th className="p-3">ผลการดำเนินงาน</th>
              <th className="p-3 text-center">ความคืบหน้า</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.report_id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                <td className="p-3 text-slate-300 whitespace-nowrap align-top">{report.report_date}</td>
                <td className="p-3 text-white font-medium align-top">{report.project_name}</td>
                {user.role === Role.ADMIN && <td className="p-3 text-slate-400 text-xs align-top">{report.unit_name}</td>}
                <td className="p-3 text-slate-400 text-xs align-top">{report.attachment_url || '-'}</td>
                <td className="p-3 text-slate-300 max-w-xs truncate align-top" title={report.past_result}>
                  {report.past_result}
                </td>
                <td className="p-3 text-center align-top">
                  <span className={`px-2 py-1 rounded text-xs font-bold inline-block ${getProgressBadgeColor(report.progress_percent)}`}>
                    {report.progress_percent}%
                  </span>
                </td>
                <td className="p-3 text-right align-top">
                  <button 
                    onClick={() => {
                        if(confirm('ยืนยันการลบรายงานนี้?')) onDelete(report.report_id);
                    }}
                    className="text-red-400 hover:text-red-300 p-1 bg-slate-800 rounded hover:bg-slate-700"
                    title="ลบรายงาน"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  ไม่พบข้อมูลรายงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
