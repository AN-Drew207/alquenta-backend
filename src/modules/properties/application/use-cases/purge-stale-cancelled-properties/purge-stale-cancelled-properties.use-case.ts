import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { MediaService } from '../../../../media/media.service';

export const CANCELLED_RETENTION_DAYS = 90;

@Injectable()
export class PurgeStaleCancelledPropertiesUseCase implements UseCase<
  void,
  number
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly mediaService: MediaService,
  ) {}

  async execute(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CANCELLED_RETENTION_DAYS);

    const staleProperties =
      await this.propertyRepository.findCancelledBefore(cutoff);

    for (const property of staleProperties) {
      await this.propertyRepository.delete(property.id);
      await Promise.all([
        this.mediaService.deleteAssets(property.images, 'image'),
        this.mediaService.deleteAssets(property.videos, 'video'),
      ]);
    }

    return staleProperties.length;
  }
}
