import { Injectable, Logger } from "@nestjs/common";
import { JobsService } from "../jobs/jobs.service";

@Injectable()
export class MockCrawlerService {
  private readonly logger = new Logger(MockCrawlerService.name);

  constructor(private readonly jobsService: JobsService) {}

  async createMockJobs(): Promise<{ message: string; jobsCreated: number }> {
    try {
      // Clear existing jobs first by getting current jobs and checking count
      const existingJobs = await this.jobsService.findAll();

      const mockJobs = [
        {
          title: "バックエンドエンジニア（AI × 動作解析）",
          description: `【業務内容】
              ・Webアプリケーションのサーバーサイド開発
              ・API設計・開発
              ・動作解析AIアルゴリズムの実装サポート
              ・システムアーキテクチャの設計

              【技術スタック】
              ・Node.js, Python
              ・React, Next.js
              ・AWS, Docker
              ・PostgreSQL, Redis

              【求める人材】
              ・サーバーサイド開発経験3年以上
              ・API設計・開発経験
              ・チーム開発経験
              ・新しい技術への興味

              【働き方】
              ・リモートワーク可（週2-3日出社）
              ・フレックスタイム制
              ・裁量労働制`,
          location: "Tokyo / Remote",
          originalUrl: "https://jp.indeed.com/viewjob?jk=mock001",
          jobId: "mock001",
          salaryInfo: {
            min: 8000000,
            max: 12000000,
            currency: "JPY",
            period: "年収",
            display: "800万円 〜 1,200万円",
          },
          requirements: {
            experience: "3年以上",
            skills: ["Node.js", "Python", "API開発"],
            languages: ["日本語", "英語（ビジネスレベル優遇）"],
          },
          benefits: {
            workStyle: "リモートワーク可",
            welfare: ["社会保険完備", "完全週休2日制", "冬季休業"],
          },
          company: {
            name: "株式会社Sportip",
            nameKanji: "Sportip Inc.",
            description: "AI × 動作解析を活用したヘルスケアスタートアップ",
            industry: "IT / インターネット / ヘルスケア・AI",
            subIndustry:
              "AI × 動作解析 / BtoB SaaS / 健康・介護・スポーツ関連サービス",
            companyType: "Startup",
            characteristics: {
              size: "~40 nhân sự",
              culture: [
                "startup environment",
                "リモートワーク",
                "フレックスタイム",
              ],
              techStack: ["Node.js", "React", "Python", "AI/ML"],
            },
            technologies: {
              backend: ["Node.js", "Python", "API開発"],
              frontend: ["React", "Next.js", "TypeScript"],
              infrastructure: ["AWS", "クラウド"],
              cicd: ["Docker", "CI/CD pipeline"],
            },
            website: "https://sportip.co.jp",
            location: "Tokyo",
          },
        },
        {
          title: "フロントエンドエンジニア（React/Next.js）",
          description: `【業務内容】
            ・Webアプリケーションのフロントエンド開発
            ・UI/UXの改善・最適化
            ・モバイル対応・レスポンシブ対応
            ・パフォーマンス改善

            【技術スタック】
            ・React, Next.js, TypeScript
            ・TailwindCSS, Chakra UI
            ・Jest, Testing Library
            ・Vercel, AWS

            【求める人材】
            ・React開発経験2年以上
            ・TypeScript経験
            ・UI/UX意識の高い方
            ・チーム開発経験

            【働き方】
            ・フルリモート可
            ・フレックスタイム制
            ・副業OK`,
          location: "Tokyo / Full Remote",
          originalUrl: "https://jp.indeed.com/viewjob?jk=mock002",
          jobId: "mock002",
          salaryInfo: {
            min: 6000000,
            max: 10000000,
            currency: "JPY",
            period: "年収",
            display: "600万円 〜 1,000万円",
          },
          requirements: {
            experience: "2年以上",
            skills: ["React", "Next.js", "TypeScript"],
            languages: ["日本語"],
          },
          benefits: {
            workStyle: "フルリモート可",
            welfare: ["社会保険完備", "副業OK", "書籍購入補助"],
          },
          company: {
            name: "株式会社TechInnovate",
            nameKanji: "TechInnovate Inc.",
            description: "イノベーティブなWebサービスを開発するスタートアップ",
            industry: "IT / インターネット / Webサービス",
            subIndustry: "SaaS / B2B / エンタープライズ向けソリューション",
            companyType: "Startup",
            characteristics: {
              size: "~25 nhân sự",
              culture: ["innovation", "リモートファースト", "副業推奨"],
              techStack: ["React", "Next.js", "TypeScript", "Node.js"],
            },
            technologies: {
              backend: ["Node.js", "Express", "GraphQL"],
              frontend: ["React", "Next.js", "TypeScript", "TailwindCSS"],
              infrastructure: ["Vercel", "AWS", "Supabase"],
              cicd: ["GitHub Actions", "Vercel"],
            },
            website: "https://techinnovate.jp",
            location: "Tokyo",
          },
        },
        {
          title: "フルスタックエンジニア（Next.js + NestJS）",
          description: `【業務内容】
・フルスタックWebアプリケーション開発
・REST API / GraphQL API設計・開発
・データベース設計・チューニング
・インフラ構築・運用

【技術スタック】
・Frontend: Next.js, React, TypeScript
・Backend: NestJS, Node.js, TypeORM
・Database: PostgreSQL, Redis
・Infrastructure: AWS, Docker, Kubernetes

【求める人材】
・フルスタック開発経験3年以上
・Next.js + NestJS経験者
・クラウドインフラ経験
・アジャイル開発経験

【働き方】
・ハイブリッドワーク（週3出社）
・フレックスタイム制
・勉強会・カンファレンス参加支援`,
          location: "Tokyo / Hybrid",
          originalUrl: "https://jp.indeed.com/viewjob?jk=mock003",
          jobId: "mock003",
          salaryInfo: {
            min: 7000000,
            max: 13000000,
            currency: "JPY",
            period: "年収",
            display: "700万円 〜 1,300万円",
          },
          requirements: {
            experience: "3年以上",
            skills: ["Next.js", "NestJS", "TypeScript", "PostgreSQL"],
            languages: ["日本語", "英語（読み書きレベル）"],
          },
          benefits: {
            workStyle: "ハイブリッドワーク",
            welfare: [
              "社会保険完備",
              "勉強会参加支援",
              "資格取得支援",
              "退職金制度",
            ],
          },
          company: {
            name: "株式会社CloudTech",
            nameKanji: "CloudTech Corporation",
            description: "クラウドベースのエンタープライズソリューション開発",
            industry: "IT / クラウドサービス / エンタープライズ",
            subIndustry:
              "SaaS / PaaS / エンタープライズ向けクラウドソリューション",
            companyType: "Growth",
            characteristics: {
              size: "~120 nhân sự",
              culture: ["技術志向", "ワークライフバランス", "成長支援"],
              techStack: ["Next.js", "NestJS", "AWS", "Kubernetes"],
            },
            technologies: {
              backend: ["NestJS", "Node.js", "TypeORM", "GraphQL"],
              frontend: ["Next.js", "React", "TypeScript", "TailwindCSS"],
              infrastructure: ["AWS", "Docker", "Kubernetes", "Terraform"],
              cicd: ["GitHub Actions", "AWS CodePipeline"],
            },
            website: "https://cloudtech.jp",
            location: "Tokyo",
          },
        },
        {
          title: "DevOpsエンジニア（AWS/Kubernetes）",
          description: `【業務内容】
                      ・AWSインフラ設計・構築・運用ß
                      ・Kubernetesクラスター管理
                      ・CI/CDパイプライン構築・改善
                      ・監視・ログ基盤の構築・運用
                      ・セキュリティ対策の実装

                      【技術スタック】
                      ・AWS (EKS, RDS, ElastiCache, CloudWatch)
                      ・Kubernetes, Docker
                      ・Terraform, Ansible
                      ・GitHub Actions, Jenkins
                      ・Prometheus, Grafana

                      【求める人材】
                      ・AWS運用経験2年以上
                      ・Kubernetes経験
                      ・Infrastructure as Code経験
                      ・監視・ログ基盤構築経験

                      【働き方】
                      ・リモートワーク中心（月1-2回出社）
                      ・オンコール対応あり
                      ・24時間365日監視体制`,
          location: "Tokyo / Remote",
          originalUrl: "https://jp.indeed.com/viewjob?jk=mock004",
          jobId: "mock004",
          salaryInfo: {
            min: 7500000,
            max: 14000000,
            currency: "JPY",
            period: "年収",
            display: "750万円 〜 1,400万円",
          },
          requirements: {
            experience: "2年以上",
            skills: ["AWS", "Kubernetes", "Docker", "Terraform"],
            languages: ["日本語", "英語（技術ドキュメント読解レベル）"],
          },
          benefits: {
            workStyle: "リモートワーク中心",
            welfare: [
              "社会保険完備",
              "オンコール手当",
              "AWS認定資格取得支援",
              "健康診断",
            ],
          },
          company: {
            name: "株式会社InfraCloud",
            nameKanji: "InfraCloud Inc.",
            description: "マルチクラウド対応のインフラストラクチャサービス",
            industry: "IT / クラウドインフラ / インフラサービス",
            subIndustry: "IaaS / マルチクラウド / インフラ運用サービス",
            companyType: "Established",
            characteristics: {
              size: "~80 nhân sự",
              culture: ["技術力重視", "リモートファースト", "自動化推進"],
              techStack: ["AWS", "GCP", "Kubernetes", "Terraform"],
            },
            technologies: {
              backend: ["Go", "Python", "Node.js"],
              frontend: ["React", "Vue.js"],
              infrastructure: ["AWS", "GCP", "Kubernetes", "Docker"],
              cicd: ["GitHub Actions", "Jenkins", "ArgoCD"],
            },
            website: "https://infracloud.jp",
            location: "Tokyo",
          },
        },
        {
          title: "データエンジニア（Python/BigQuery）",
          description: `【業務内容】
・データパイプライン設計・構築・運用
・BigQuery/Snowflakeでのデータ基盤構築
・ETL/ELTプロセスの設計・実装
・データ品質管理・監視
・機械学習向けデータ準備

【技術スタック】
・Python, SQL, dbt
・BigQuery, Snowflake, Airflow
・GCP, AWS
・Kubernetes, Docker
・Looker, Tableau

【求める人材】
・データエンジニアリング経験2年以上
・Python, SQL経験
・クラウドデータウェアハウス経験
・ETL/ELT設計経験

【働き方】
・フルリモート可
・フレックスタイム制
・データドリブン文化`,
          location: "Tokyo / Remote",
          originalUrl: "https://jp.indeed.com/viewjob?jk=mock005",
          jobId: "mock005",
          salaryInfo: {
            min: 7000000,
            max: 12000000,
            currency: "JPY",
            period: "年収",
            display: "700万円 〜 1,200万円",
          },
          requirements: {
            experience: "2年以上",
            skills: ["Python", "SQL", "BigQuery", "Airflow"],
            languages: ["日本語", "英語（技術ドキュメント読解レベル）"],
          },
          benefits: {
            workStyle: "フルリモート可",
            welfare: [
              "社会保険完備",
              "学習支援制度",
              "カンファレンス参加支援",
              "書籍購入補助",
            ],
          },
          company: {
            name: "株式会社DataLabs",
            nameKanji: "DataLabs Corporation",
            description: "データ活用によるビジネス価値創造をサポート",
            industry: "IT / データ分析 / ビジネスインテリジェンス",
            subIndustry: "データ分析 / BI / 機械学習プラットフォーム",
            companyType: "Growth",
            characteristics: {
              size: "~60 nhân sự",
              culture: ["データドリブン", "技術革新", "リモートファースト"],
              techStack: ["Python", "BigQuery", "GCP", "Machine Learning"],
            },
            technologies: {
              backend: ["Python", "FastAPI", "Django"],
              frontend: ["React", "Next.js", "TypeScript"],
              infrastructure: ["GCP", "BigQuery", "Kubernetes"],
              cicd: ["Cloud Build", "GitHub Actions"],
            },
            website: "https://datalabs.jp",
            location: "Tokyo",
          },
        },
      ];

      let jobsCreated = 0;
      for (const jobData of mockJobs) {
        try {
          // First create or update the company
          const company = await this.jobsService.createOrUpdateCompany(
            jobData.company
          );

          // Then create the job with company reference
          const { company: _, ...jobDataWithoutCompany } = jobData;
          const jobToCreate = {
            ...jobDataWithoutCompany,
            company: company,
          };

          await this.jobsService.create(jobToCreate);
          jobsCreated++;
        } catch (error) {
          console.log(`Failed to create job: ${jobData.title}`, error);
        }
      }

      return {
        message: "Successfully created mock jobs for testing",
        jobsCreated: jobsCreated,
      };
    } catch (error) {
      console.error("Error creating mock jobs:", error);
      throw new Error("Failed to create mock jobs");
    }
  }
}
