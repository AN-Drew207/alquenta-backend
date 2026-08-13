import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { CreateNotificationUseCase } from './application/use-cases/create-notification/create-notification.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email/send-notification-email.use-case';
import { ListMyNotificationsUseCase } from './application/use-cases/list-my-notifications/list-my-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read/mark-notification-as-read.use-case';
import { NotificationsController } from './presentation/http/notifications.controller';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    { provide: NotificationRepository, useClass: PrismaNotificationRepository },
    CreateNotificationUseCase,
    SendNotificationEmailUseCase,
    ListMyNotificationsUseCase,
    MarkNotificationAsReadUseCase,
  ],
  exports: [NotificationRepository, SendNotificationEmailUseCase],
})
export class NotificationsModule {}
