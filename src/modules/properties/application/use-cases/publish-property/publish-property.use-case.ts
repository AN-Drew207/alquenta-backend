import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { ActiveListingsLimitExceededException } from '../../../domain/exceptions/active-listings-limit-exceeded.exception';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { PlanRepository } from '../../../../plans/domain/repositories/plan.repository';
import { PublishPropertyCommand } from './publish-property.command';

@Injectable()
export class PublishPropertyUseCase implements UseCase<
  PublishPropertyCommand,
  Property
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(command: PublishPropertyCommand): Promise<Property> {
    await this.assertWithinActiveListingsLimit(command.adminId);

    const property = Property.publish({
      adminId: command.adminId,
      title: command.title,
      description: command.description,
      address: command.address,
      state: command.state,
      municipality: command.municipality,
      type: command.type,
      operationType: command.operationType,
      price: command.price,
      bedrooms: command.bedrooms,
      bathrooms: command.bathrooms,
      parkingSpaces: command.parkingSpaces,
      squareMeters: command.squareMeters,
      images: command.images,
      videos: command.videos,
      whatsapp: command.whatsapp,
      latitude: command.latitude,
      longitude: command.longitude,
    });

    await this.propertyRepository.save(property);
    return property;
  }

  private async assertWithinActiveListingsLimit(
    adminId: string,
  ): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin?.planId) return;

    const plan = await this.planRepository.findById(admin.planId);
    if (!plan) return;

    const activeCount =
      await this.propertyRepository.countActiveByAdminId(adminId);
    if (!plan.allowsAnotherActiveListing(activeCount)) {
      throw new ActiveListingsLimitExceededException(
        plan.name,
        plan.activeListingsLimit as number,
      );
    }
  }
}
