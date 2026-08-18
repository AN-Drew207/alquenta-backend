import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { RecordPropertyViewUseCase } from '../../application/use-cases/record-property-view/record-property-view.use-case';
import { RecordPropertyViewCommand } from '../../application/use-cases/record-property-view/record-property-view.command';
import { GetPropertyAnalyticsSummaryUseCase } from '../../application/use-cases/get-property-analytics-summary/get-property-analytics-summary.use-case';
import { GetPropertyAnalyticsSummaryCommand } from '../../application/use-cases/get-property-analytics-summary/get-property-analytics-summary.command';
import { GetPortfolioAnalyticsSummaryUseCase } from '../../application/use-cases/get-portfolio-analytics-summary/get-portfolio-analytics-summary.use-case';
import { GetPortfolioAnalyticsSummaryQuery } from '../../application/use-cases/get-portfolio-analytics-summary/get-portfolio-analytics-summary.query';
import { DeviceTypeParser } from '../../infrastructure/parsing/device-type.parser';
import { PropertyAnalyticsSummaryResponseDto } from './dto/property-analytics-summary-response.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly recordPropertyViewUseCase: RecordPropertyViewUseCase,
    private readonly getPropertyAnalyticsSummaryUseCase: GetPropertyAnalyticsSummaryUseCase,
    private readonly getPortfolioAnalyticsSummaryUseCase: GetPortfolioAnalyticsSummaryUseCase,
    private readonly deviceTypeParser: DeviceTypeParser,
  ) {}

  @ApiOperation({
    summary:
      'Record a property page view (public, no auth required — rate-limited tighter than the global default since this is a zero-friction endpoint a scraper could hammer).',
  })
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('properties/:id/view')
  async recordView(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    const deviceType = this.deviceTypeParser.parse(req.headers['user-agent']);
    await this.recordPropertyViewUseCase.execute(
      new RecordPropertyViewCommand(id, deviceType),
    );
    return { ok: true };
  }

  @ApiOperation({
    summary:
      "A single property's analytics summary — total views, total contacts, conversion rate (ADMIN only, must own the property and have an assigned plan).",
  })
  @Roles(Role.ADMIN)
  @Get('properties/:id/summary')
  async getPropertySummary(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyAnalyticsSummaryResponseDto> {
    return this.getPropertyAnalyticsSummaryUseCase.execute(
      new GetPropertyAnalyticsSummaryCommand(id, user.id),
    );
  }

  @ApiOperation({
    summary:
      "The authenticated admin's analytics summary aggregated across their whole portfolio (ADMIN only, requires an assigned plan).",
  })
  @Roles(Role.ADMIN)
  @Get('summary')
  async getPortfolioSummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyAnalyticsSummaryResponseDto> {
    return this.getPortfolioAnalyticsSummaryUseCase.execute(
      new GetPortfolioAnalyticsSummaryQuery(user.id),
    );
  }
}
