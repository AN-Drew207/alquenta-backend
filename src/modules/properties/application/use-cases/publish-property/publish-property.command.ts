import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';

export class PublishPropertyCommand {
  constructor(
    readonly adminId: string,
    readonly title: string,
    readonly description: string,
    readonly address: string,
    readonly city: string,
    readonly type: PropertyType,
    readonly operationType: OperationType,
    readonly price: number,
    readonly bedrooms?: number,
    readonly bathrooms?: number,
    readonly squareMeters?: number,
    readonly images?: string[],
  ) {}
}
