import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readClient;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getReadClient(): PrismaClient;
    getWriteClient(): PrismaClient;
    read<T>(callback: (client: PrismaClient) => Promise<T>): Promise<T>;
    write<T>(callback: (client: PrismaClient) => Promise<T>): Promise<T>;
}
