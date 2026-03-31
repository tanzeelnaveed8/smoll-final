import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { ReadNotificationQueryDto } from './dto/find.dto';
import {
  CreateNotificationPayloadDto,
  SendOneSignalNotificationDto,
} from './dto/create.dto';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { RolesEnum } from '../../guards/role/role.enum';
import { SocketService } from '../socket/socket.service';
import { SocketEventEnum } from '../socket/socket-event.enum';
import {
  PaginationParams,
  PaginationResult,
  paginate,
} from 'src/utils/pagination';
import * as OneSignal from '@onesignal/node-onesignal';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';
import twilio from 'twilio';
import { Logger } from 'src/configs/logger';
@Injectable()
export class NotificationService {
  private oneSignalClient: OneSignal.DefaultApi;
  private readonly client: twilio.Twilio;
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private socketService: SocketService,
    private configService: ConfigService,
  ) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );

    const config = OneSignal.createConfiguration({
      // userAuthKey: this.configService.get('ONESIGNAL_USER_AUTH_KEY'),
      restApiKey: this.configService.get('ONESIGNAL_REST_API_KEY'),
    });

    this.oneSignalClient = new OneSignal.DefaultApi(config);
  }

  async findAll(
    user: AuthUser,
    query: PaginationParams,
  ): Promise<PaginationResult<Notification>> {
    let where: FindOptionsWhere<Notification> = {
      isRead: false,
    };

    switch (user.role) {
      case RolesEnum.MEMBER:
        where = { forMember: { id: user.id }, isRead: false };
        break;
      case RolesEnum.VET:
        where = { forVet: { id: user.id }, isRead: false };
        break;
      case RolesEnum.COUNSELLOR:
        where = { forCounsellor: { id: user.id }, isRead: false };
        break;
      case RolesEnum.PARTNER:
        where = { forPartner: { id: user.id }, isRead: false };
    }

    return paginate(this.notificationRepo, query, {
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async readNotifications(
    user: AuthUser,
    readQueryDto: ReadNotificationQueryDto,
  ): Promise<void> {
    const { ids } = readQueryDto;
    const _ids = Array.isArray(ids) ? ids : [ids];

    let where: FindOptionsWhere<Notification> = {
      id: In(_ids),
    };

    switch (user.role) {
      case RolesEnum.MEMBER:
        where = { forMember: { id: user.id }, id: In(_ids) };
        break;
      case RolesEnum.VET:
        where = { forVet: { id: user.id }, id: In(_ids) };
        break;
      case RolesEnum.COUNSELLOR:
        where = { forCounsellor: { id: user.id }, id: In(_ids) };
        break;
      case RolesEnum.PARTNER:
        where = { forPartner: { id: user.id }, id: In(_ids) };
        break;
    }

    this.notificationRepo.delete(where);
  }

  async readAllNotifications(user: AuthUser): Promise<void> {
    let where: FindOptionsWhere<Notification> = {};

    switch (user.role) {
      case RolesEnum.MEMBER:
        where = { forMember: { id: user.id } };
        break;
      case RolesEnum.VET:
        where = { forVet: { id: user.id } };
        break;
      case RolesEnum.COUNSELLOR:
        where = { forCounsellor: { id: user.id } };
        break;
      case RolesEnum.PARTNER:
        where = { forPartner: { id: user.id } };
        break;
    }

    await this.notificationRepo.update(where, { isRead: true });
  }

  async create(
    userId: string,
    userRole: string,
    createPayloadDto: CreateNotificationPayloadDto,
  ): Promise<Notification> {
    try {
      const { message, meta } = createPayloadDto;

      const _notification = this.notificationRepo.create({
        message,
        isRead: false,
        meta,
        forMember: userRole === RolesEnum.MEMBER ? <any>{ id: userId } : null,
        forVet: userRole === RolesEnum.VET ? <any>{ id: userId } : null,
        forCounsellor:
          userRole === RolesEnum.COUNSELLOR ? <any>{ id: userId } : null,
        forPartner: userRole === RolesEnum.PARTNER ? <any>{ id: userId } : null,
      });

      this.socketService.emit(SocketEventEnum.NOTIFICATION_CREATED, {
        userId,
        notification: _notification,
      });

      const notification = await this.notificationRepo.save(_notification);

      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
    }
  }

  async sendOneSignalNotification(body: SendOneSignalNotificationDto) {
    try {
      const { playerId, heading, message, meta, icon } = body;

      const notification = new OneSignal.Notification();

      notification.include_subscription_ids = [playerId];
      notification.app_id = this.configService.get('ONESIGNAL_APP_ID');

      if (body.message.length) {
        notification.headings = { en: heading };
        notification.contents = { en: message };
      } else {
        notification.content_available = true;
      }

      notification.data = meta;

      if (icon) {
        notification.large_icon = icon;
      }

      await this.oneSignalClient.createNotification(notification);
    } catch (error) {
      this.logger.error('Error sending OneSignal notification:', error);
    }
  }

  async sendSmsNotification(
    phoneNumber: string,
    content: string,
  ): Promise<void> {
    try {
      await this.client.messages.create({
        body: content,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });
    } catch (error) {
      this.logger.error('Error sending SMS notification:', error);
    }
  }

  async sendEmailNotification(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    try {
      await SendGrid.send({
        to: to,
        from: 'no-reply@smoll.me',
        subject: subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
