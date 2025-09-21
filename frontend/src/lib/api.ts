import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  originalUrl: string;
  jobId: string;
  salaryInfo?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
    display?: string;
  };
  requirements?: {
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: string[];
  };
  benefits?: {
    workStyle?: string;
    welfare?: string[];
    vacation?: string;
  };
  status: string;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  name: string;
  nameKanji?: string;
  description?: string;
  industry?: string;
  subIndustry?: string;
  companyType?: string;
  characteristics?: {
    size?: string;
    culture?: string[];
    techStack?: string[];
    workStyle?: string[];
  };
  technologies?: {
    backend?: string[];
    frontend?: string[];
    cicd?: string[];
    infrastructure?: string[];
    other?: string[];
  };
  website?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  industry?: string;
  location?: string;
  companyType?: string;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsResponse {
  totalJobs: number;
  totalCompanies: number;
  industryStats: { industry: string; count: string }[];
  recentJobs: Job[];
}

export const jobsApi = {
  // Get all jobs with filters
  getJobs: (filters?: JobFilters): Promise<JobsResponse> =>
    api.get("/jobs", { params: filters }).then((res) => res.data),

  // Get job by ID
  getJob: (id: number): Promise<Job> =>
    api.get(`/jobs/${id}`).then((res) => res.data),

  // Get statistics
  getStats: (): Promise<StatsResponse> =>
    api.get("/jobs/stats").then((res) => res.data),

  // Trigger crawl
  crawlJobs: (search?: string, pages?: number) =>
    api
      .post("/crawler/crawl", null, {
        params: { search, pages },
      })
      .then((res) => res.data),

  // Get crawler status
  getCrawlerStatus: () => api.get("/crawler/status").then((res) => res.data),
};

export default api;
