"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Code,
  Globe,
  Star,
} from "lucide-react";
import { jobsApi, Job } from "@/lib/api";
import { formatSalary, formatDate, getCompanyTypeLabel } from "@/lib/utils";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobData = await jobsApi.getJob(Number(params.id));
        setJob(jobData);
      } catch (err) {
        setError("Không thể tải thông tin công việc");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin công việc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy công việc
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "Công việc này có thể đã bị xóa hoặc không tồn tại."}
          </p>
          <a href="/" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách job
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="text-lg font-semibold">
                    {job.company.name}
                  </span>
                  {job.company.nameKanji && (
                    <span className="ml-2 text-sm">
                      ({job.company.nameKanji})
                    </span>
                  )}
                </div>
              </div>
              <a
                href={job.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem trên Indeed
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>{formatSalary(job.salaryInfo)}</span>
              </div>
            </div>
          </div>

          {/* Company Analysis Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              🏢 {job.company.name}
            </h2>

            {/* Industry & Type */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ngành nghề & Đặc trưng
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Ngành lớn:</span>{" "}
                  <span className="text-primary-600">
                    {job.company.industry || "IT / インターネット"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Ngành nhỏ:</span>{" "}
                  <span className="text-primary-600">
                    {job.company.subIndustry || "Webサービス開発"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Đặc trưng:</span>{" "}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {getCompanyTypeLabel(job.company.companyType)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {job.company.technologies && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  💻 Công nghệ / Môi trường phát triển
                </h3>
                <div className="space-y-3">
                  {job.company.technologies.backend &&
                    job.company.technologies.backend.length > 0 && (
                      <div>
                        <span className="font-medium">Backend:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {job.company.technologies.backend.map(
                            (tech, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {job.company.technologies.frontend &&
                    job.company.technologies.frontend.length > 0 && (
                      <div>
                        <span className="font-medium">Frontend:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {job.company.technologies.frontend.map(
                            (tech, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800"
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {job.company.technologies.infrastructure &&
                    job.company.technologies.infrastructure.length > 0 && (
                      <div>
                        <span className="font-medium">Infrastructure:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {job.company.technologies.infrastructure.map(
                            (tech, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-purple-100 text-purple-800"
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Company Culture */}
            {job.company.characteristics && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  👥 Quy mô tổ chức & Văn hóa
                </h3>
                <div className="space-y-2">
                  {job.company.characteristics.size && (
                    <div>
                      <span className="font-medium">Quy mô:</span>{" "}
                      <span>{job.company.characteristics.size}</span>
                    </div>
                  )}
                  {job.company.characteristics.culture &&
                    job.company.characteristics.culture.length > 0 && (
                      <div>
                        <span className="font-medium">Văn hóa:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {job.company.characteristics.culture.map(
                            (culture, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800"
                              >
                                {culture}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Requirements & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    🎯 Yêu cầu
                  </h3>
                  <div className="space-y-2">
                    {job.requirements.experience && (
                      <div>
                        <span className="font-medium">Kinh nghiệm:</span>{" "}
                        <span>{job.requirements.experience}</span>
                      </div>
                    )}
                    {job.requirements.languages &&
                      job.requirements.languages.length > 0 && (
                        <div>
                          <span className="font-medium">Ngôn ngữ:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.requirements.languages.map((lang, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    💼 Phúc lợi
                  </h3>
                  <div className="space-y-2">
                    {job.benefits.workStyle && (
                      <div>
                        <span className="font-medium">Hình thức làm việc:</span>{" "}
                        <span>{job.benefits.workStyle}</span>
                      </div>
                    )}
                    {job.benefits.welfare &&
                      job.benefits.welfare.length > 0 && (
                        <div>
                          <span className="font-medium">Phúc lợi:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {job.benefits.welfare.map((benefit, index) => (
                              <li key={index} className="text-sm">
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mô tả công việc
            </h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {job.description || "Chưa có mô tả chi tiết."}
              </pre>
            </div>
          </div>

          {/* URL gốc */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              URL gốc của Job:
            </h3>
            <a
              href={job.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all"
            >
              {job.originalUrl}
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Salary Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              💴 Lương / Điều kiện
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Mức lương:</span>
                <div className="text-lg font-semibold text-green-600 mt-1">
                  {formatSalary(job.salaryInfo)}
                </div>
              </div>
              <div>
                <span className="font-medium">Hình thức:</span>
                <span className="ml-2">正社員</span>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Thông tin công ty
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Tên công ty:</span>
                <div className="mt-1">{job.company.name}</div>
                {job.company.nameKanji && (
                  <div className="text-sm text-gray-600">
                    {job.company.nameKanji}
                  </div>
                )}
              </div>
              {job.company.location && (
                <div>
                  <span className="font-medium">Địa điểm:</span>
                  <div className="mt-1">{job.company.location}</div>
                </div>
              )}
              {job.company.website && (
                <div>
                  <span className="font-medium">Website:</span>
                  <div className="mt-1">
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 break-all"
                    >
                      {job.company.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động</h3>
            <div className="space-y-3">
              <a
                href={job.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ứng tuyển trên Indeed
              </a>
              <a
                href="/"
                className="w-full btn-secondary flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
