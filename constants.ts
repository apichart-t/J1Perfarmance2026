import { UnitName, Project, Report } from './types';

export const UNITS = [
  UnitName.U1,
  UnitName.U2,
  UnitName.U3,
  UnitName.U4,
  UnitName.U5,
  UnitName.U6,
  UnitName.U7,
  UnitName.U8,
  UnitName.ADMIN
];

export const ADMIN_PASSCODE = "5721118";

export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIjuVA42e9NT2xzVaaepnabo42Y2MMQLIoDR3RWte0C-qfOw4ctXrpSVuAln4y40eYtw/exec";

// Initial Mock Data to populate the app for demonstration
export const INITIAL_PROJECTS: Project[] = [
  {
    project_id: "P001",
    project_name: "โครงการพัฒนาศักยภาพกำลังพล รุ่นที่ 1",
    unit_name: UnitName.U1,
    start_date: "2025-10-01",
    end_date: "2025-12-31",
    budget: 500000
  },
  {
    project_id: "P002",
    project_name: "ระบบฐานข้อมูลกำลังพลดิจิทัล",
    unit_name: UnitName.U2,
    start_date: "2026-01-01",
    end_date: "2026-09-30",
    budget: 1200000
  },
  {
    project_id: "P003",
    project_name: "การฝึกอบรมภาษาอังกฤษสำหรับทหาร",
    unit_name: UnitName.U4,
    start_date: "2025-11-01",
    end_date: "2026-02-28",
    budget: 300000
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    report_id: "R001",
    project_id: "P001",
    project_name: "โครงการพัฒนาศักยภาพกำลังพล รุ่นที่ 1",
    unit_name: UnitName.U1,
    report_date: "2025-10-15",
    past_result: "ดำเนินการติดต่อวิทยากรเรียบร้อยแล้ว",
    next_plan: "เตรียมสถานที่และเอกสารประกอบการอบรม",
    progress_percent: 20,
    problems: "-",
    note: "",
    created_at: "2025-10-15T10:00:00Z"
  },
  {
    report_id: "R002",
    project_id: "P002",
    project_name: "ระบบฐานข้อมูลกำลังพลดิจิทัล",
    unit_name: UnitName.U2,
    report_date: "2026-02-01",
    past_result: "ออกแบบ ER Diagram เสร็จสิ้น",
    next_plan: "เริ่มพัฒนาส่วน Backend",
    progress_percent: 45,
    problems: "Server มีความล่าช้าในการจัดซื้อ",
    note: "ต้องเร่งรัดพัสดุ",
    created_at: "2026-02-01T14:30:00Z"
  }
];