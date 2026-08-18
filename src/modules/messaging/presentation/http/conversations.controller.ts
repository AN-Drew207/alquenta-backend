import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { StartConversationUseCase } from '../../application/use-cases/start-conversation/start-conversation.use-case';
import { StartConversationCommand } from '../../application/use-cases/start-conversation/start-conversation.command';
import { ReplyToConversationUseCase } from '../../application/use-cases/reply-to-conversation/reply-to-conversation.use-case';
import { ReplyToConversationCommand } from '../../application/use-cases/reply-to-conversation/reply-to-conversation.command';
import { ListMyConversationsUseCase } from '../../application/use-cases/list-my-conversations/list-my-conversations.use-case';
import { ListConversationMessagesUseCase } from '../../application/use-cases/list-conversation-messages/list-conversation-messages.use-case';
import { ListConversationMessagesQuery } from '../../application/use-cases/list-conversation-messages/list-conversation-messages.query';
import { GetAdminResponseStatsUseCase } from '../../application/use-cases/get-admin-response-stats/get-admin-response-stats.use-case';
import { GetAdminResponseStatsQuery } from '../../application/use-cases/get-admin-response-stats/get-admin-response-stats.query';
import { StartConversationRequestDto } from './dto/start-conversation-request.dto';
import { ReplyRequestDto } from './dto/reply-request.dto';
import { StartConversationResponseDto } from './dto/start-conversation-response.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { AdminResponseStatsResponseDto } from './dto/admin-response-stats-response.dto';
import { ConversationResponseMapper } from './mappers/conversation-response.mapper';
import { MessageResponseMapper } from './mappers/message-response.mapper';

@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly startConversationUseCase: StartConversationUseCase,
    private readonly replyToConversationUseCase: ReplyToConversationUseCase,
    private readonly listMyConversationsUseCase: ListMyConversationsUseCase,
    private readonly listConversationMessagesUseCase: ListConversationMessagesUseCase,
    private readonly getAdminResponseStatsUseCase: GetAdminResponseStatsUseCase,
  ) {}

  @ApiOperation({
    summary:
      "An admin's response rate and average response time, computed from their conversations (public, no auth required)",
  })
  @Public()
  @Get('admins/:adminId/response-stats')
  async getAdminResponseStats(
    @Param('adminId') adminId: string,
  ): Promise<AdminResponseStatsResponseDto> {
    const stats = await this.getAdminResponseStatsUseCase.execute(
      new GetAdminResponseStatsQuery(adminId),
    );
    return {
      responseRate: stats.responseRate,
      averageResponseMinutes: stats.averageResponseMinutes,
      sampleSize: stats.sampleSize,
    };
  }

  @ApiOperation({
    summary:
      "Contact a property owner — a CLIENT reaching out to an ADMIN, or an ADMIN reaching out to another ADMIN's listing (never their own). Reuses the existing conversation for this initiator+property if one already exists.",
  })
  @Roles(Role.CLIENT, Role.ADMIN)
  @Post()
  async start(
    @Body() dto: StartConversationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StartConversationResponseDto> {
    const result = await this.startConversationUseCase.execute(
      new StartConversationCommand(dto.propertyId, user.id, dto.content),
    );
    return {
      conversation: ConversationResponseMapper.toDto(result.conversation),
      message: MessageResponseMapper.toDto(result.message),
    };
  }

  @ApiOperation({
    summary: "List the authenticated user's conversations (as client or admin)",
  })
  @Get()
  async listMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this.listMyConversationsUseCase.execute(
      user.id,
    );
    return conversations.map(ConversationResponseMapper.toDto);
  }

  @ApiOperation({
    summary: 'List messages in a conversation (must be a participant)',
  })
  @Get(':id/messages')
  async listMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.listConversationMessagesUseCase.execute(
      new ListConversationMessagesQuery(id, user.id),
    );
    return messages.map(MessageResponseMapper.toDto);
  }

  @ApiOperation({
    summary: 'Reply on an existing conversation (either participant, client or admin)',
  })
  @Post(':id/messages')
  async reply(
    @Param('id') id: string,
    @Body() dto: ReplyRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto> {
    const message = await this.replyToConversationUseCase.execute(
      new ReplyToConversationCommand(id, user.id, dto.content),
    );
    return MessageResponseMapper.toDto(message);
  }
}
