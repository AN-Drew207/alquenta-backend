import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';

/**
 * Resolves the effective WhatsApp number for a property: the listing's own
 * override if set, otherwise the owning admin's profile number if they
 * opted to show it. Shared by the public property DTO (to decide whether to
 * offer a reveal button, without leaking the number itself) and the reveal
 * endpoint (to fetch the real value after the token checks out).
 */
@Injectable()
export class ResolvePropertyWhatsappUseCase
  implements UseCase<string, string | null>
{
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(propertyId: string): Promise<string | null> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) return null;
    if (property.whatsapp) return property.whatsapp;

    const admin = await this.userRepository.findById(property.adminId);
    return admin?.showWhatsapp ? admin.phone : null;
  }
}
