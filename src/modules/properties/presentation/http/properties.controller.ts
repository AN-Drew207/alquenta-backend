import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Role } from '../../../../shared/domain/role.enum';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { PropertyStatus } from '../../domain/enums/property-status.enum';
import { PublishPropertyUseCase } from '../../application/use-cases/publish-property/publish-property.use-case';
import { PublishPropertyCommand } from '../../application/use-cases/publish-property/publish-property.command';
import { UpdatePropertyUseCase } from '../../application/use-cases/update-property/update-property.use-case';
import { UpdatePropertyCommand } from '../../application/use-cases/update-property/update-property.command';
import { DeletePropertyUseCase } from '../../application/use-cases/delete-property/delete-property.use-case';
import { DeletePropertyCommand } from '../../application/use-cases/delete-property/delete-property.command';
import { ListPropertiesUseCase } from '../../application/use-cases/list-properties/list-properties.use-case';
import { GetPropertyByIdUseCase } from '../../application/use-cases/get-property-by-id/get-property-by-id.use-case';
import { CreatePropertyRequestDto } from './dto/create-property-request.dto';
import { UpdatePropertyRequestDto } from './dto/update-property-request.dto';
import { ListPropertiesQueryDto } from './dto/list-properties-query.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { PropertyResponseMapper } from './mappers/property-response.mapper';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly publishUseCase: PublishPropertyUseCase,
    private readonly updateUseCase: UpdatePropertyUseCase,
    private readonly deleteUseCase: DeletePropertyUseCase,
    private readonly listUseCase: ListPropertiesUseCase,
    private readonly getByIdUseCase: GetPropertyByIdUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  @ApiOperation({
    summary: 'Public catalog of available properties (no auth required)',
  })
  @Public()
  @Get()
  async listPublicCatalog(
    @Query() query: ListPropertiesQueryDto,
  ): Promise<PropertyResponseDto[]> {
    const properties = await this.listUseCase.execute({
      status: PropertyStatus.AVAILABLE,
      type: query.type,
      operationType: query.operationType,
      adminId: query.adminId,
      state: query.state,
      municipality: query.municipality,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      bedrooms: query.bedrooms,
      bathrooms: query.bathrooms,
      parkingSpaces: query.parkingSpaces,
    });
    return properties.map((property) => PropertyResponseMapper.toDto(property));
  }

  @ApiOperation({
    summary: "List the authenticated admin's own properties, any status",
  })
  @Roles(Role.ADMIN)
  @Get('mine')
  async listMyProperties(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyResponseDto[]> {
    const properties = await this.listUseCase.execute({
      adminId: user.id,
    });
    return properties.map((property) => PropertyResponseMapper.toDto(property));
  }

  @ApiOperation({ summary: 'Get a single property by id (no auth required)' })
  @Public()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PropertyResponseDto> {
    const property = await this.getByIdUseCase.execute(id);
    const admin = await this.userRepository.findById(property.adminId);
    const contactWhatsapp =
      property.whatsapp ??
      (admin?.showPhoneOnListings ? admin.phone : null);
    return PropertyResponseMapper.toDto(property, contactWhatsapp);
  }

  @ApiOperation({ summary: 'Publish a new property listing (ADMIN only)' })
  @Roles(Role.ADMIN)
  @Post()
  async publish(
    @Body() dto: CreatePropertyRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyResponseDto> {
    const property = await this.publishUseCase.execute(
      new PublishPropertyCommand(
        user.id,
        dto.title,
        dto.description,
        dto.address,
        dto.state,
        dto.municipality,
        dto.type,
        dto.operationType,
        dto.price,
        dto.bedrooms,
        dto.bathrooms,
        dto.parkingSpaces,
        dto.squareMeters,
        dto.images,
        dto.videos,
        dto.whatsapp,
      ),
    );
    return PropertyResponseMapper.toDto(property);
  }

  @ApiOperation({
    summary: 'Update a property (ADMIN only, must own the property)',
  })
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyResponseDto> {
    const property = await this.updateUseCase.execute(
      new UpdatePropertyCommand(id, user.id, dto),
    );
    return PropertyResponseMapper.toDto(property);
  }

  @ApiOperation({
    summary: 'Delete a property (ADMIN only, must own the property)',
  })
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteUseCase.execute(new DeletePropertyCommand(id, user.id));
  }
}
