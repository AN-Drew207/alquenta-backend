import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { SharedModule } from './shared/shared.module';
import { JwtAuthGuard } from './shared/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './shared/presentation/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { MediaModule } from './modules/media/media.module';
import { PlansModule } from './modules/plans/plans.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Global default: generous enough for normal browsing (a page can
        // fire several API calls), tight enough to block scripted abuse.
        // Specific sensitive endpoints (login) override this with @Throttle.
        throttlers: [{ ttl: 60_000, limit: 60 }],
        // NODE_ENV is set to 'test' by Jest itself (unit and e2e alike),
        // regardless of what APP_ENV says in .env — that's the reliable
        // signal to not throttle test traffic hitting the same endpoints
        // dozens of times in a few seconds.
        skipIf: () => configService.get<string>('NODE_ENV') === 'test',
      }),
    }),
    ScheduleModule.forRoot(),
    SharedModule,
    PlansModule,
    AuthModule,
    PropertiesModule,
    NotificationsModule,
    MessagingModule,
    MediaModule,
    FavoritesModule,
    ReportsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ThrottlerGuard runs first so abusive/throttled requests get rejected
    // before spending any work on auth checks.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
