import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password/change-password.use-case';
import { ChangePasswordCommand } from '../../application/use-cases/change-password/change-password.command';
import { ExportAccountDataUseCase } from '../../application/use-cases/export-account-data/export-account-data.use-case';
import { InvalidAccountConfirmationException } from '../../domain/exceptions/invalid-account-confirmation.exception';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { DeleteAccountRequestDto } from './dto/delete-account-request.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { COOKIE_NAME, cookieOptions } from './auth-cookie';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly exportAccountDataUseCase: ExportAccountDataUseCase,
  ) {}

  @ApiOperation({ summary: "Change the authenticated user's password" })
  @Patch('password')
  async changePassword(
    @Body() dto: ChangePasswordRequestDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.changePasswordUseCase.execute(
      new ChangePasswordCommand(
        authenticatedUser.id,
        dto.currentPassword,
        dto.nextPassword,
      ),
    );
    return { ok: true };
  }

  @ApiOperation({ summary: "List the authenticated user's active sessions" })
  @Get('sessions')
  async listSessions(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.findByUserId(
      authenticatedUser.id,
    );
    return sessions
      .map((session) => ({
        id: session.id,
        userAgent: session.userAgent,
        ip: session.ip,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        current: session.id === authenticatedUser.sessionId,
      }))
      .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
  }

  @ApiOperation({ summary: 'Revoke a specific session' })
  @Delete('sessions/:id')
  async revokeSession(
    @Param('id') id: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    const session = await this.sessionRepository.findById(id);
    if (!session || session.userId !== authenticatedUser.id) {
      throw new EntityNotFoundException('Session', id);
    }
    await this.sessionRepository.delete(id);
    return { ok: true };
  }

  @ApiOperation({ summary: 'Revoke every session except the current one' })
  @Delete('sessions')
  async revokeOtherSessions(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.sessionRepository.deleteAllForUserExcept(
      authenticatedUser.id,
      authenticatedUser.sessionId,
    );
    return { ok: true };
  }

  @ApiOperation({
    summary: "Email a JSON export of the authenticated user's account data",
  })
  @Post('export')
  @HttpCode(200)
  async exportAccountData(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.exportAccountDataUseCase.execute(authenticatedUser.id);
    return { ok: true };
  }

  @ApiOperation({ summary: 'Deactivate the account and sign out everywhere' })
  @Post('deactivate')
  @HttpCode(200)
  async deactivate(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const user = await this.userRepository.findById(authenticatedUser.id);
    if (!user) {
      throw new EntityNotFoundException('User', authenticatedUser.id);
    }
    user.deactivate();
    await this.userRepository.save(user);
    await this.sessionRepository.deleteAllForUser(authenticatedUser.id);
    res.clearCookie(COOKIE_NAME, cookieOptions());
    return { ok: true };
  }

  @ApiOperation({
    summary:
      'Permanently delete the account and all owned data. Requires the username or email in the request body as confirmation.',
  })
  @Delete()
  @HttpCode(200)
  async deleteAccount(
    @Body() dto: DeleteAccountRequestDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const user = await this.userRepository.findById(authenticatedUser.id);
    if (!user) {
      throw new EntityNotFoundException('User', authenticatedUser.id);
    }
    const confirmation = dto.confirmation.trim().toLowerCase();
    const matchesUsername = user.username?.toLowerCase() === confirmation;
    const matchesEmail = user.email.toLowerCase() === confirmation;
    if (!matchesUsername && !matchesEmail) {
      throw new InvalidAccountConfirmationException();
    }

    await this.sessionRepository.deleteAllForUser(authenticatedUser.id);
    await this.userRepository.delete(authenticatedUser.id);
    res.clearCookie(COOKIE_NAME, cookieOptions());
    return { ok: true };
  }
}
