import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 500, unique: true })
  originalUrl: string;

  @Column({ length: 100, nullable: true })
  jobId: string;

  @Column({ type: 'jsonb', nullable: true })
  salaryInfo: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string; // 年収, 月収, etc.
    display?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  benefits: {
    workStyle?: string; // リモート, フレックス, etc.
    welfare?: string[];
    vacation?: string;
  };

  @Column({ default: 'active' })
  status: string; // active, expired, deleted

  @ManyToOne(() => Company, company => company.jobs, { eager: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}