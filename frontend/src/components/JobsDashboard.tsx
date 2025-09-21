"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, ExternalLink } from "lucide-react";
import { jobsApi, Job, JobFilters } from "@/lib/api";
import {
  formatSalary,
  formatDate,
  getCompanyTypeLabel,
  getTechStackDisplay,
  getExperienceYears,
  getCompanySize,
  getRoleType,
} from "@/lib/utils";

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    page: 1,
    limit: 20,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getJobs(filters);
      setJobs(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrawl = async () => {
    try {
      setCrawling(true);
      await jobsApi.crawlJobs("エンジニア", 3);
      // Refresh jobs after crawling
      await fetchJobs();
    } catch (error) {
      console.error("Error crawling jobs:", error);
    } finally {
      setCrawling(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IT Jobs Dashboard
        </h1>
        <p className="text-gray-600">
          Khám phá {total} công việc IT từ Indeed Japan
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, công ty..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-10 input-field"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCrawl}
              disabled={crawling}
              className="btn-primary"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${crawling ? "animate-spin" : ""}`}
              />
              {crawling ? "Đang crawl..." : "Crawl mới"}
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công việc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công ty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kinh nghiệm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lương
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy công việc nào
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          <a
                            href={`/jobs/${job.id}`}
                            className="hover:text-primary-600"
                          >
                            {job.title}
                          </a>
                        </h3>
                        {/* Employment Type and Job Status */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {job.jobMetadata?.employmentType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {job.jobMetadata.employmentType}
                            </span>
                          )}
                          {job.jobMetadata?.isSponsored && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              スポンサー
                            </span>
                          )}
                          {job.jobMetadata?.isUrgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              急募
                            </span>
                          )}
                        </div>
                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1">
                          {getTechStackDisplay(job.company.technologies).map(
                            (tech, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                        {/* Job Benefits Tags */}
                        {job.benefits?.tags && job.benefits.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.benefits.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {job.benefits.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                +{job.benefits.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {job.company.name}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                          {job.company.industry}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {getCompanyTypeLabel(job.company.companyType)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {getCompanySize(job.company)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          {getExperienceYears(job.requirements?.experience)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {getRoleType(job)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatSalary(job.salaryInfo)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.location || "Remote"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <a
                          href={`/jobs/${job.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Chi tiết
                        </a>
                        <a
                          href={job.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Indeed
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Hiển thị {((filters.page || 1) - 1) * (filters.limit || 20) + 1}{" "}
                đến{" "}
                {Math.min((filters.page || 1) * (filters.limit || 20), total)}{" "}
                trong {total} kết quả
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={filters.page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                  Trang {filters.page} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={filters.page === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
