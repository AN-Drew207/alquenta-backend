import {
  Controller,
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { ListAgentsUseCase } from '../../application/use-cases/list-agents/list-agents.use-case';
import { InviteAgentUseCase } from '../../application/use-cases/invite-agent/invite-agent.use-case';
import { InviteAgentCommand } from '../../application/use-cases/invite-agent/invite-agent.command';
import { DisableAgentUseCase } from '../../application/use-cases/disable-agent/disable-agent.use-case';
import { DisableAgentCommand } from '../../application/use-cases/disable-agent/disable-agent.command';
import { EnableAgentUseCase } from '../../application/use-cases/enable-agent/enable-agent.use-case';
import { EnableAgentCommand } from '../../application/use-cases/enable-agent/enable-agent.command';
import { DeleteAgentUseCase } from '../../application/use-cases/delete-agent/delete-agent.use-case';
import { DeleteAgentCommand } from '../../application/use-cases/delete-agent/delete-agent.command';
import { InviteAgentRequestDto } from './dto/invite-agent-request.dto';
import { InviteAgentResponseDto } from './dto/invite-agent-response.dto';
import { AgentSummaryResponseDto } from './dto/agent-summary-response.dto';
import { UserResponseMapper } from './mappers/user-response.mapper';

@ApiTags('agents')
@Roles(Role.ADMIN)
@Controller('agents')
export class AgentsController {
  constructor(
    private readonly listAgentsUseCase: ListAgentsUseCase,
    private readonly inviteAgentUseCase: InviteAgentUseCase,
    private readonly disableAgentUseCase: DisableAgentUseCase,
    private readonly enableAgentUseCase: EnableAgentUseCase,
    private readonly deleteAgentUseCase: DeleteAgentUseCase,
  ) {}

  @ApiOperation({
    summary: "List the authenticated admin's agency agents",
  })
  @Get()
  async listAgents(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AgentSummaryResponseDto[]> {
    const agents = await this.listAgentsUseCase.execute(user.id);
    return agents.map((agent) => UserResponseMapper.toAgentSummaryDto(agent));
  }

  @ApiOperation({
    summary:
      'Generate an agent invitation link (7-day token). No email is sent — share the link manually.',
  })
  @Post('invite')
  async inviteAgent(
    @Body() dto: InviteAgentRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InviteAgentResponseDto> {
    const inviteUrl = await this.inviteAgentUseCase.execute(
      new InviteAgentCommand(dto.email, user.id),
    );
    return { inviteUrl };
  }

  @ApiOperation({
    summary: 'Disable an agent account and sign them out everywhere',
  })
  @Patch(':id/disable')
  @HttpCode(200)
  async disableAgent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.disableAgentUseCase.execute(
      new DisableAgentCommand(id, user.id),
    );
    return { ok: true };
  }

  @ApiOperation({ summary: 'Re-enable a previously disabled agent account' })
  @Patch(':id/enable')
  @HttpCode(200)
  async enableAgent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.enableAgentUseCase.execute(new EnableAgentCommand(id, user.id));
    return { ok: true };
  }

  @ApiOperation({
    summary:
      'Permanently delete an agent account. Their listings survive, only losing the agent attribution.',
  })
  @Delete(':id')
  @HttpCode(200)
  async deleteAgent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.deleteAgentUseCase.execute(new DeleteAgentCommand(id, user.id));
    return { ok: true };
  }
}
