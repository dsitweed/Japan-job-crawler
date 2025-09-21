import { Module } from "@nestjs/common";
import { CrawlerController } from "./crawler.controller";
import { CrawlerService } from "./crawler.service";
import { MockCrawlerService } from "./mock-crawler.service";
import { JobsModule } from "../jobs/jobs.module";

@Module({
  imports: [JobsModule],
  controllers: [CrawlerController],
  providers: [CrawlerService, MockCrawlerService],
  exports: [CrawlerService, MockCrawlerService],
})
export class CrawlerModule {}
