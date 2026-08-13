import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from './domain/repositories/user.repository';
import { SessionRepository } from './domain/repositories/session.repository';
import { PasswordHasher } from './domain/ports/password-hasher';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RegisterUseCase } from './application/use-cases/register/register.use-case';
import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile/update-profile.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password/change-password.use-case';
import { RequestEmailChangeUseCase } from './application/use-cases/request-email-change/request-email-change.use-case';
import { ConfirmEmailChangeUseCase } from './application/use-cases/confirm-email-change/confirm-email-change.use-case';
import { ExportAccountDataUseCase } from './application/use-cases/export-account-data/export-account-data.use-case';
import { AuthController } from './presentation/http/auth.controller';
import { ProfileController } from './presentation/http/profile.controller';
import { AccountController } from './presentation/http/account.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.get<string>('JWT_EXPIRES_IN')) || 604800,
        },
      }),
    }),
  ],
  controllers: [AuthController, ProfileController, AccountController],
  providers: [
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    RegisterUseCase,
    LoginUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    RequestEmailChangeUseCase,
    ConfirmEmailChangeUseCase,
    ExportAccountDataUseCase,
    JwtStrategy,
  ],
  exports: [UserRepository],
})
export class AuthModule {}
