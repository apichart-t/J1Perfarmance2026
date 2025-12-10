export enum UnitName {
  U1 = "กนผ.สนผพ.กพ.ทหาร",
  U2 = "กพบท.กพ.ทหาร",
  U3 = "กทด.สนผพ.กพ.ทหาร",
  U4 = "กกล.กพ.ทหาร",
  U5 = "กพพ.กพ.ทหาร",
  U6 = "กบพ.กพ.ทหาร",
  U7 = "กปค.กพ.ทหาร",
  U8 = "กคง.สนผพ.กพ.ทหาร",
  ADMIN = "ผู้ดูแลภาพรวม J1Admin"
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  unitName: UnitName;
  role: Role;
}

export interface Project {
  project_id: string;
  project_name: string;
  unit_name: string;
  start_date: string;
  end_date: string;
  budget: number;
}

export interface Report {
  report_id: string;
  project_id: string;
  project_name: string; // Denormalized for easier display
  unit_name: string;
  report_date: string;
  past_result: string;
  next_plan: string;
  progress_percent: number;
  problems: string;
  note: string;
  attachment_url?: string;
  created_at: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalReports: number;
  completedProjects: number;
  avgProgress: number;
}