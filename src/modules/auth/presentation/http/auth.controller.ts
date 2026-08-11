import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/entity-not-found.exception';
import { RegisterUseCase } from '../../application/use-cases/register/register.use-case';
import { RegisterCommand } from '../../application/use-cases/register/register.command';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LoginCommand } from '../../application/use-cases/login/login.command';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserResponseMapper } from './mappers/user-response.mapper';

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  @ApiOperation({
    summary: 'Register a new CLIENT account and set the session cookie',
  })
  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const user = await this.registerUseCase.execute(
      new RegisterCommand(dto.email, dto.password, dto.name, dto.phone),
    );
    this.setAuthCookie(res, user);
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({ summary: 'Log in with email and password, sets the session cookie' })
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const user = await this.loginUseCase.execute(
      new LoginCommand(dto.email, dto.password),
    );
    this.setAuthCookie(res, user);
    return UserResponseMapper.toDto(user);
  }

  @ApiOperation({ summary: 'Log out by clearing the session cookie' })
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.clearCookie(COOKIE_NAME);
    return { ok: true };
  }

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @Get('me')
  async me(@CurrentUser() authenticatedUser: AuthenticatedUser): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(authenticatedUser.id);
    if (!user) {
      throw new EntityNotFoundException('User', authenticatedUser.id);
    }
    return UserResponseMapper.toDto(user);
  }

  private setAuthCookie(res: Response, user: User): void {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
