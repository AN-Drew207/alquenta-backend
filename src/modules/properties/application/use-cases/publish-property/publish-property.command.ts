import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';

export class PublishPropertyCommand {
  constructor(
    readonly adminId: string,
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
  ) {}
}
