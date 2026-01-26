"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("../common/logger/logger.service");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    configService;
    readClient = null;
    logger;
    constructor(configService) {
        const writeUrl = configService.get('DATABASE_URL');
        if (!writeUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
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
        this.configService = configService;
        this.logger = logger_service_1.LoggerService.createWithContext('PrismaService');
        const readReplicaUrl = configService.get('DATABASE_READ_REPLICA_URL');
        if (readReplicaUrl && readReplicaUrl !== writeUrl) {
            this.logger.log('Initializing read replica connection');
            this.readClient = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: readReplicaUrl,
                    },
                },
            });
        }
        else {
            this.logger.log('Running in single database mode (no read replica)');
        }
        this.$on('query', (e) => {
            const event = e;
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.debug(`Query: ${event.query} | Params: ${event.params} | Duration: ${event.duration}ms`);
            }
        });
        this.$on('error', (e) => {
            const event = e;
            this.logger.error('Prisma Error', event.message);
        });
        this.$on('warn', (e) => {
            const event = e;
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
        }
        catch (error) {
            this.logger.error('Failed to connect to database', error.stack);
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
    getReadClient() {
        return this.readClient || this;
    }
    getWriteClient() {
        return this;
    }
    async read(callback) {
        return callback(this.getReadClient());
    }
    async write(callback) {
        return callback(this.getWriteClient());
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map