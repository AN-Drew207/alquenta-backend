import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyNotOwnedByAdminException } from '../../../domain/exceptions/property-not-owned-by-admin.exception';
import { PropertyNotCancelledException } from '../../../domain/exceptions/property-not-cancelled.exception';
import { PropertyStatus } from '../../../domain/enums/property-status.enum';
import { MediaService } from '../../../../media/media.service';
import { DeletePropertyCommand } from './delete-property.command';

@Injectable()
export class DeletePropertyUseCase
  implements UseCase<DeletePropertyCommand, void>
{
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly mediaService: MediaService,
  ) {}

  async execute(command: DeletePropertyCommand): Promise<void> {
    const property = await this.propertyRepository.findById(
      command.propertyId,
    );
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }
    if (!property.belongsTo(command.adminId)) {
      throw new PropertyNotOwnedByAdminException(command.propertyId);
    }
    if (property.status !== PropertyStatus.CANCELLED) {
      throw new PropertyNotCancelledException(command.propertyId);
    }

    await this.propertyRepository.delete(command.propertyId);
    await Promise.all([
      this.mediaService.deleteAssets(property.images, 'image'),
      this.mediaService.deleteAssets(property.videos, 'video'),
    ]);
  }
}
