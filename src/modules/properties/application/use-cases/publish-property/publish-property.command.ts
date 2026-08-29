import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';
import { Role } from '../../../../../shared/domain/role.enum';

export class PublishPropertyCommand {
  constructor(
    readonly userId: string,
    readonly role: Role,
    readonly title: string,
    readonly description: string,
    readonly address: string,
    readonly state: string,
    readonly municipality: string,
    readonly type: PropertyType,
    readonly operationType: OperationType,
    readonly price: number,
    readonly bedrooms?: number,
    readonly bathrooms?: number,
    readonly parkingSpaces?: number,
    readonly squareMeters?: number,
    readonly images?: string[],
    readonly videos?: string[],
    readonly whatsapp?: string,
    readonly latitude?: number,
    readonly longitude?: number,
    readonly agentId?: string | null,
  ) {}
}
