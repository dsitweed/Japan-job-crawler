import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "./job.entity";
import { Company } from "./company.entity";

export interface JobFilters {
  search?: string;
  industry?: string;
  location?: string;
  companyType?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>
  ) {}

  async findAll(filters: JobFilters = {}) {
    const {
      search,
      industry,
      location,
      companyType,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.jobRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.status = :status", { status: "active" });

    if (search) {
      queryBuilder.andWhere(
        "(job.title ILIKE :search OR job.description ILIKE :search OR company.name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (industry) {
      queryBuilder.andWhere("company.industry ILIKE :industry", {
        industry: `%${industry}%`,
      });
    }

    if (location) {
      queryBuilder.andWhere("job.location ILIKE :location", {
        location: `%${location}%`,
      });
    }

    if (companyType) {
      queryBuilder.andWhere("company.companyType ILIKE :companyType", {
        companyType: `%${companyType}%`,
      });
    }

    const total = await queryBuilder.getCount();

    const jobs = await queryBuilder
      .orderBy("job.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Job> {
    return this.jobRepository.findOne({
      where: { id },
      relations: ["company"],
    });
  }

  async create(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobRepository.create(jobData);
    return this.jobRepository.save(job);
  }

  async createOrUpdateCompany(companyData: Partial<Company>): Promise<Company> {
    const existingCompany = await this.companyRepository.findOne({
      where: { name: companyData.name },
    });

    if (existingCompany) {
      Object.assign(existingCompany, companyData);
      return this.companyRepository.save(existingCompany);
    }

    const company = this.companyRepository.create(companyData);
    return this.companyRepository.save(company);
  }
}
