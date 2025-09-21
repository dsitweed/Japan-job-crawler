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

      // Set viewport to common size
      await page.setViewport({ width: 1366, height: 768 });

      for (let pageNum = 0; pageNum < pages; pageNum++) {
        const startParam = pageNum * 10;
        const url = `https://jp.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=東京都&start=${startParam}`;
        this.logger.log(`Crawling page ${pageNum + 1}: ${url}`);

        try {
          // Navigate with longer timeout
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });

          // Wait for content to load
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
          const jobs = await this.parseJobListPage(content);
          this.logger.log(`Found ${jobs.length} jobs on page ${pageNum + 1}`);

          // Get detailed info for each job (limit to first 3 for testing)
          for (const job of jobs.slice(0, 3)) {
            try {
              const detailedJob = await this.crawlJobDetail(page, job);
              allJobs.push(detailedJob);
              this.logger.log(`Crawled job: ${detailedJob.title}`);
              await this.randomDelay(2000, 4000); // Longer delay between job details
            } catch (error) {
              this.logger.error(`Error crawling job detail: ${error.message}`);
            }
          }

          // Add delay between pages
          if (pageNum < pages - 1) {
            await this.randomDelay(5000, 8000);
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

    this.logger.fatal(allJobs);

    return allJobs;
  }

  private async parseJobListPage(
    html: string
  ): Promise<Partial<CrawledJobData>[]> {
    const $ = load(html);
    const jobs: Partial<CrawledJobData>[] = [];

    // Exact selectors based on test.html analysis
    const jobContainer = '[data-testid="slider_item"]';
    const jobElements = $(jobContainer);

    this.logger.debug(
      `Found ${jobElements.length} job elements using exact selector`
    );

    if (jobElements.length === 0) {
      this.logger.warn("No job elements found with exact selector");
      return jobs;
    }

    jobElements.each((index, element) => {
      const $element = $(element);

      // Get job ID from data-jk attribute (exact match from test.html)
      const jobLinkElement = $element.find("a[data-jk]").first();
      const jobId = jobLinkElement.attr("data-jk");

      // Get title from exact selector structure
      const titleElement = $element.find("h2.jobTitle span[title]").first();
      const title = titleElement.attr("title") || titleElement.text().trim();

      // Get URL from job link
      const relativeUrl = jobLinkElement.attr("href");

      // Get company name from exact testid
      const companyElement = $element
        .find('[data-testid="company-name"]')
        .first();
      const companyName = companyElement.text().trim();

      // Get location from exact structure
      const locationSelectors = [
        '[data-testid="icon-location"] + div', // For icon-location structure
        '[data-testid="text-location"]', // For text-location structure
      ];

      let location = "";
      for (const locationSelector of locationSelectors) {
        const locationElement = $element.find(locationSelector).first();
        if (locationElement.length > 0) {
          location = locationElement.text().trim();
          if (location) break;
        }
      }

      // Get salary if available (from attribute snippet)
      const salaryElement = $element
        .find('[data-testid="attribute_snippet_testid"]')
        .first();
      let salaryInfo = "";
      if (salaryElement.length > 0) {
        const salaryText = salaryElement.text().trim();
        if (
          salaryText &&
          (salaryText.includes("円") || salaryText.includes("万"))
        ) {
          salaryInfo = salaryText;
        }
      }

      this.logger.debug(
        `Job ${index}: ID=${jobId}, Title=${title}, Company=${companyName}, Location=${location}`
      );

      if (title && jobId && relativeUrl) {
        const fullUrl = relativeUrl.startsWith("http")
          ? relativeUrl
          : `https://jp.indeed.com${relativeUrl}`;

        jobs.push({
          jobId,
          title,
          originalUrl: fullUrl,
          companyName,
          location,
          salaryInfo: salaryInfo ? { display: salaryInfo } : undefined,
        });
      }
    });

    this.logger.log(`Successfully parsed ${jobs.length} jobs from page`);
    return jobs;
  }

  private async crawlJobDetail(
    page: puppeteer.Page,
    basicJob: Partial<CrawledJobData>
  ): Promise<CrawledJobData> {
    try {
      this.logger.log(`Crawling job detail: ${basicJob.originalUrl}`);

      await page.goto(basicJob.originalUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for page to load completely
      await this.randomDelay(2000, 4000);

      const content = await page.content();
      const $ = load(content);

      // Extract job description with multiple selectors
      const descriptionSelectors = [
        "#jobDescriptionText",
        ".jobsearch-jobDescriptionText",
        '[data-testid="jobDescriptionText"]',
        ".jobDescription",
        ".jobsearch-JobMetadataHeader-container + div",
      ];

      let description = "";
      for (const selector of descriptionSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          description = element.text().trim();
          if (description && description.length > 50) break;
        }
      }

      // Enhanced salary extraction
      const salarySelectors = [
        '[data-testid="job-compensation"]',
        ".salaryText",
        ".salary",
        '[data-testid="salaries-section"]',
        '.jobsearch-JobMetadataHeader-item:contains("円")',
      ];

      let salaryText = "";
      for (const selector of salarySelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().trim();
          if (text && (text.includes("円") || text.includes("万"))) {
            salaryText = text;
            break;
          }
        }
      }

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

      this.logger.log(`Successfully crawled job detail: ${basicJob.title}`);

      return {
        ...basicJob,
        description,
        salaryInfo: salaryInfo || basicJob.salaryInfo,
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
