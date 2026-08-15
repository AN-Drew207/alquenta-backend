import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import { ListPlansUseCase } from '../../application/use-cases/list-plans/list-plans.use-case';
import { PlanResponseDto } from './dto/plan-response.dto';
import { PlanResponseMapper } from './mappers/plan-response.mapper';

@ApiTags('plans')
@Roles(Role.SUPERADMIN)
@Controller('plans')
export class PlansController {
  constructor(private readonly listPlansUseCase: ListPlansUseCase) {}

  @ApiOperation({
    summary:
      'List every subscription plan (SUPERADMIN only, used to pick a plan when inviting an admin)',
  })
  @Get()
  async list(): Promise<PlanResponseDto[]> {
    const plans = await this.listPlansUseCase.execute();
    return plans.map((plan) => PlanResponseMapper.toDto(plan));
  }
}
