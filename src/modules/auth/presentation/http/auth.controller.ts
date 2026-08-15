import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/entity-not-found.exception';
import { RegisterUseCase } from '../../application/use-cases/register/register.use-case';
import { RegisterCommand } from '../../application/use-cases/register/register.command';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LoginCommand } from '../../application/use-cases/login/login.command';
import { ReactivateAccountUseCase } from '../../application/use-cases/reactivate-account/reactivate-account.use-case';
import { ReactivateAccountCommand } from '../../application/use-cases/reactivate-account/reactivate-account.command';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile/update-profile.use-case';
import { UpdateProfileCommand } from '../../application/use-cases/update-profile/update-profile.command';
import { AcceptAdminInvitationUseCase } from '../../application/use-cases/accept-admin-invitation/accept-admin-invitation.use-case';
import { AcceptAdminInvitationCommand } from '../../application/use-cases/accept-admin-invitation/accept-admin-invitation.command';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Session } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { ReactivateAccountRequestDto } from './dto/reactivate-account-request.dto';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { AcceptAdminInvitationRequestDto } from './dto/accept-admin-invitation-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicProfileResponseDto } from './dto/public-profile-response.dto';
import { UserResponseMapper } from './mappers/user-response.mapper';
import { COOKIE_MAX_AGE_MS, COOKIE_NAME, cookieOptions } from './auth-cookie';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly reactivateAccountUseCase: ReactivateAccountUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly acceptAdminInvitationUseCase: AcceptAdminInvitationUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  @ApiOperation({
    summary: 'Register a new CLIENT account and set the session cookie',
  })
  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const user = await this.registerUseCase.execute(
      new RegisterCommand(dto.email, dto.password, dto.name, dto.phone),
    );
    await this.createSessionAndSetCookie(req, res, user);
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({
    summary: 'Log in with email and password, sets the session cookie',
  })
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const user = await this.loginUseCase.execute(
      new LoginCommand(dto.email, dto.password),
    );
    await this.createSessionAndSetCookie(req, res, user);
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({
    summary:
      'Reactivate a self-deactivated account (re-verifies credentials) and sign in. Accounts disabled by a superadmin cannot be reactivated this way.',
  })
  @Public()
  @Post('reactivate')
  @HttpCode(200)
  async reactivate(
    @Body() dto: ReactivateAccountRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const user = await this.reactivateAccountUseCase.execute(
      new ReactivateAccountCommand(dto.email, dto.password),
    );
    await this.createSessionAndSetCookie(req, res, user);
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({
    summary: 'Log out by clearing the session cookie and revoking the session',
  })
  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    await this.sessionRepository.delete(authenticatedUser.sessionId);
    res.clearCookie(COOKIE_NAME, cookieOptions(this.configService));
    return { ok: true };
  }

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @Get('me')
  async me(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(authenticatedUser.id);
    if (!user) {
      throw new EntityNotFoundException('User', authenticatedUser.id);
    }
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @Patch('me')
  async updateMe(
    @Body() dto: UpdateProfileRequestDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.updateProfileUseCase.execute(
      new UpdateProfileCommand(authenticatedUser.id, {
        phone: dto.phone,
        showWhatsapp: dto.showWhatsapp,
      }),
    );
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({
    summary:
      'Accept an admin invitation link, create the ADMIN account and sign in',
  })
  @Public()
  @Post('admin-invite/accept')
  async acceptAdminInvitation(
    @Body() dto: AcceptAdminInvitationRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const user = await this.acceptAdminInvitationUseCase.execute(
      new AcceptAdminInvitationCommand(dto.token, dto.name, dto.password),
    );
    await this.createSessionAndSetCookie(req, res, user);
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({
    summary: "Get a user's public profile (no auth required)",
  })
  @Public()
  @Get(':id')
  async getPublicProfile(
    @Param('id') id: string,
  ): Promise<PublicProfileResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundException('User', id);
    }
    return UserResponseMapper.toPublicDto(user);
  }

  private async createSessionAndSetCookie(
    req: Request,
    res: Response,
    user: User,
  ): Promise<void> {
    const session = Session.create({
      userId: user.id,
      userAgent: req.headers['user-agent'] ?? null,
      ip: req.ip ?? null,
    });
    await this.sessionRepository.save(session);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      sid: session.id,
    });
    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions(this.configService),
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
