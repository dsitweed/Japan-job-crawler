import { Injectable, Logger } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import { load } from "cheerio";
import { JobsService } from "../jobs/jobs.service";

export interface CrawledJobData {
  title: string;
  description: string;
  location: string;
  originalUrl: string;
  jobId: string;
  companyName: string;
  companyInfo?: any;
  salaryInfo?: any;
  requirements?: any;
  benefits?: any;
  jobMetadata?: {
    employmentType?: string;
    workSchedule?: string;
    postedDate?: string;
    isNewJob?: boolean;
    isUrgent?: boolean;
    companyRating?: number;
    respondsQuickly?: boolean;
    isSponsored?: boolean;
    tags?: string[];
  };
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private browser: puppeteer.Browser;

  constructor(private readonly jobsService: JobsService) {}

  async onModuleInit() {
    try {
      this.logger.log("Initializing Puppeteer browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
      });
      this.logger.log("Puppeteer browser initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Puppeteer browser:", error);
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async crawlIndeedJobs(
    searchQuery: string = "バックエンドエンジニア",
    location: string = "東京都",
    pages: number = 3
  ): Promise<CrawledJobData[]> {
    const allJobs: CrawledJobData[] = [];
    this.logger.log(
      `Starting to crawl ${pages} pages for query: ${searchQuery} in ${location}`
    );

    try {
      if (!this.browser) {
        this.logger.error("Browser not initialized");
        return allJobs;
      }

      const page = await this.browser.newPage();

      // Enhanced anti-detection measures
      await page.setExtraHTTPHeaders({
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      });

      await page.setViewport({ width: 1366, height: 768 });

      // Step 1: Get job IDs from listing pages
      const jobIds: string[] = [];

      for (let pageNum = 0; pageNum < pages; pageNum++) {
        const startParam = pageNum * 10;
        const url = `https://jp.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}&start=${startParam}`;
        this.logger.log(`Crawling listing page ${pageNum + 1}: ${url}`);

        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });

          await this.randomDelay(3000, 5000);

          // Wait for job results to appear
          try {
            await page.waitForSelector(
              "#searchform, .jobsearch-SerpJobCard, [data-jk]",
              { timeout: 10000 }
            );
          } catch (e) {
            this.logger.warn("Job selector not found, continuing anyway...");
          }

          const content = await page.content();
          const pageJobIds = await this.extractJobIds(content);
          jobIds.push(...pageJobIds);

          this.logger.log(
            `Found ${pageJobIds.length} job IDs on page ${pageNum + 1}`
          );

          // Add delay between pages
          if (pageNum < pages - 1) {
            await this.randomDelay(5000, 8000);
          }
        } catch (error) {
          this.logger.error(
            `Error crawling listing page ${pageNum + 1}: ${error.message}`
          );
        }
      }

      this.logger.log(`Total job IDs collected: ${jobIds.length}`);

      // Step 2: Fetch detailed job data for each jobId
      for (const jobId of jobIds.slice(0, 10)) {
        // Limit to first 10 for testing
        try {
          const detailedJob = await this.fetchJobDetail(page, jobId);
          if (detailedJob) {
            allJobs.push(detailedJob);
            this.logger.log(`Successfully crawled job: ${detailedJob.title}`);
          }
          await this.randomDelay(3000, 6000); // Longer delay between job details
        } catch (error) {
          this.logger.error(`Error fetching job ${jobId}: ${error.message}`);
        }
      }

