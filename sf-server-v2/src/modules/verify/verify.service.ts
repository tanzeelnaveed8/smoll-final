import { MailerService } from '@nestjs-modules/mailer/dist';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';
import { Logger } from 'src/configs/logger';
import twilio from 'twilio';

export type UsernameType = 'phone' | 'email' | 'invalid';

/** Test admin email for dev OTP bypass (no Twilio). Use with password Test1234! */
const TEST_ADMIN_EMAIL = 'test-admin@smoll.com';
/** Test member email for app login (no Twilio/SendGrid). Seed with: npm run seed:member-demo */
export const TEST_MEMBER_EMAIL = 'demo@smoll.com';
/** Test member phone for app login (no Twilio). Seed with: npm run seed:member-demo */
export const TEST_MEMBER_PHONE = '+971501111111';
const DEV_OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class VerifyService {
  private readonly logger = Logger.getInstance();

  /** In dev, store OTP for test admin so we can verify without Twilio */
  private readonly devTestAdminOtps = new Map<
    string,
    { code: string; expiresAt: number }
  >();

  private readonly client: twilio.Twilio | null;
  private readonly verifyServiceSid: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    const sid = this.configService.get('TWILIO_ACCOUNT_SID');
    const token = this.configService.get('TWILIO_AUTH_TOKEN');
    if (sid && token) {
      this.client = twilio(sid, token);
      this.verifyServiceSid = this.configService.get('TWILIO_VERIFY_SERVICE_SID') || null;
    } else {
      this.client = null;
      this.verifyServiceSid = null;
    }
    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridKey) SendGrid.setApiKey(sendgridKey);
  }

  //generate random 4 digit code
  generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async sendSMSVerificationCode(phoneNumber: string) {
    this.logger.info(`[LOG: VERIFY_SERVICE] Sending OTP to ${phoneNumber}`);

    const isProduction = this.configService.get('ENVIRONMENT') === 'production';
    if (!isProduction && phoneNumber === TEST_MEMBER_PHONE) {
      const code = this.generateVerificationCode();
      this.devTestAdminOtps.set(phoneNumber, {
        code,
        expiresAt: Date.now() + DEV_OTP_TTL_MS,
      });
      this.logger.warn(
        `[DEV] Test phone OTP (no SMS sent): ${code} — use this to verify`,
      );
      console.log(`\n[DEV] OTP for ${phoneNumber}: ${code}\n`);
      return { status: 'pending', sid: 'dev-test-phone' } as any;
    }

    if (!this.client || !this.verifyServiceSid) {
      throw new Error('Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }
    return await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });
  }

  async verifySMSVerificationCode(phoneNumber: string, code: string) {
    this.logger.info(`[LOG: VERIFY_SERVICE] Verifying OTP for ${phoneNumber}`);

    const isProduction = this.configService.get('ENVIRONMENT') === 'production';
    if (!isProduction && phoneNumber === TEST_MEMBER_PHONE) {
      const stored = this.devTestAdminOtps.get(phoneNumber);
      if (!stored) {
        this.logger.warn(`[DEV] No OTP found for test phone ${phoneNumber}`);
        throw new Error('Invalid OTP or OTP expired');
      }
      if (Date.now() > stored.expiresAt) {
        this.devTestAdminOtps.delete(phoneNumber);
        throw new Error('OTP expired');
      }
      if (stored.code !== code) {
        throw new Error('Invalid OTP');
      }
      this.devTestAdminOtps.delete(phoneNumber);
      return { status: 'approved' };
    }

    if (!this.client || !this.verifyServiceSid) {
      throw new Error('Twilio is not configured');
    }
    return await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });
  }

  async sendEmailVerificationCode(email: string) {
    this.logger.info(`[LOG: VERIFY_SERVICE] Sending OTP to ${email}`);

    const isProduction = this.configService.get('ENVIRONMENT') === 'production';
    const isDevTestEmail =
      !isProduction &&
      (email === TEST_ADMIN_EMAIL || email === TEST_MEMBER_EMAIL);
    if (isDevTestEmail) {
      const code = this.generateVerificationCode();
      this.devTestAdminOtps.set(email, {
        code,
        expiresAt: Date.now() + DEV_OTP_TTL_MS,
      });
      this.logger.warn(
        `[DEV] Test OTP (no email sent): ${code} — use this to verify`,
      );
      console.log(`\n[DEV] OTP for ${email}: ${code}\n`);
      return { status: 'pending', sid: 'dev-test' } as any;
    }

    if (!this.client || !this.verifyServiceSid) {
      throw new Error('Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }
    return await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({ to: email, channel: 'email' });
  }

  async sendPhoneVerificationCode(phoneNumber: string) {
    this.logger.info(`[LOG: VERIFY_SERVICE] Sending OTP to ${phoneNumber}`);
    if (!this.client || !this.verifyServiceSid) {
      throw new Error('Twilio is not configured');
    }
    return await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  async verifyEmailVerificationCode(email: string, code: string) {
    const isProduction = this.configService.get('ENVIRONMENT') === 'production';
    const isDevTestEmail =
      !isProduction &&
      (email === TEST_ADMIN_EMAIL || email === TEST_MEMBER_EMAIL);
    if (isDevTestEmail) {
      const stored = this.devTestAdminOtps.get(email);
      if (!stored) {
        this.logger.warn(`[DEV] No OTP found for test email ${email}`);
        throw new Error('Invalid OTP or OTP expired');
      }
      if (Date.now() > stored.expiresAt) {
        this.devTestAdminOtps.delete(email);
        throw new Error('OTP expired');
      }
      if (stored.code !== code) {
        throw new Error('Invalid OTP');
      }
      this.devTestAdminOtps.delete(email);
      return { status: 'approved' };
    }

    if (!this.client || !this.verifyServiceSid) {
      throw new Error('Twilio is not configured');
    }
    try {
      this.logger.info(`[LOG: VERIFY_SERVICE] Verifying OTP for ${email}`);
      return await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: email,
          code: code,
        });
    } catch (error) {
      this.logger.error(
        `[LOG: VERIFY_SERVICE] Failed to verify OTP for ${email}`,
        error,
      );
      throw error;
    }
  }

  async verifyPhoneVerificationCode(phoneNumber: string, code: string) {
    if (!this.client || !this.verifyServiceSid) {
      throw new Error('Twilio is not configured');
    }
    try {
      this.logger.info(
        `[LOG: VERIFY_SERVICE] Verifying OTP for ${phoneNumber}`,
      );
      return await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });
    } catch (error) {
      this.logger.error(
        `[LOG: VERIFY_SERVICE] Failed to verify OTP for ${phoneNumber}`,
        error,
      );
      throw error;
    }
  }

  //send temporary password to user
  async sendTemporaryPassword(email: string, password: string) {
    return this.sendMail({
      to: email,
      from: 'no-reply@smoll.me',
      subject: 'Temporary password',
      text: `Your temporary password is ${password}`,
      html: `<b>Your temporary password is ${password}</b>`,
    });
  }

  async sendMail(mail: SendGrid.MailDataRequired) {
    await SendGrid.send(mail).catch((error) => {
      this.logger.error(error);
    });

    return { statusCode: 200, message: 'Email sent successfully' };
  }
}
