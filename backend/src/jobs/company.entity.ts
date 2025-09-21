import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Job } from './job.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, nullable: true })
  nameKanji: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  industry: string; // Ngành lớn

  @Column({ length: 200, nullable: true })
  subIndustry: string; // Ngành nhỏ

  @Column({ length: 100, nullable: true })
  companyType: string; // Startup, Enterprise, etc.

  @Column({ type: 'jsonb', nullable: true })
  characteristics: {
    size?: string; // ~40 nhân sự
    culture?: string[];
    techStack?: string[];
    workStyle?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  technologies: {
    backend?: string[];
    frontend?: string[];
    cicd?: string[];
    infrastructure?: string[];
    other?: string[];
  };

  @Column({ length: 500, nullable: true })
  website: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @OneToMany(() => Job, job => job.company)
  jobs: Job[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}