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
    searchQuery: string = "エンジニア",
    pages: number = 3
  ): Promise<CrawledJobData[]> {
    const allJobs: CrawledJobData[] = [];
    this.logger.log(
      `Starting to crawl ${pages} pages for query: ${searchQuery}`
    );

    try {
      if (!this.browser) {
        this.logger.error("Browser not initialized");
        return allJobs;
      }

      const page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      );

      for (let pageNum = 0; pageNum < pages; pageNum++) {
        const url = `https://jp.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&start=${pageNum * 10}`;
        this.logger.log(`Crawling page ${pageNum + 1}: ${url}`);

        try {
          await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
          await this.randomDelay(2000, 4000);

          const content = await page.content();
          const jobs = await this.parseJobListPage(content);
          this.logger.log(`Found ${jobs.length} jobs on page ${pageNum + 1}`);

          // Get detailed info for each job (limit to first 3 for testing)
          for (const job of jobs.slice(0, 3)) {
            try {
              const detailedJob = await this.crawlJobDetail(page, job);
              allJobs.push(detailedJob);
              this.logger.log(`Crawled job: ${detailedJob.title}`);
              await this.randomDelay(1000, 2000);
            } catch (error) {
              this.logger.error(`Error crawling job detail: ${error.message}`);
            }
          }
        } catch (error) {
          this.logger.error(
            `Error crawling page ${pageNum + 1}: ${error.message}`
          );
        }
      }

      await page.close();
      this.logger.log(
        `Crawling completed. Total jobs found: ${allJobs.length}`
      );
    } catch (error) {
      this.logger.error(`Error in crawlIndeedJobs: ${error.message}`);
    }

    return allJobs;
  }

  private async parseJobListPage(
    html: string
  ): Promise<Partial<CrawledJobData>[]> {
    const $ = load(html);
    const jobs: Partial<CrawledJobData>[] = [];

    $("[data-jk]").each((index, element) => {
      const $element = $(element);
      const jobId = $element.attr("data-jk");
      const titleElement = $element.find('[data-testid="job-title"] a');
      const title = titleElement.text().trim();
      const relativeUrl = titleElement.attr("href");

      if (jobId && title && relativeUrl) {
        jobs.push({
          jobId,
          title,
          originalUrl: `https://jp.indeed.com${relativeUrl}`,
          companyName: $element
            .find('[data-testid="company-name"]')
            .text()
            .trim(),
          location: $element.find('[data-testid="job-location"]').text().trim(),
        });
      }
    });

    return jobs;
  }

  private async crawlJobDetail(
    page: puppeteer.Page,
    basicJob: Partial<CrawledJobData>
  ): Promise<CrawledJobData> {
    try {
      await page.goto(basicJob.originalUrl, { waitUntil: "networkidle2" });
      const content = await page.content();
      const $ = load(content);

      // Extract job description
      const description =
        $("#jobDescriptionText").text().trim() ||
        $(".jobsearch-jobDescriptionText").text().trim();

      // Parse salary information
      const salaryText = $('[data-testid="job-compensation"]').text().trim();
      const salaryInfo = this.parseSalaryInfo(salaryText);

      // Extract company information and analyze
      const companyInfo = await this.analyzeCompanyInfo(
        $,
        description,
        basicJob.companyName
      );

      // Parse requirements and benefits
      const requirements = this.parseRequirements(description);
      const benefits = this.parseBenefits(description);

      return {
        ...basicJob,
        description,
        salaryInfo,
        companyInfo,
        requirements,
        benefits,
      } as CrawledJobData;
    } catch (error) {
      this.logger.error(
        `Error crawling job detail for ${basicJob.originalUrl}: ${error.message}`
      );
      return {
        ...basicJob,
        description: "",
      } as CrawledJobData;
    }
  }

  private parseSalaryInfo(salaryText: string): any {
    if (!salaryText) return null;

    const salaryMatch = salaryText.match(
      /(\d+(?:,\d+)*)\s*万円?\s*(?:~|〜)\s*(\d+(?:,\d+)*)\s*万円?/
    );
    if (salaryMatch) {
      return {
        min: parseInt(salaryMatch[1].replace(/,/g, "")) * 10000,
        max: parseInt(salaryMatch[2].replace(/,/g, "")) * 10000,
        currency: "JPY",
        period: "年収",
        display: salaryText,
      };
    }

    return {
      display: salaryText,
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
    // Simplified parsing - in real implementation, use NLP
    const requirements = {
      experience: "",
      skills: [],
      languages: [],
    };

    const text = description.toLowerCase();

    if (text.includes("3年以上")) requirements.experience = "3年以上";
    else if (text.includes("5年以上")) requirements.experience = "5年以上";
    else if (text.includes("経験者")) requirements.experience = "経験者";

    if (text.includes("日本語")) requirements.languages.push("日本語");
    if (text.includes("英語")) requirements.languages.push("英語");

    return requirements;
  }

  private parseBenefits(description: string): any {
    const benefits = {
      welfare: [],
      workStyle: "",
    };

    const text = description.toLowerCase();

    if (text.includes("社会保険")) benefits.welfare.push("社会保険完備");
    if (text.includes("完全週休2日")) benefits.welfare.push("完全週休2日制");
    if (text.includes("リモート")) benefits.workStyle = "リモートワーク可";

    return benefits;
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async saveJobsToDatabase(jobs: CrawledJobData[]): Promise<void> {
    for (const jobData of jobs) {
      try {
        // Create or update company
        const company = await this.jobsService.createOrUpdateCompany(
          jobData.companyInfo
        );

        // Check if job already exists
        const existingJob = await this.jobsService.findAll({
          search: jobData.jobId,
          limit: 1,
        });

        if (existingJob.data.length === 0) {
          // Create new job
          await this.jobsService.create({
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            originalUrl: jobData.originalUrl,
            jobId: jobData.jobId,
            salaryInfo: jobData.salaryInfo,
            requirements: jobData.requirements,
            benefits: jobData.benefits,
            companyId: company.id,
          });

          this.logger.log(
            `Saved job: ${jobData.title} at ${jobData.companyName}`
          );
        }
      } catch (error) {
        this.logger.error(`Error saving job: ${error.message}`);
      }
    }
  }
}