      await page.close();
      this.logger.log(
        `Crawling completed. Total jobs crawled: ${allJobs.length}`
      );
    } catch (error) {
      this.logger.error(`Error in crawlIndeedJobs: ${error.message}`);
    }

    return allJobs;
  }

  private async extractJobIds(html: string): Promise<string[]> {
    const $ = load(html);
    const jobIds: string[] = [];

    // Extract job IDs using the data-jk attribute
    const jobElements = $("[data-jk]");

    jobElements.each((index, element) => {
      const jobId = $(element).attr("data-jk");
      if (jobId && jobId.trim()) {
        jobIds.push(jobId.trim());
      }
    });

    this.logger.debug(
      `Extracted ${jobIds.length} job IDs: ${jobIds.slice(0, 5).join(", ")}${jobIds.length > 5 ? "..." : ""}`
    );
    return [...new Set(jobIds)]; // Remove duplicates
  }

  private async fetchJobDetail(
    page: puppeteer.Page,
    jobId: string
  ): Promise<CrawledJobData | null> {
    const url = `https://jp.indeed.com/viewjob?jk=${jobId}`;

    try {
      this.logger.log(`Fetching job detail: ${url}`);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for page to load completely
      await this.randomDelay(2000, 4000);

      const content = await page.content();
      return await this.parseJobDetailPage(content, jobId, url);
    } catch (error) {
      this.logger.error(
        `Error fetching job detail for ${jobId}: ${error.message}`
      );
      return null;
    }
  }

  private async parseJobDetailPage(
    html: string,
    jobId: string,
    originalUrl: string
  ): Promise<CrawledJobData | null> {
    const $ = load(html);

    try {
      // Extract title from multiple possible selectors
      let title = "";
      const titleSelectors = [
        'h1[data-testid="jobsearch-JobInfoHeader-title"] span',
        "h1 span[title]",
        ".jobsearch-JobInfoHeader-title span",
        "h1.jobsearch-JobInfoHeader-title",
        "title",
      ];

      for (const selector of titleSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          title = element.attr("title") || element.text().trim();
          if (title && !title.includes("Indeed.com")) {
            break;
          }
        }
      }

      // Extract company name
      let companyName = "";
      const companySelectors = [
        '[data-testid="inlineHeader-companyName"] a',
        '[data-testid="inlineHeader-companyName"]',
        ".jobsearch-CompanyInfoContainer a",
        ".jobsearch-CompanyInfoContainer span",
      ];

      for (const selector of companySelectors) {
        const element = $(selector);
        if (element.length > 0) {
          companyName = element.text().trim();
          if (companyName) break;
        }
      }

      // Extract location
      let location = "";
      const locationSelectors = [
        '[data-testid="inlineHeader-companyLocation"]',
        '[data-testid="job-location"]',
        ".jobsearch-JobInfoHeader-subtitle div",
        ".jobsearch-CompanyInfoContainer div",
      ];

      for (const selector of locationSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().trim();
          if (text && !text.includes("社員") && !text.includes("円")) {
            location = text;
            break;
          }
        }
      }

      // Extract description from HTML structure - prioritize clean content
      let description = "";

      // First try to extract from JSON data (most reliable)
      description = this.extractFromJsonData($, "description");

      // If JSON extraction fails, try HTML selectors
      if (!description || description.length < 50) {
        const descriptionSelectors = [
          ".css-fdgeuo", // Main job content from single_job_response.html
          ".jobsearch-JobComponent-description .css-fdgeuo",
          "#jobDescriptionText",
          ".jobsearch-jobDescriptionText",
          ".jobsearch-JobComponent-description",
        ];

        for (const selector of descriptionSelectors) {
          const elements = $(selector);
          if (elements.length > 0) {
            // Get text from all matching elements and combine
            let combinedText = "";
            elements.each((i, el) => {
              const text = $(el).text().trim();
              if (text && !text.includes("css-") && text.length > 20) {
                combinedText += text + "\n\n";
              }
            });

            if (combinedText.trim().length > 50) {
              description = combinedText.trim();
              break;
            }
          }
        }
      }

      // Extract salary information
      const salaryInfo = this.extractSalaryFromDetailPage($);

      // Extract employment type and other metadata
      const jobMetadata = this.extractJobMetadataFromDetailPage($);

      // Extract company information
      const companyInfo = await this.analyzeCompanyInfo(
        $,
        description,
        companyName
      );

      // Parse requirements and benefits
      const requirements = this.parseRequirements(description);
      const benefits = this.parseBenefits(description);

      if (!title || !jobId) {
        this.logger.warn(
          `Missing required data for job ${jobId}: title=${!!title}`
        );
        return null;
      }

      const jobData: CrawledJobData = {
        jobId,
        title,
        originalUrl,
        companyName,
        location,
        description,
        salaryInfo,
        companyInfo,
        requirements,
        benefits,
        jobMetadata,
      };

      this.logger.debug(`Parsed job: ${title} at ${companyName} (${location})`);
      return jobData;
    } catch (error) {
      this.logger.error(`Error parsing job detail page: ${error.message}`);
      return null;
    }
  }

  private extractFromJsonData(
    $: ReturnType<typeof load>,
    field: string
  ): string {
    try {
      // Look for JSON data in script tags
      const scripts = $("script");

      for (let i = 0; i < scripts.length; i++) {
        const scriptContent = $(scripts[i]).html();
        if (scriptContent && scriptContent.includes('"description"')) {
          // Try to extract job description from JSON
          const descMatch = scriptContent.match(
            /"description"\s*:\s*{[^}]*"html"\s*:\s*"([^"]*)"/i
          );
          if (descMatch && descMatch[1]) {
            // Decode HTML entities and clean up
            let decoded = descMatch[1]
              .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) =>
                String.fromCharCode(parseInt(code, 16))
              )
              .replace(/\\u002F/g, "/")
              .replace(/\\u003C/g, "<")
              .replace(/\\u003E/g, ">")
              .replace(/\\u0026/g, "&")
              .replace(/&#(\d+);/g, (match, code) =>
                String.fromCharCode(parseInt(code, 10))
              );

            // Convert HTML to readable text
            const cheerio = require("cheerio");
            const htmlDoc = cheerio.load(`<div>${decoded}</div>`);

            // Replace <br/> with newlines
            htmlDoc("br").replaceWith("\n");

            // Get clean text
            const cleanText = htmlDoc("div")
              .first()
              .text()
              .replace(/\s+/g, " ")
              .replace(/\n\s*\n/g, "\n\n")
              .trim();

            return cleanText;
          }

          // Try alternative JSON structure
          const altMatch = scriptContent.match(
            /"jobDescription"\s*:\s*"([^"]*)"/i
          );
          if (altMatch && altMatch[1]) {
            return altMatch[1]
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
              .replace(/\s+/g, " ")
              .trim();
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Error extracting from JSON: ${error.message}`);
    }
    return "";
  }

  private extractSalaryFromDetailPage($: ReturnType<typeof load>): any {
    // Look for salary information in various places
    const salarySelectors = [
      '[data-testid="job-compensation"]',
      ".salaryText",
      ".salary",
      '[data-testid="salaries-section"]',
      '.jobsearch-JobMetadataHeader-item:contains("円")',
      '.css-1ih6vdn:contains("円")',
      'div:contains("月給")',
      'div:contains("年収")',
      'div:contains("年俸")',
      'div:contains("時給")',
    ];

    let salaryText = "";

    // First, try to find salary in text content
    const bodyText = $("body").text();
    const salaryMatches = bodyText.match(
      /(月給|年収|年俸|時給)[\s：:]*([\d,]+)\s*万?円?[\s~〜]*([\d,]+)?\s*万?円?/g
    );

    if (salaryMatches && salaryMatches.length > 0) {
      salaryText = salaryMatches[0];
    } else {
      // Fallback to element-based search
      for (const selector of salarySelectors) {
        const elements = $(selector);
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (
            text &&
            (text.includes("円") || text.includes("万")) &&
            text.length < 100
          ) {
            salaryText = text;
            return false; // Break the each loop
          }
        });
        if (salaryText) break;
      }
    }

    return salaryText ? this.parseSalaryInfo(salaryText) : null;
  }

  private extractJobMetadataFromDetailPage($: ReturnType<typeof load>): any {
    const metadata: any = {
      employmentType: "",
      isSponsored: false,
      tags: [],
      workSchedule: "",
      isRemote: false,
    };

    const bodyText = $("body").text();

    // Extract employment type from body text
    const employmentTypes = [
      "正社員",
      "業務委託",
      "契約社員",
      "アルバイト",
      "パート",
      "派遣",
    ];
    for (const type of employmentTypes) {
      if (bodyText.includes(type)) {
        metadata.employmentType = type;
        break;
      }
    }

    // Check for remote work
    if (
      bodyText.includes("リモート") ||
      bodyText.includes("在宅") ||
      bodyText.includes("フルリモート")
    ) {
      metadata.isRemote = true;
      metadata.tags.push("リモートワーク可");
    }

    // Extract work schedule
    if (bodyText.includes("フレックス")) {
      metadata.workSchedule = "フレックスタイム";
      metadata.tags.push("フレックスタイム");
    }

    // Extract common tags from body text
    const commonTags = [
      "転勤なし",
      "副業OK",
      "副業・WワークOK",
      "服装自由",
      "資格取得支援",
      "健康保険あり",
      "厚生年金あり",
      "雇用保険あり",
      "労災保険あり",
      "完全週休二日制",
      "土日祝休み",
      "年間休日120日以上",
      "交通費支給",
      "賞与あり",
      "昇給あり",
    ];

    for (const tag of commonTags) {
      if (bodyText.includes(tag)) {
        metadata.tags.push(tag);
      }
    }

    // Check for sponsored jobs
    metadata.isSponsored =
      bodyText.includes("スポンサー") ||
      bodyText.includes("sponsored") ||
      bodyText.includes("職業紹介") ||
      bodyText.includes("リクルートエージェント");

    // Remove duplicates from tags
    metadata.tags = [...new Set(metadata.tags)];

    return metadata;
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private parseSalaryInfo(salaryText: string): any {
    if (!salaryText) return null;

    // Clean the text
    const cleanText = salaryText.replace(/[\s　]+/g, " ").trim();

    // Try to match salary range
    const rangeMatch = cleanText.match(
      /(\d+(?:,\d+)*)\s*万?円?\s*(?:~|〜|以上)\s*(\d+(?:,\d+)*)?\s*万?円?/
    );
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1].replace(/,/g, ""));
      const max = rangeMatch[2]
        ? parseInt(rangeMatch[2].replace(/,/g, ""))
        : null;

      // Determine if it's in 万円 or just 円
      const isManYen = cleanText.includes("万");
      const multiplier = isManYen ? 10000 : 1;

      let period = "年収";
      if (cleanText.includes("月給")) period = "月給";
      else if (cleanText.includes("時給")) period = "時給";
      else if (cleanText.includes("年俸")) period = "年俸";

      return {
        min: min * multiplier,
        max: max ? max * multiplier : null,
        currency: "JPY",
        period,
        display: cleanText,
      };
    }

    // Try to match single salary value
    const singleMatch = cleanText.match(/(\d+(?:,\d+)*)\s*万?円?/);
    if (singleMatch) {
      const value = parseInt(singleMatch[1].replace(/,/g, ""));
      const isManYen = cleanText.includes("万");
      const multiplier = isManYen ? 10000 : 1;

      let period = "年収";
      if (cleanText.includes("月給")) period = "月給";
      else if (cleanText.includes("時給")) period = "時給";
      else if (cleanText.includes("年俸")) period = "年俸";

      return {
        min: value * multiplier,
        max: null,
        currency: "JPY",
        period,
        display: cleanText,
      };
    }

    return {
      display: cleanText,
      currency: "JPY",
    };
  }

  private async analyzeCompanyInfo(
    $: ReturnType<typeof load>,
    description: string,
    companyName: string
  ): Promise<any> {
    // This is a simplified version - in real implementation, you'd use AI/ML to analyze
    const industry = this.detectIndustry(description);
    const companyType = this.detectCompanyType(description, companyName);
    const techStack = this.detectTechStack(description);

    return {
      name: companyName,
      industry: industry.main,
      subIndustry: industry.sub,
      companyType,
      characteristics: {
        techStack: techStack.backend.concat(techStack.frontend),
        culture: this.detectCulture(description),
      },
      technologies: techStack,
    };
  }

  private detectIndustry(description: string): { main: string; sub: string } {
    const text = description.toLowerCase();

    if (
      text.includes("ai") ||
      text.includes("機械学習") ||
      text.includes("ml")
    ) {
      return { main: "IT / AI", sub: "AI・機械学習" };
    }
    if (text.includes("saas") || text.includes("クラウド")) {
      return { main: "IT / インターネット", sub: "SaaS / クラウド" };
    }
    if (
      text.includes("スポーツ") ||
      text.includes("ヘルスケア") ||
      text.includes("健康")
    ) {
      return { main: "IT / ヘルスケア", sub: "健康・スポーツ関連サービス" };
    }

    return { main: "IT / インターネット", sub: "Webサービス開発" };
  }

  private detectCompanyType(description: string, companyName: string): string {
    const text = description.toLowerCase();

    if (
      text.includes("startup") ||
      text.includes("スタートアップ") ||
      (companyName.includes("株式会社") && text.includes("新しい"))
    ) {
      return "Startup";
    }
    if (text.includes("大手") || text.includes("enterprise")) {
      return "Enterprise";
    }

    return "Mid-size";
  }

  private detectTechStack(description: string): any {
    const text = description.toLowerCase();
    const techStack = {
      backend: [],
      frontend: [],
      infrastructure: [],
      other: [],
    };

    // Backend technologies
    if (text.includes("node.js") || text.includes("nodejs"))
      techStack.backend.push("Node.js");
    if (text.includes("python")) techStack.backend.push("Python");
    if (text.includes("java")) techStack.backend.push("Java");
    if (text.includes("php")) techStack.backend.push("PHP");
    if (text.includes("ruby")) techStack.backend.push("Ruby");
    if (text.includes("go") || text.includes("golang"))
      techStack.backend.push("Go");
    if (text.includes("rails") || text.includes("csharp"))
      techStack.backend.push("Rails");
    if (text.includes("DynamoDB") || text.includes("c#"))
      techStack.backend.push("DynamoDB");
    if (text.includes("sql")) techStack.backend.push("SQL");
    if (text.includes("mysql")) techStack.backend.push("MySQL");
    if (text.includes("postgresql") || text.includes("postgres"))
      techStack.backend.push("PostgreSQL");
    if (text.includes("mongodb")) techStack.backend.push("MongoDB");
    if (text.includes("redis")) techStack.backend.push("Redis");

    if (text.includes("spring")) techStack.backend.push("Spring");
    if (text.includes("django")) techStack.backend.push("Django");
    if (text.includes("flask")) techStack.backend.push("Flask");
    if (text.includes("express")) techStack.backend.push("Express");

    // Frontend technologies
    if (text.includes("react")) techStack.frontend.push("React");
    if (text.includes("vue")) techStack.frontend.push("Vue.js");
    if (text.includes("angular")) techStack.frontend.push("Angular");
    if (text.includes("next.js") || text.includes("nextjs"))
      techStack.frontend.push("Next.js");
    if (text.includes("typescript")) techStack.frontend.push("TypeScript");

    // Infrastructure
    if (text.includes("aws")) techStack.infrastructure.push("AWS");
    if (text.includes("gcp") || text.includes("google cloud"))
      techStack.infrastructure.push("GCP");
    if (text.includes("azure")) techStack.infrastructure.push("Azure");
    if (text.includes("docker")) techStack.infrastructure.push("Docker");
    if (text.includes("kubernetes"))
      techStack.infrastructure.push("Kubernetes");
    if (text.includes("ci/cd")) techStack.infrastructure.push("CI/CD");
    if (text.includes("terraform")) techStack.infrastructure.push("Terraform");
    if (text.includes("git")) techStack.backend.push("Git");
    if (text.includes("github")) techStack.backend.push("GitHub");
    if (text.includes("gitlab")) techStack.backend.push("GitLab");
    if (text.includes("jenkins")) techStack.backend.push("Jenkins");
    if (text.includes("linux")) techStack.backend.push("Linux");

    return techStack;
  }

  private detectCulture(description: string): string[] {
    const culture = [];
    const text = description.toLowerCase();

    if (text.includes("リモート") || text.includes("remote"))
      culture.push("リモートワーク");
    if (text.includes("フレックス") || text.includes("flexible"))
      culture.push("フレックスタイム");
    if (text.includes("自由") || text.includes("自主性"))
      culture.push("自由な環境");
    if (text.includes("startup") || text.includes("スタートアップ"))
      culture.push("スタートアップ文化");
    if (text.includes("学習") || text.includes("研修"))
      culture.push("学習支援");

    return culture;
  }

  private parseRequirements(description: string): any {
    const requirements = {
      experience: "",
      skills: [],
      languages: [],
      education: "",
      certifications: [],
    };

    const text = description.toLowerCase();

    // Extract experience requirements
    const expMatches = text.match(/(\d+)年以上/g);
    if (expMatches) {
      requirements.experience = expMatches[0];
    } else if (text.includes("経験者")) {
      requirements.experience = "経験者";
    } else if (text.includes("未経験")) {
      requirements.experience = "未経験可";
    }

    // Extract technical skills
    const techSkills = [
      "java",
      "python",
      "javascript",
      "typescript",
      "node.js",
      "react",
      "vue.js",
      "angular",
      "aws",
      "gcp",
      "azure",
      "docker",
      "kubernetes",
      "sql",
      "mysql",
      "postgresql",
      "mongodb",
      "redis",
      "git",
      "github",
      "gitlab",
      "jenkins",
      "ci/cd",
      "linux",
      "spring",
      "django",
      "flask",
      "express",
      "next.js",
      "nuxt.js",
      "html",
      "css",
      "scala",
      "go",
      "rust",
      "php",
      "ruby",
      "c#",
      "c++",
      "c言語",
      "swift",
      "kotlin",
    ];

    for (const skill of techSkills) {
      if (text.includes(skill)) {
        requirements.skills.push(skill.toUpperCase());
      }
    }

    // Extract language requirements
    if (text.includes("日本語") || text.includes("japanese")) {
      requirements.languages.push("日本語");
    }
    if (text.includes("英語") || text.includes("english")) {
      requirements.languages.push("英語");
    }
    if (text.includes("中国語") || text.includes("chinese")) {
      requirements.languages.push("中国語");
    }

    // Extract education requirements
    if (text.includes("大学院")) {
      requirements.education = "大学院";
    } else if (text.includes("大学")) {
      requirements.education = "大学";
    } else if (text.includes("高専")) {
      requirements.education = "高専";
    } else if (text.includes("専門学校")) {
      requirements.education = "専門学校";
    }

    // Extract certifications
    const certifications = [
      "aws認定",
      "基本情報技術者",
      "応用情報技術者",
      "情報処理安全確保支援士",
      "pmp",
      "ccna",
      "cissp",
      "cisa",
      "oracle認定",
    ];

    for (const cert of certifications) {
      if (text.includes(cert)) {
        requirements.certifications.push(cert);
      }
    }

    return requirements;
  }

  private parseBenefits(description: string): any {
    const benefits = {
      welfare: [],
      workStyle: [],
      vacation: [],
      allowances: [],
      development: [],
    };

    const text = description.toLowerCase();

    // Welfare benefits
    const welfareItems = [
      "社会保険完備",
      "健康保険",
      "厚生年金",
      "雇用保険",
      "労災保険",
      "退職金制度",
      "企業年金",
      "財形貯蓄",
      "持株会",
      "団体保険",
    ];

    for (const item of welfareItems) {
      if (text.includes(item) || description.includes(item)) {
        benefits.welfare.push(item);
      }
    }

    // Work style benefits
    const workStyleItems = [
      "リモートワーク",
      "在宅勤務",
      "フレックスタイム",
      "時短勤務",
      "裁量労働制",
      "副業可",
      "服装自由",
      "フルリモート",
    ];

    for (const item of workStyleItems) {
      if (text.includes(item) || description.includes(item)) {
        benefits.workStyle.push(item);
      }
    }

    // Vacation benefits
    const vacationItems = [
      "完全週休2日制",
      "土日祝休み",
      "年間休日120日以上",
      "有給休暇",
      "夏季休暇",
      "年末年始休暇",
      "慶弔休暇",
      "特別休暇",
      "育児休暇",
      "介護休暇",
    ];

    for (const item of vacationItems) {
      if (text.includes(item) || description.includes(item)) {
        benefits.vacation.push(item);
      }
    }

    // Allowances
    const allowanceItems = [
      "交通費支給",
      "住宅手当",
      "家族手当",
      "食事補助",
      "通勤手当",
      "資格手当",
      "役職手当",
      "地域手当",
      "残業手当",
    ];

    for (const item of allowanceItems) {
      if (text.includes(item) || description.includes(item)) {
        benefits.allowances.push(item);
      }
    }

    // Development benefits
    const developmentItems = [
      "研修制度",
      "資格取得支援",
      "書籍購入補助",
      "セミナー参加費補助",
      "勉強会参加費補助",
      "技術書購入",
      "外部研修",
      "社内研修",
      "教育制度",
    ];

    for (const item of developmentItems) {
      if (text.includes(item) || description.includes(item)) {
        benefits.development.push(item);
      }
    }

    return benefits;
  }

  async saveJobsToDatabase(jobs: CrawledJobData[]): Promise<void> {
    for (const jobData of jobs) {
      try {
        // Create or update company with complete data
        const company = await this.jobsService.createOrUpdateCompany({
          name: jobData.companyName,
          industry: jobData.companyInfo?.industry || "IT / インターネット",
          subIndustry: jobData.companyInfo?.subIndustry || "Webサービス開発",
          companyType: jobData.companyInfo?.companyType || "Mid-size",
          description: jobData.companyInfo?.description || "",
          website: jobData.companyInfo?.website || "",
          location: jobData.location || "",
          technologies: jobData.companyInfo?.technologies || {
            backend: [],
            frontend: [],
            infrastructure: [],
            other: [],
          },
          characteristics: {
            size: jobData.companyInfo?.size || "",
            techStack: jobData.companyInfo?.characteristics?.techStack || [],
            culture: jobData.companyInfo?.characteristics?.culture || [],
            workStyle: jobData.companyInfo?.characteristics?.workStyle || [],
          },
        });

        // Check if job already exists by jobId or originalUrl
        const existingJob = await this.jobsService.findAll({
          search: jobData.jobId,
          limit: 1,
        });

        if (existingJob.data.length === 0) {
          // Prepare comprehensive job data for saving
          const jobToSave = {
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            originalUrl: jobData.originalUrl,
            jobId: jobData.jobId,
            companyId: company.id,
            // Enhanced salary information
            salaryInfo: {
              min: jobData.salaryInfo?.min || null,
              max: jobData.salaryInfo?.max || null,
              currency: jobData.salaryInfo?.currency || "JPY",
              period: jobData.salaryInfo?.period || "",
              display: jobData.salaryInfo?.display || "",
              type: jobData.jobMetadata?.employmentType || "",
            },
            // Enhanced requirements
            requirements: {
              experience: jobData.requirements?.experience || "",
              skills: jobData.requirements?.skills || [],
              education: jobData.requirements?.education || "",
              languages: jobData.requirements?.languages || [],
              certification: jobData.requirements?.certifications || [],
            },
            // Enhanced benefits
            benefits: {
              workStyle: jobData.benefits?.workStyle || [],
              welfare: jobData.benefits?.welfare || [],
              vacation: jobData.benefits?.vacation || [],
              tags: jobData.jobMetadata?.tags || [],
            },
            // Complete job metadata
            jobMetadata: {
              employmentType: jobData.jobMetadata?.employmentType || "",
              workSchedule: jobData.jobMetadata?.workSchedule || "",
              postedDate: new Date().toISOString(),
              isNewJob: true,
              isUrgent: jobData.jobMetadata?.tags?.includes("急募") || false,
              companyRating: jobData.jobMetadata?.companyRating || null,
              respondsQuickly: jobData.jobMetadata?.respondsQuickly || false,
              isSponsored: jobData.jobMetadata?.isSponsored || false,
            },
            status: "active",
          };

          // Create new job with complete data
          await this.jobsService.create(jobToSave);

          this.logger.log(
            `✅ Saved complete job data: ${jobData.title} at ${jobData.companyName} (${jobData.location})`
          );
          this.logger.debug(
            `💾 Salary: ${jobData.salaryInfo?.display || "N/A"}`
          );
          this.logger.debug(
            `🏢 Employment: ${jobData.jobMetadata?.employmentType || "N/A"}`
          );
          this.logger.debug(
            `🏷️ Tags: ${jobData.jobMetadata?.tags?.join(", ") || "None"}`
          );
        } else {
          this.logger.log(
            `⚠️ Job already exists: ${jobData.title} (${jobData.jobId})`
          );
        }
      } catch (error) {
        this.logger.error(
          `❌ Error saving job ${jobData.title}: ${error.message}`
        );
        this.logger.error(`🔍 Job data: ${JSON.stringify(jobData, null, 2)}`);
      }
    }
  }
}
