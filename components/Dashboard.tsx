import React, { useMemo, useState, useEffect } from 'react';
import { Project, Report, Role } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, CheckCircle, Clock, FileText, Filter, Calendar,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  reports: Report[];
  unitFilter: string; // ค่า 'ALL' หรือชื่อหน่วยงานของผู้ใช้
  userRole?: Role;    // ส่งเข้ามาเพื่อเช็คว่าเป็น Admin หรือไม่ (ถ้าไม่ส่งมาจะเช็คจาก unitFilter เอา)
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const UNITS = ["กนผ.สนผพ.กพ.ทหาร", "กกล.กพ.ทหาร", "กบพ.กพ.ทหาร", "กปค.กพ.ทหาร", "กจก.กพ.ทหาร", "กทด.สนผพ.กพ.ทหาร", "กพพ.กพ.ทหาร", "กพบท.กพ.ทหาร", "กคง.สนผพ.กพ.ทหาร"];

const Dashboard: React.FC<DashboardProps> = ({ projects, reports, unitFilter, userRole }) => {
  
  // --- State สำหรับตัวกรอง ---
  // ถ้า unitFilter เป็น 'ALL' แสดงว่าเลือกได้ (Admin) แต่ถ้าระบุมาให้ล็อคค่าไว้
  const [selectedUnit, setSelectedUnit] = useState<string>(unitFilter);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // อัปเดต state เมื่อ props เปลี่ยน (กรณี login ใหม่)
  useEffect(() => {
    setSelectedUnit(unitFilter);
  }, [unitFilter]);

  // --- การคำนวณและกรองข้อมูล (Memoized) ---
  const stats = useMemo(() => {
    // 1. กรอง Projects ตาม Unit ที่เลือก
    const filteredProjects = selectedUnit && selectedUnit !== 'ALL' 
      ? projects.filter(p => p.unit_name === selectedUnit) 
      : projects;

    // 2. กรอง Reports ตามเงื่อนไขทั้งหมด (Unit, Project, Date)
    let filteredReports = reports;

    // 2.1 กรองตาม Unit
    if (selectedUnit && selectedUnit !== 'ALL') {
      filteredReports = filteredReports.filter(r => r.unit_name === selectedUnit);
    }
    
    // 2.2 กรองตาม Project (ถ้าเลือกเจาะจง)
    if (selectedProject) {
      filteredReports = filteredReports.filter(r => r.project_id === selectedProject);
      // ถ้าเลือก Project เดียว ให้ projects ที่แสดงเหลือแค่อันเดียวด้วย เพื่อให้กราฟ Bar ไม่รก
      // (หรือจะปล่อย projects ทั้งหมดไว้ก็ได้ แล้วแต่ Design) - ในที่นี้ขอเลือกแสดงเฉพาะที่เลือก
    }

    // 2.3 กรองตาม Date Range
    if (startDate) {
      filteredReports = filteredReports.filter(r => new Date(r.report_date) >= new Date(startDate));
    }
    if (endDate) {
      // ตั้งเวลาให้เป็นสิ้นวัน (23:59:59) ของวันที่เลือก
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filteredReports = filteredReports.filter(r => new Date(r.report_date) <= endDateTime);
    }

    // --- Calculations ---
    // จำนวน Project ที่จะนำมาคำนวณ (ถ้าเลือก Project เฉพาะ ก็เอาแค่ Project นั้น)
    const targetProjects = selectedProject 
      ? filteredProjects.filter(p => p.project_id === selectedProject)
      : filteredProjects;

    const totalProjects = targetProjects.length;
    const totalReports = filteredReports.length; // จำนวนรายงานที่ส่งในช่วงเวลานั้น
    
    // คำนวณความคืบหน้าล่าสุด (Latest Progress) ภายใต้เงื่อนไขตัวกรอง
    // หมายเหตุ: หากกรองช่วงเวลา จะเป็นการดูว่า "ณ ช่วงเวลานั้น หรือ รายงานล่าสุดในช่วงเวลานั้น" มีสถานะเป็นอย่างไร
    const projectProgress = targetProjects.map(p => {
      // หารายงานของ Project นี้ ที่ผ่านการกรองมาแล้ว
      const pReports = filteredReports.filter(r => r.project_id === p.project_id);
      
      // เรียงวันที่ล่าสุดขึ้นก่อน
      pReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());
      
      // เอาค่าล่าสุดในช่วงเวลานั้น
      const currentProgress = pReports.length > 0 ? pReports[0].progress_percent : 0;
      
      return {
        name: p.project_name.length > 20 ? p.project_name.substring(0, 20) + '...' : p.project_name,
        full_name: p.project_name,
        progress: currentProgress,
        status: currentProgress === 100 ? 'Completed' : (currentProgress > 0 ? 'In Progress' : 'Not Started')
      };
    });

    const completedProjects = projectProgress.filter(p => p.progress === 100).length;
    
    // หาค่าเฉลี่ย (คิดเฉพาะ Project ที่มีการเคลื่อนไหวในช่วงเวลานั้น หรือจะหารทั้งหมดก็ได้)
    // สูตรนี้หารด้วยจำนวน Project ทั้งหมดที่แสดงอยู่
    const avgProgress = projectProgress.length > 0 
      ? projectProgress.reduce((acc, curr) => acc + curr.progress, 0) / projectProgress.length 
      : 0;

    // Status Distribution
    const statusCount = [
      { name: 'เสร็จสิ้น', value: projectProgress.filter(p => p.status === 'Completed').length },
      { name: 'กำลังดำเนินการ', value: projectProgress.filter(p => p.status === 'In Progress').length },
      { name: 'ยังไม่เริ่ม', value: projectProgress.filter(p => p.status === 'Not Started').length },
    ];

    return {
      totalProjects,
      totalReports,
      completedProjects,
      avgProgress,
      projectProgress,
      statusCount
    };
  }, [projects, reports, selectedUnit, selectedProject, startDate, endDate]);

  // Dropdown Options: แสดงเฉพาะ Project ที่อยู่ใน Unit ที่เลือก
  const availableProjects = useMemo(() => {
    return selectedUnit && selectedUnit !== 'ALL'
      ? projects.filter(p => p.unit_name === selectedUnit)
      : projects;
  }, [projects, selectedUnit]);

  const getBarColor = (p: number) => {
    if (p === 100) return '#10b981'; // emerald-500
    if (p >= 50) return '#0ea5e9'; // sky-500
    if (p > 20) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* --- Filter Section --- */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex items-center space-x-2 mb-4 text-emerald-400">
          <Filter size={20} />
          <h3 className="font-semibold text-lg">ตัวกรองข้อมูล (Filters)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Unit Filter */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">หน่วยงาน</label>
            <select
              className="w-full bg-slate-900 border border-slate-600 rounded-lg text-white p-2.5 text-sm focus:border-emerald-500 outline-none disabled:opacity-50"
              value={selectedUnit}
              disabled={unitFilter !== 'ALL'} // ถ้า User Login มาแล้วไม่ใช่ Admin ให้ห้ามแก้
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setSelectedProject(''); // Reset Project เมื่อเปลี่ยน Unit
              }}
            >
              <option value="ALL">ทุกหน่วยงาน</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* 2. Project Filter */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">แผนงาน/โครงการ</label>
            <select
              className="w-full bg-slate-900 border border-slate-600 rounded-lg text-white p-2.5 text-sm focus:border-emerald-500 outline-none"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {availableProjects.map(p => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name.length > 40 ? p.project_name.substring(0, 40) + '...' : p.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Start Date */}
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1">ตั้งแต่วันที่</label>
            <div className="relative">
              <input
                type="date"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg text-white p-2.5 pl-10 text-sm focus:border-emerald-500 outline-none [color-scheme:dark]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
          </div>

          {/* 4. End Date */}
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1">ถึงวันที่</label>
            <div className="relative">
              <input
                type="date"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg text-white p-2.5 pl-10 text-sm focus:border-emerald-500 outline-none [color-scheme:dark]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">จำนวนแผนงาน</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalProjects}</h3>
              <p className="text-xs text-slate-500 mt-1">โครงการ</p>
            </div>
            <LayoutDashboard className="text-blue-500 w-8 h-8" />
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">เสร็จสมบูรณ์</p>
              <h3 className="text-2xl font-bold text-white">{stats.completedProjects}</h3>
              <p className="text-xs text-slate-500 mt-1">โครงการ (100%)</p>
            </div>
            <CheckCircle className="text-green-500 w-8 h-8" />
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">รายงานทั้งหมด</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalReports}</h3>
              <p className="text-xs text-slate-500 mt-1">ครั้ง (ในช่วงเวลา)</p>
            </div>
            <FileText className="text-yellow-500 w-8 h-8" />
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">ความคืบหน้าเฉลี่ย</p>
              <h3 className="text-2xl font-bold text-white">{stats.avgProgress.toFixed(1)}%</h3>
              <div className="w-24 bg-slate-700 h-1.5 rounded-full mt-2">
                <div 
                   className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                   style={{ width: `${stats.avgProgress}%` }}
                />
              </div>
            </div>
            <Clock className="text-purple-500 w-8 h-8" />
          </div>
        </div>
      </div>

      {/* --- Charts Row --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Status Distribution */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChartIcon size={20} className="text-slate-400" />
            สัดส่วนสถานะโครงการ
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusCount}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Progress per Project */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChartIcon size={20} className="text-slate-400" />
            ความคืบหน้ารายโครงการ
          </h3>
          <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
            {/* ถ้า Project เยอะเกินไป ให้ขยายความสูง Container เพื่อให้กราฟไม่เบียด */}
            <div style={{ height: Math.max(300, stats.projectProgress.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stats.projectProgress} 
                  layout="vertical" 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={true} />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tick={{fill: '#94a3b8'}}
                  />
                  <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'ความคืบหน้า']}
                    labelStyle={{ color: '#cbd5e1' }}
                  />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]} name="ความคืบหน้า (%)">
                    {stats.projectProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
