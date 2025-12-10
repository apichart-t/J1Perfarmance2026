import { Project, Report } from '../types';
import { INITIAL_PROJECTS, INITIAL_REPORTS, GOOGLE_SCRIPT_URL } from '../constants';

// Internal store for optimistic updates and fallback
let projectsStore: Project[] = [];
let reportsStore: Report[] = [];

// Helper to handle API calls gracefully
const callGoogleScript = async (action: string, payload: any = {}) => {
  const urlWithParams = `${GOOGLE_SCRIPT_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`;

  try {
    const response = await fetch(urlWithParams, {
      method: 'POST',
      redirect: 'follow',
      credentials: 'omit',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      // สำคัญ: ห่อ payload ไว้ใน key "data"
      body: JSON.stringify({ action, data: payload })
    });

    if (!response.ok) {
      console.warn(`[API] HTTP Error ${response.status} (${action})`);
      return null;
    }

    const text = await response.text();
    if (!text) return null;

    try {
      const json = JSON.parse(text);
      if (json.status === 'error') {
        console.warn(`[API] Script Error (${action}):`, json.message);
        return null;
      }
      return json;
    } catch (parseError) {
      console.warn(`[API] JSON Parse Error (${action}):`, text.substring(0, 100));
      return null;
    }
  } catch (networkError) {
    console.warn(`[API] Network/CORS Failed (${action}):`, networkError);
    return null;
  }
};

export const api = {
  // --- Projects ---
  getProjects: async (): Promise<Project[]> => {
    const result = await callGoogleScript('getProjects', { unit: 'ALL', role: 'admin' });
    
    let projects: Project[] | null = null;
    if (result) {
      if (Array.isArray(result)) projects = result;
      else if (Array.isArray(result.projects)) projects = result.projects;
      else if (Array.isArray(result.data)) projects = result.data;
    }

    if (projects) {
      projectsStore = projects;
      return projects;
    }
    return projectsStore.length > 0 ? projectsStore : INITIAL_PROJECTS;
  },

  addProject: async (project: Project): Promise<void> => {
    projectsStore = [...projectsStore, project];
    await callGoogleScript('addProject', project);
  },

  updateProject: async (updatedProject: Project): Promise<void> => {
    projectsStore = projectsStore.map(p => 
      p.project_id === updatedProject.project_id ? updatedProject : p
    );
    await callGoogleScript('updateProject', updatedProject);
  },

  deleteProject: async (projectId: string): Promise<void> => {
    projectsStore = projectsStore.filter(p => p.project_id !== projectId);
    await callGoogleScript('deleteProject', { project_id: projectId });
  },

  // --- Reports ---
  getReports: async (): Promise<Report[]> => {
    const result = await callGoogleScript('getReports', { unit: 'ALL', role: 'admin' });
    
    let reports: Report[] | null = null;
    if (result) {
      if (Array.isArray(result)) reports = result;
      else if (Array.isArray(result.reports)) reports = result.reports;
      else if (Array.isArray(result.data)) reports = result.data;
    }

    if (reports) {
      reportsStore = reports;
      return reports;
    }
    return reportsStore.length > 0 ? reportsStore : INITIAL_REPORTS;
  },

  addReport: async (report: Report): Promise<void> => {
    reportsStore = [...reportsStore, report];
    // ใช้ action: 'saveReport'
    await callGoogleScript('saveReport', report);
  },

  updateReport: async (updatedReport: Report): Promise<void> => {
    reportsStore = reportsStore.map(r => 
      r.report_id === updatedReport.report_id ? updatedReport : r
    );
    await callGoogleScript('updateReport', updatedReport);
  },

  deleteReport: async (reportId: string): Promise<void> => {
    reportsStore = reportsStore.filter(r => r.report_id !== reportId);
    await callGoogleScript('deleteReport', { report_id: reportId });
  },

  // --- Dashboard ---
  getDashboardSummary: async (filter: { unit?: string, project?: string, startDate?: string, endDate?: string }) => {
    const result = await callGoogleScript('getDashboardSummary', {
      unit: filter.unit || 'ALL',
      project: filter.project || '',
      startDate: filter.startDate || '',
      endDate: filter.endDate || ''
    });
    
    if (result && result.status === 'success') {
      return result.data;
    }
    return { total_projects: 0, total_reports: 0, completed_projects: 0, avg_progress_percent: 0 };
  }
};