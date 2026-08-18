import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { CreateReportUseCase } from '../../application/use-cases/create-report/create-report.use-case';
import { CreateReportCommand } from '../../application/use-cases/create-report/create-report.command';
import { ListReportsUseCase } from '../../application/use-cases/list-reports/list-reports.use-case';
import { ListReportsQuery } from '../../application/use-cases/list-reports/list-reports.query';
import { DismissReportUseCase } from '../../application/use-cases/dismiss-report/dismiss-report.use-case';
import { DismissReportCommand } from '../../application/use-cases/dismiss-report/dismiss-report.command';
import { CreateReportRequestDto } from './dto/create-report-request.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportResponseMapper } from './mappers/report-response.mapper';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly createReportUseCase: CreateReportUseCase,
    private readonly listReportsUseCase: ListReportsUseCase,
    private readonly dismissReportUseCase: DismissReportUseCase,
  ) {}

  @ApiOperation({
    summary: 'Report a property listing (any authenticated user)',
  })
  @Post()
  @HttpCode(204)
  async create(
    @Body() dto: CreateReportRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.createReportUseCase.execute(
      new CreateReportCommand(dto.propertyId, user.id, dto.reason, dto.details),
    );
  }

  @ApiOperation({
    summary: 'List reports for the moderation queue (SUPERADMIN only)',
  })
  @Roles(Role.SUPERADMIN)
  @Get()
  async list(
    @Query() query: ListReportsQueryDto,
  ): Promise<ReportResponseDto[]> {
    const items = await this.listReportsUseCase.execute(
      new ListReportsQuery(query.status),
    );
    return items.map(ReportResponseMapper.toDto);
  }

  @ApiOperation({
    summary: 'Dismiss a report — no further action taken (SUPERADMIN only)',
  })
  @Roles(Role.SUPERADMIN)
  @Patch(':id/dismiss')
  @HttpCode(200)
  async dismiss(@Param('id') id: string): Promise<{ ok: true }> {
    await this.dismissReportUseCase.execute(new DismissReportCommand(id));
    return { ok: true };
  }
}
