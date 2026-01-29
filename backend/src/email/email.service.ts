import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditEventType, AuditSeverity } from '../audit/audit.service';

interface SendCredentialsEmailOptions {
  recipientEmail: string;
  recipientName: string;
  role: string;
  password: string;
  organizationId: number;
  senderId: number;
  senderEmail: string;
  ipAddress?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  // Security: Rate limiting - track email sends per user
  private emailRateLimiter: Map<number, { count: number; resetTime: number }> = new Map();
  private readonly MAX_EMAILS_PER_MINUTE = 10;
  private readonly MAX_EMAILS_PER_HOUR = 50;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Use environment variables for SMTP configuration
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      this.logger.warn('SMTP credentials not configured. Email sending will fail.');
      this.logger.warn('Set SMTP_USER and SMTP_PASS environment variables.');
    }

    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  /**
   * Security: Validate email address format and prevent injection
   */
  private validateEmail(email: string): void {
    // Strict email validation to prevent header injection
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email address format');
    }

    // Prevent newline characters that could be used for header injection
    if (email.includes('\n') || email.includes('\r')) {
      throw new BadRequestException('Invalid characters in email address');
    }

    // Prevent excessively long emails
    if (email.length > 254) {
      throw new BadRequestException('Email address too long');
    }
  }

  /**
   * Security: Sanitize text content to prevent injection
   */
  private sanitizeText(text: string): string {
    if (!text) return '';

    // Remove any potential HTML/script tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Remove control characters except newlines and tabs
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Limit length
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }

    return sanitized;
  }

  /**
   * Security: Check rate limit for sender
   */
  private checkRateLimit(senderId: number): void {
    const now = Date.now();
    const userLimit = this.emailRateLimiter.get(senderId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset counter every minute
      this.emailRateLimiter.set(senderId, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return;
    }

    if (userLimit.count >= this.MAX_EMAILS_PER_MINUTE) {
      throw new BadRequestException(
        `Rate limit exceeded. Maximum ${this.MAX_EMAILS_PER_MINUTE} emails per minute.`,
      );
    }

    userLimit.count++;
  }

  /**
   * Security: Verify recipient exists in the system
   */
  private async verifyRecipientExists(email: string, organizationId: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        organizationId,
      },
    });

    return !!user;
  }

  /**
   * Send credentials email to newly created user
   * Security: Only sends to verified users in the system
   */
  async sendCredentialsEmail(options: SendCredentialsEmailOptions): Promise<void> {
    const {
      recipientEmail,
      recipientName,
      role,
      password,
      organizationId,
      senderId,
      senderEmail,
      ipAddress,
    } = options;

    try {
      // Security checks
      this.validateEmail(recipientEmail);
      this.checkRateLimit(senderId);

      // Verify recipient exists in the system
      const recipientExists = await this.verifyRecipientExists(recipientEmail, organizationId);
      if (!recipientExists) {
        throw new BadRequestException('Recipient not found in the system');
      }

      // Sanitize inputs
      const sanitizedName = this.sanitizeText(recipientName);
      const sanitizedRole = this.sanitizeText(role);

      // Generate email content
      const subject = 'Your Account Credentials';
      const htmlContent = this.generateCredentialsEmailTemplate(
        sanitizedName,
        recipientEmail,
        password,
        sanitizedRole,
      );
      const textContent = this.generateCredentialsEmailText(
        sanitizedName,
        recipientEmail,
        password,
        sanitizedRole,
      );

      // Send email
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipientEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      // Audit log: Success
      await this.auditService.log({
        eventType: AuditEventType.DATA_ACCESS,
        severity: AuditSeverity.INFO,
        message: `Credentials email sent to ${recipientEmail}`,
        userId: senderId,
        userEmail: senderEmail,
        organizationId,
        ipAddress,
        metadata: {
          action: 'send_credentials_email',
          recipient: recipientEmail,
          role: sanitizedRole,
        },
      });

      this.logger.log(`Credentials email sent to ${recipientEmail}`);
    } catch (error) {
      // Audit log: Failure
      await this.auditService.log({
        eventType: AuditEventType.API_ERROR,
        severity: AuditSeverity.ERROR,
        message: `Failed to send credentials email to ${recipientEmail}: ${error.message}`,
        userId: senderId,
        userEmail: senderEmail,
        organizationId,
        ipAddress,
        metadata: {
          action: 'send_credentials_email',
          recipient: recipientEmail,
          error: error.message,
        },
      });

      this.logger.error(`Failed to send email to ${recipientEmail}:`, error);
      throw new BadRequestException('Failed to send email. Please try again later.');
    }
  }

  /**
   * Generate HTML email template for credentials
   */
  private generateCredentialsEmailTemplate(
    name: string,
    email: string,
    password: string,
    role: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .credentials-box {
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-row {
            margin: 10px 0;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            color: #4b5563;
          }
          .value {
            color: #1f2937;
            font-family: monospace;
            font-size: 14px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Our Platform!</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Your account has been created successfully. Below are your login credentials:</p>

          <div class="credentials-box">
            <div class="credential-row">
              <span class="label">Email:</span><br>
              <span class="value">${email}</span>
            </div>
            <div class="credential-row">
              <span class="label">Password:</span><br>
              <span class="value">${password}</span>
            </div>
            <div class="credential-row">
              <span class="label">Role:</span><br>
              <span class="value">${role}</span>
            </div>
          </div>

          <div class="warning">
            <strong>Important Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>Please change your password after your first login</li>
              <li>Do not share your credentials with anyone</li>
              <li>Keep this email secure and delete it after changing your password</li>
            </ul>
          </div>

          <p>If you did not expect this email or believe it was sent in error, please contact your system administrator immediately.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Tuition Management System. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for credentials
   */
  private generateCredentialsEmailText(
    name: string,
    email: string,
    password: string,
    role: string,
  ): string {
    return `
Welcome to Our Platform!

Hello ${name},

Your account has been created successfully. Below are your login credentials:

Email: ${email}
Password: ${password}
Role: ${role}

IMPORTANT SECURITY NOTICE:
- Please change your password after your first login
- Do not share your credentials with anyone
- Keep this email secure and delete it after changing your password

If you did not expect this email or believe it was sent in error, please contact your system administrator immediately.

This is an automated email. Please do not reply.

© ${new Date().getFullYear()} Tuition Management System. All rights reserved.
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service is ready');
      return true;
    } catch (error) {
      this.logger.error('Email service configuration error:', error);
      return false;
    }
  }
}
