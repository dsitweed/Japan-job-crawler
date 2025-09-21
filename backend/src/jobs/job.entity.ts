import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "./company.entity";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 500, unique: true })
  originalUrl: string;

  @Column({ length: 100, nullable: true })
  jobId: string;

  @Column({ type: "jsonb", nullable: true })
  salaryInfo: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string; // 年収, 月収, etc.
    display?: string;
    type?: string; // 正社員, 業務委託, アルバイト・パート
  };

  @Column({ type: "jsonb", nullable: true })
  requirements: {
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: string[];
    certification?: string[];
  };

  @Column({ type: "jsonb", nullable: true })
  benefits: {
    workStyle?: string; // リモート, フレックス, etc.
    welfare?: string[];
    vacation?: string;
    tags?: string[]; // Tags từ Indeed như "在宅OK", "急募", etc.
  };

  @Column({ type: "jsonb", nullable: true })
  jobMetadata: {
    employmentType?: string; // 正社員, 業務委託, etc.
    workSchedule?: string; // フルタイム, パートタイム
    postedDate?: string;
    isNewJob?: boolean;
    isUrgent?: boolean;
    companyRating?: number;
    respondsQuickly?: boolean;
  };

  @Column({ default: "active" })
  status: string; // active, expired, deleted

  @ManyToOne(() => Company, (company) => company.jobs, { eager: true })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @Column()
  companyId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
