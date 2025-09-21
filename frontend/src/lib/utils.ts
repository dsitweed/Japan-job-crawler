import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSalary(salaryInfo: any): string {
  if (!salaryInfo) return "応相談";

  // If there's a display string, use it first
  if (salaryInfo.display) {
    return salaryInfo.display.endsWith(" 万円")
      ? salaryInfo.display
      : `${salaryInfo.display} 万円`;
  }

  // Format based on min/max values
  if (salaryInfo.min && salaryInfo.max) {
    const minInMan = Math.floor(salaryInfo.min / 10000);
    const maxInMan = Math.floor(salaryInfo.max / 10000);
    const period = salaryInfo.period || "年収";
    const type = salaryInfo.type ? ` (${salaryInfo.type})` : "";
    return `${minInMan}〜${maxInMan}万円 ${period}${type}`;
  }

  if (salaryInfo.min) {
    const minInMan = Math.floor(salaryInfo.min / 10000);
    const period = salaryInfo.period || "年収";
    const type = salaryInfo.type ? ` (${salaryInfo.type})` : "";
    return `${minInMan}万円以上 ${period}${type}`;
  }

  return "応相談";
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

export function getExperienceYears(experience?: string): string {
  if (!experience) return "Không yêu cầu";

  // Extract numbers from experience string
  const numbers = experience.match(/\d+/g);
  if (numbers) {
    const years = parseInt(numbers[0]);
    if (years === 0) return "Không yêu cầu kinh nghiệm";
    if (years === 1) return "1 năm kinh nghiệm";
    return `${years}+ năm kinh nghiệm`;
  }

  // Check for common Japanese experience terms
  if (experience.includes("未経験") || experience.includes("初心者")) {
    return "Không yêu cầu kinh nghiệm";
  }
  if (experience.includes("新卒")) {
    return "Sinh viên mới tốt nghiệp";
  }
  if (experience.includes("経験者")) {
    return "Có kinh nghiệm";
  }

  return experience.substring(0, 20) + "...";
}

export function getCompanySize(company: any): string {
  // From characteristics.size
  if (company.characteristics?.size) {
    const size = company.characteristics.size;
    if (
      size.includes("Large") ||
      size.includes("大手") ||
      size.includes("上場")
    ) {
      return "Doanh nghiệp lớn";
    }
    if (
      size.includes("Medium") ||
      size.includes("中小") ||
      size.includes("中堅")
    ) {
      return "Doanh nghiệp vừa";
    }
    if (
      size.includes("Small") ||
      size.includes("小規模") ||
      size.includes("ベンチャー")
    ) {
      return "Doanh nghiệp nhỏ";
    }
    return size;
  }

  // Fallback to companyType
  if (company.companyType) {
    const type = company.companyType;
    if (type === "Enterprise") return "Doanh nghiệp lớn";
    if (type === "Mid-size") return "Doanh nghiệp vừa";
    if (type === "Startup") return "Doanh nghiệp nhỏ";
  }

  return "Không rõ";
}

export function getRoleType(job: any): string {
  const title = (job.title || "").toLowerCase();
  const description = (job.description || "").toLowerCase();
  const technologies = job.company?.technologies || {};

  // Check for Infrastructure/DevOps roles
  const infraKeywords = [
    "infra",
    "infrastructure",
    "devops",
    "sre",
    "cloud",
    "aws",
    "gcp",
    "azure",
    "kubernetes",
    "docker",
    "terraform",
    "ansible",
    "インフラ",
    "運用",
    "保守",
  ];

  const backendKeywords = [
    "backend",
    "back-end",
    "server",
    "api",
    "database",
    "バックエンド",
    "サーバー",
    "データベース",
    "spring",
    "django",
    "rails",
    "node.js",
    "go",
    "java",
    "python",
  ];

  const frontendKeywords = [
    "frontend",
    "front-end",
    "react",
    "vue",
    "angular",
    "javascript",
    "typescript",
    "フロントエンド",
    "ui",
    "ux",
    "web",
  ];

  // Check title and description
  const hasInfra = infraKeywords.some(
    (keyword) => title.includes(keyword) || description.includes(keyword)
  );
  const hasBackend = backendKeywords.some(
    (keyword) => title.includes(keyword) || description.includes(keyword)
  );
  const hasFrontend = frontendKeywords.some(
    (keyword) => title.includes(keyword) || description.includes(keyword)
  );

  // Check tech stack
  const infraTech =
    (technologies.infrastructure || []).length > 0 ||
    (technologies.cicd || []).length > 0;
  const backendTech = (technologies.backend || []).length > 0;
  const frontendTech = (technologies.frontend || []).length > 0;

  // Determine primary role
  if (hasInfra || infraTech) {
    return "Infrastructure/DevOps";
  } else if (hasBackend || backendTech) {
    if (hasFrontend || frontendTech) {
      return "Full-stack";
    }
    return "Backend";
  } else if (hasFrontend || frontendTech) {
    return "Frontend";
  }

  return "General IT";
}
