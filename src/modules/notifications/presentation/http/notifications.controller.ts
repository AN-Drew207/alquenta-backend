import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { ListMyNotificationsUseCase } from '../../application/use-cases/list-my-notifications/list-my-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read/mark-notification-as-read.use-case';
import { MarkNotificationAsReadCommand } from '../../application/use-cases/mark-notification-as-read/mark-notification-as-read.command';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationResponseMapper } from './mappers/notification-response.mapper';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listMyNotificationsUseCase: ListMyNotificationsUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @ApiOperation({ summary: "List the authenticated user's own notifications" })
  @Get()
  async listMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.listMyNotificationsUseCase.execute(
      user.id,
    );
    return notifications.map((notification) =>
      NotificationResponseMapper.toDto(notification),
    );
  }

  @ApiOperation({ summary: "Mark one of the user's own notifications as read" })
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    const notification = await this.markAsReadUseCase.execute(
      new MarkNotificationAsReadCommand(id, user.id),
    );
    return NotificationResponseMapper.toDto(notification);
  }
}
