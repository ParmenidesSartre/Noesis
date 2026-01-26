import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';

/**
 * Prisma Service with Read Replica Support
 * Supports AWS RDS with primary (write) and read replica instances
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readClient: PrismaClient | null = null;
  private readonly logger: LoggerService;

  constructor(private configService: ConfigService) {
    const writeUrl = configService.get<string>('DATABASE_URL');
    if (!writeUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // 1. We pass the options directly to super() without casting.
    // NOTE: If 'db' below has a red underline, check your schema.prisma file.
    // You must change 'db' to match the name in: "datasource YOUR_NAME { ... }"
    super({
      datasources: {
        db: {
          url: writeUrl,
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.logger = LoggerService.createWithContext('PrismaService');

    // Initialize read replica if configured
    const readReplicaUrl = configService.get<string>('DATABASE_READ_REPLICA_URL');

    if (readReplicaUrl && readReplicaUrl !== writeUrl) {
      this.logger.log('Initializing read replica connection');
      this.readClient = new PrismaClient({
        datasources: {
          db: {
            url: readReplicaUrl,
          },
        },
      });
    } else {
      this.logger.log('Running in single database mode (no read replica)');
    }

    // Log Prisma events
    this.$on('query' as never, (e: unknown) => {
      const event = e as { query: string; params: string; duration: number };
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.debug(
          `Query: ${event.query} | Params: ${event.params} | Duration: ${event.duration}ms`,
        );
      }
    });

    this.$on('error' as never, (e: unknown) => {
      const event = e as { message: string };
      this.logger.error('Prisma Error', event.message);
    });

    this.$on('warn' as never, (e: unknown) => {
      const event = e as { message: string };
      this.logger.warn(`Prisma Warning: ${event.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Primary database connection established');

      if (this.readClient) {
        await this.readClient.$connect();
        this.logger.log('✅ Read replica connection established');
      }
    } catch (error) {
      this.logger.error('Failed to connect to database', (error as Error).stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Primary database connection closed');

    if (this.readClient) {
      await this.readClient.$disconnect();
      this.logger.log('Read replica connection closed');
    }
  }

  getReadClient(): PrismaClient {
    return this.readClient || this;
  }

  getWriteClient(): PrismaClient {
    return this;
  }

  async read<T>(callback: (client: PrismaClient) => Promise<T>): Promise<T> {
    return callback(this.getReadClient());
  }

  async write<T>(callback: (client: PrismaClient) => Promise<T>): Promise<T> {
    return callback(this.getWriteClient());
  }
}
