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

  // Simple CSV Export Logic
  const handleExportCSV = () => {
    const headers = ["Project Name", "Unit", "Date", "Past Result", "Next Plan", "Progress %", "Problems", "Note"];
    const rows = filteredReports.map(r => [
      `"${r.project_name}"`,
      `"${r.unit_name}"`,
      r.report_date,
      `"${r.past_result.replace(/"/g, '""')}"`,
      `"${r.next_plan.replace(/"/g, '""')}"`,
      `${r.progress_percent}%`,
      `"${r.problems.replace(/"/g, '""')}"`,
      `"${r.note.replace(/"/g, '""')}"`
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

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
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
          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-2">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-2">
            <Download size={18} /> PDF/Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-700">
              <th className="p-3 whitespace-nowrap">วันที่รายงาน</th>
              <th className="p-3">โครงการ</th>
              {user.role === Role.ADMIN && <th className="p-3">หน่วยงาน</th>}
              <th className="p-3">ผลการดำเนินงาน</th>
              <th className="p-3 text-center">ความคืบหน้า</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.report_id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-3 text-slate-300 whitespace-nowrap">{report.report_date}</td>
                <td className="p-3 text-white font-medium">{report.project_name}</td>
                {user.role === Role.ADMIN && <td className="p-3 text-slate-400 text-xs">{report.unit_name}</td>}
                <td className="p-3 text-slate-300 max-w-xs truncate" title={report.past_result}>
                  {report.past_result}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    report.progress_percent === 100 ? 'bg-green-900 text-green-300' : 
                    report.progress_percent > 50 ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {report.progress_percent}%
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => {
                        if(confirm('ยืนยันการลบรายงานนี้?')) onDelete(report.report_id);
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
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