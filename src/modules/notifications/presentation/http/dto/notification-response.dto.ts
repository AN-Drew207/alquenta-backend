import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { NotificationStatus } from '../../../domain/enums/notification-status.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ required: false, nullable: true })
  messageId: string | null;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @ApiProperty()
  createdAt: Date;
}
