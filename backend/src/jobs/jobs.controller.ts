import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { JobsService, JobFilters } from "./jobs.service";

@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(@Query() filters: JobFilters) {
    return this.jobsService.findAll(filters);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.jobsService.findOne(+id);
  }

  @Post()
  async create(@Body() jobData: any) {
    return this.jobsService.create(jobData);
  }
}
