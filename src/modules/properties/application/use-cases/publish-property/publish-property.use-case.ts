import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { ActiveListingsLimitExceededException } from '../../../domain/exceptions/active-listings-limit-exceeded.exception';
import { AgentNotInAgencyException } from '../../../domain/exceptions/agent-not-in-agency.exception';
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
    const { adminId, agentId } = await this.resolveOwnership(command);

    await this.assertWithinActiveListingsLimit(adminId);

    const property = Property.publish({
      adminId,
      agentId,
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

  /**
   * Resolves the real ownership pair (adminId, agentId) for a new listing:
   * - AGENT: the listing is attributed to their parent agency's admin, but
   *   tagged with the agent as the manager.
   * - ADMIN publishing on behalf of one of their agents (agentId in the
   *   command): validated to actually belong to their agency.
   * - ADMIN publishing directly: no agent attribution.
   */
  private async resolveOwnership(
    command: PublishPropertyCommand,
  ): Promise<{ adminId: string; agentId: string | null }> {
    if (command.role === Role.AGENT) {
      const agent = await this.userRepository.findById(command.userId);
      if (!agent || !agent.parentAdminId) {
        throw new EntityNotFoundException('Admin', command.userId);
      }
      return { adminId: agent.parentAdminId, agentId: agent.id };
    }

    if (command.agentId) {
      const agent = await this.userRepository.findById(command.agentId);
      if (
        !agent ||
        agent.role !== Role.AGENT ||
        agent.parentAdminId !== command.userId
      ) {
        throw new AgentNotInAgencyException(command.agentId);
      }
      return { adminId: command.userId, agentId: agent.id };
    }

    return { adminId: command.userId, agentId: null };
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
