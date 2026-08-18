import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import { ListAdminsUseCase } from '../../application/use-cases/list-admins/list-admins.use-case';
import { InviteAdminUseCase } from '../../application/use-cases/invite-admin/invite-admin.use-case';
import { InviteAdminCommand } from '../../application/use-cases/invite-admin/invite-admin.command';
import { DisableAdminUseCase } from '../../application/use-cases/disable-admin/disable-admin.use-case';
import { DisableAdminCommand } from '../../application/use-cases/disable-admin/disable-admin.command';
import { EnableAdminUseCase } from '../../application/use-cases/enable-admin/enable-admin.use-case';
import { EnableAdminCommand } from '../../application/use-cases/enable-admin/enable-admin.command';
import { DeleteAdminUseCase } from '../../application/use-cases/delete-admin/delete-admin.use-case';
import { DeleteAdminCommand } from '../../application/use-cases/delete-admin/delete-admin.command';
import { VerifyAdminUseCase } from '../../application/use-cases/verify-admin/verify-admin.use-case';
import { VerifyAdminCommand } from '../../application/use-cases/verify-admin/verify-admin.command';
import { UnverifyAdminUseCase } from '../../application/use-cases/unverify-admin/unverify-admin.use-case';
import { UnverifyAdminCommand } from '../../application/use-cases/unverify-admin/unverify-admin.command';
import { InviteAdminRequestDto } from './dto/invite-admin-request.dto';
import { InviteAdminResponseDto } from './dto/invite-admin-response.dto';
import { AdminSummaryResponseDto } from './dto/admin-summary-response.dto';
import { UserResponseMapper } from './mappers/user-response.mapper';

@ApiTags('superadmin')
@Roles(Role.SUPERADMIN)
@Controller('superadmin')
export class SuperadminController {
  constructor(
    private readonly listAdminsUseCase: ListAdminsUseCase,
    private readonly inviteAdminUseCase: InviteAdminUseCase,
    private readonly disableAdminUseCase: DisableAdminUseCase,
    private readonly enableAdminUseCase: EnableAdminUseCase,
    private readonly deleteAdminUseCase: DeleteAdminUseCase,
    private readonly verifyAdminUseCase: VerifyAdminUseCase,
    private readonly unverifyAdminUseCase: UnverifyAdminUseCase,
  ) {}

  @ApiOperation({ summary: 'List every ADMIN account' })
  @Get('admins')
  async listAdmins(): Promise<AdminSummaryResponseDto[]> {
    const admins = await this.listAdminsUseCase.execute();
    return admins.map((admin) => UserResponseMapper.toAdminSummaryDto(admin));
  }

  @ApiOperation({
    summary:
      'Generate an admin invitation link (7-day token). No email is sent — share the link manually.',
  })
  @Post('admins/invite')
  async inviteAdmin(
    @Body() dto: InviteAdminRequestDto,
  ): Promise<InviteAdminResponseDto> {
    const inviteUrl = await this.inviteAdminUseCase.execute(
      new InviteAdminCommand(dto.email, dto.planId),
    );
    return { inviteUrl };
  }

  @ApiOperation({ summary: 'Disable an admin account and sign them out everywhere' })
  @Patch('admins/:id/disable')
  @HttpCode(200)
  async disableAdmin(@Param('id') id: string): Promise<{ ok: true }> {
    await this.disableAdminUseCase.execute(new DisableAdminCommand(id));
    return { ok: true };
  }

  @ApiOperation({ summary: 'Re-enable a previously disabled admin account' })
  @Patch('admins/:id/enable')
  @HttpCode(200)
  async enableAdmin(@Param('id') id: string): Promise<{ ok: true }> {
    await this.enableAdminUseCase.execute(new EnableAdminCommand(id));
    return { ok: true };
  }

  @ApiOperation({
    summary:
      'Mark an admin as verified (shown as a badge on their public profile). Manual decision — no automatic criteria.',
  })
  @Patch('admins/:id/verify')
  @HttpCode(200)
  async verifyAdmin(@Param('id') id: string): Promise<{ ok: true }> {
    await this.verifyAdminUseCase.execute(new VerifyAdminCommand(id));
    return { ok: true };
  }

  @ApiOperation({ summary: 'Remove the verified badge from an admin' })
  @Patch('admins/:id/unverify')
  @HttpCode(200)
  async unverifyAdmin(@Param('id') id: string): Promise<{ ok: true }> {
    await this.unverifyAdminUseCase.execute(new UnverifyAdminCommand(id));
    return { ok: true };
  }

  @ApiOperation({
    summary:
      'Permanently delete an admin account and all of their listings/conversations',
  })
  @Delete('admins/:id')
  @HttpCode(200)
  async deleteAdmin(@Param('id') id: string): Promise<{ ok: true }> {
    await this.deleteAdminUseCase.execute(new DeleteAdminCommand(id));
    return { ok: true };
  }
}
