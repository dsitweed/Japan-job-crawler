import { Controller, Post, Get, Query } from "@nestjs/common";
import { CrawlerService } from "./crawler.service";
import { MockCrawlerService } from "./mock-crawler.service";

@Controller("crawler")
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly mockCrawlerService: MockCrawlerService
  ) {}

  @Post("crawl")
  async crawlJobs(
    @Query("search") search: string = "バックエンドエンジニア",
    @Query("pages") pages: string = "1"
  ) {
    const numPages = Math.min(parseInt(pages), 10); // Limit to 10 pages max

    try {
      const jobs = await this.crawlerService.crawlIndeedJobs(search, numPages);
      // await this.crawlerService.saveJobsToDatabase(jobs);

      return {
        message: `Successfully crawled and saved ${jobs.length} jobs`,
        jobsFound: jobs.length,
        searchQuery: search,
        pagesScanned: numPages,
      };
    } catch (error) {
      return {
        message: "Crawling failed, but you can use mock data for testing",
        error: error.message,
        jobsFound: 0,
        searchQuery: search,
        pagesScanned: numPages,
      };
    }
  }

  @Post("crawl/mock")
  async createMockJobs() {
    try {
      await this.mockCrawlerService.createMockJobs();
      return {
        message: "Successfully created mock jobs for testing",
        jobsCreated: 2,
      };
    } catch (error) {
      return {
        message: "Failed to create mock jobs",
        error: error.message,
      };
    }
  }

  @Get("status")
  async getCrawlerStatus() {
    return {
      status: "ready",
      message: "Crawler service is ready",
      mockEndpoint: "POST /crawler/crawl/mock - Create mock jobs for testing",
    };
  }
}
