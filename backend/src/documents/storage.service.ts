import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export interface UploadResult {
  fileUrl: string;
  storedName: string;
}

@Injectable()
export class StorageService {
  private s3Client: S3Client | null = null;
  private readonly storageType: 'local' | 's3';
  private readonly localStoragePath: string;
  private readonly s3Bucket: string;
  private readonly s3Region: string;

  constructor(private readonly configService: ConfigService) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local') as 'local' | 's3';
    this.localStoragePath = this.configService.get<string>('LOCAL_STORAGE_PATH', './uploads');
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
    this.s3Region = this.configService.get<string>('AWS_S3_REGION', 'us-east-1');

    if (this.storageType === 's3') {
      this.s3Client = new S3Client({
        region: this.s3Region,
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        },
      });
    } else {
      // Ensure local storage directory exists
      void this.ensureLocalStorageDirectory();
    }
  }

  private async ensureLocalStorageDirectory(): Promise<void> {
    if (!fs.existsSync(this.localStoragePath)) {
      await mkdirAsync(this.localStoragePath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'documents'): Promise<UploadResult> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const storedName = `${folder}/${timestamp}-${randomString}${fileExtension}`;

    if (this.storageType === 's3') {
      return this.uploadToS3(file, storedName);
    } else {
      return this.uploadToLocal(file, storedName);
    }
  }

  private async uploadToS3(file: Express.Multer.File, storedName: string): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new BadRequestException('S3 client not initialized');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: storedName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private', // Files are private by default
      });

      await this.s3Client.send(command);

      const fileUrl = `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${storedName}`;

      return { fileUrl, storedName };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file to S3: ${error.message}`);
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    storedName: string,
  ): Promise<UploadResult> {
    try {
      const fullPath = path.join(this.localStoragePath, storedName);
      const directory = path.dirname(fullPath);

      // Ensure directory exists
      if (!fs.existsSync(directory)) {
        await mkdirAsync(directory, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fullPath, file.buffer);

      // Return relative URL (will be served by the application)
      const fileUrl = `/uploads/${storedName}`;

      return { fileUrl, storedName };
    } catch (error) {
      throw new BadRequestException(`Failed to save file locally: ${error.message}`);
    }
  }

  async getFile(storedName: string): Promise<Buffer> {
    if (this.storageType === 's3') {
      return this.getFileFromS3(storedName);
    } else {
      return this.getFileFromLocal(storedName);
    }
  }

  private async getFileFromS3(storedName: string): Promise<Buffer> {
    if (!this.s3Client) {
      throw new BadRequestException('S3 client not initialized');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: storedName,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as AsyncIterable<Buffer>;

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch {
      throw new BadRequestException('Failed to retrieve file from S3');
    }
  }

  private getFileFromLocal(storedName: string): Buffer {
    try {
      const fullPath = path.join(this.localStoragePath, storedName);

      if (!fs.existsSync(fullPath)) {
        throw new BadRequestException('File not found');
      }

      return fs.readFileSync(fullPath);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve file');
    }
  }

  async deleteFile(storedName: string): Promise<void> {
    if (this.storageType === 's3') {
      await this.deleteFromS3(storedName);
    } else {
      await this.deleteFromLocal(storedName);
    }
  }

  private async deleteFromS3(storedName: string): Promise<void> {
    if (!this.s3Client) {
      throw new BadRequestException('S3 client not initialized');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: storedName,
      });

      await this.s3Client.send(command);
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      console.error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  private async deleteFromLocal(storedName: string): Promise<void> {
    try {
      const fullPath = path.join(this.localStoragePath, storedName);

      if (fs.existsSync(fullPath)) {
        await unlinkAsync(fullPath);
      }
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      console.error(`Failed to delete local file: ${error.message}`);
    }
  }

  async getSignedDownloadUrl(storedName: string, expiresIn: number = 3600): Promise<string> {
    if (this.storageType === 's3') {
      if (!this.s3Client) {
        throw new BadRequestException('S3 client not initialized');
      }

      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: storedName,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } else {
      // For local storage, return the direct URL
      return `/uploads/${storedName}`;
    }
  }
}
