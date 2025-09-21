import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSalary(salaryInfo: any): string {
  if (!salaryInfo) return "Thương lượng";

  if (salaryInfo.display) return salaryInfo.display;

  if (salaryInfo.min && salaryInfo.max) {
    const minInMan = Math.floor(salaryInfo.min / 10000);
    const maxInMan = Math.floor(salaryInfo.max / 10000);
    return `${minInMan}〜${maxInMan}万円 (${salaryInfo.period || "年収"})`;
  }

  return "Thương lượng";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCompanyTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    Startup: "Startup",
    Enterprise: "Doanh nghiệp lớn",
    "Mid-size": "Công ty vừa",
  };
  return labels[type || ""] || type || "Không rõ";
}

export function getTechStackDisplay(technologies?: any): string[] {
  if (!technologies) return [];

  return [
    ...(technologies.backend || []),
    ...(technologies.frontend || []),
    ...(technologies.infrastructure || []),
    ...(technologies.other || []),
  ].slice(0, 8); // Limit to 8 items for display
}
