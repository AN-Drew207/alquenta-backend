import { randomUUID } from 'node:crypto';
import { PropertyType } from '../enums/property-type.enum';
import { OperationType } from '../enums/operation-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { InvalidPriceException } from '../exceptions/invalid-price.exception';

export interface PropertyChanges {
  title?: string;
  description?: string;
  address?: string;
  state?: string;
  municipality?: string;
  type?: PropertyType;
  operationType?: OperationType;
  price?: number;
  status?: PropertyStatus;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  squareMeters?: number | null;
  images?: string[];
  videos?: string[];
  whatsapp?: string | null;
}

export class Property {
  private constructor(
    private readonly _id: string,
    private readonly _adminId: string,
    private _title: string,
    private _description: string,
    private _address: string,
    private _state: string,
    private _municipality: string,
    private _type: PropertyType,
    private _operationType: OperationType,
    private _price: number,
    private _status: PropertyStatus,
    private _bedrooms: number | null,
    private _bathrooms: number | null,
    private _parkingSpaces: number | null,
    private _squareMeters: number | null,
    private _images: string[],
    private _videos: string[],
    private _whatsapp: string | null,
    private readonly _createdAt: Date,
  ) {}

  static publish(params: {
    adminId: string;
    title: string;
    description: string;
    address: string;
    state: string;
    municipality: string;
    type: PropertyType;
    operationType: OperationType;
    price: number;
    bedrooms?: number | null;
    bathrooms?: number | null;
    parkingSpaces?: number | null;
    squareMeters?: number | null;
    images?: string[];
    videos?: string[];
    whatsapp?: string | null;
  }): Property {
    if (params.price <= 0) {
      throw new InvalidPriceException();
    }
    return new Property(
      randomUUID(),
      params.adminId,
      params.title,
      params.description,
      params.address,
      params.state,
      params.municipality,
      params.type,
      params.operationType,
      params.price,
      PropertyStatus.AVAILABLE,
      params.bedrooms ?? null,
      params.bathrooms ?? null,
      params.parkingSpaces ?? null,
      params.squareMeters ?? null,
      params.images ?? [],
      params.videos ?? [],
      params.whatsapp ?? null,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    adminId: string;
    title: string;
    description: string;
    address: string;
    state: string;
    municipality: string;
    type: PropertyType;
    operationType: OperationType;
    price: number;
    status: PropertyStatus;
    bedrooms: number | null;
    bathrooms: number | null;
    parkingSpaces: number | null;
    squareMeters: number | null;
    images: string[];
    videos: string[];
    whatsapp: string | null;
    createdAt: Date;
  }): Property {
    return new Property(
      params.id,
      params.adminId,
      params.title,
      params.description,
      params.address,
      params.state,
      params.municipality,
      params.type,
      params.operationType,
      params.price,
      params.status,
      params.bedrooms,
      params.bathrooms,
      params.parkingSpaces,
      params.squareMeters,
      params.images,
      params.videos,
      params.whatsapp,
      params.createdAt,
    );
  }

  belongsTo(adminId: string): boolean {
    return this._adminId === adminId;
  }

  updateDetails(changes: PropertyChanges): void {
    if (changes.price !== undefined) {
      if (changes.price <= 0) {
        throw new InvalidPriceException();
      }
      this._price = changes.price;
    }
    if (changes.title !== undefined) this._title = changes.title;
    if (changes.description !== undefined) this._description = changes.description;
    if (changes.address !== undefined) this._address = changes.address;
    if (changes.state !== undefined) this._state = changes.state;
    if (changes.municipality !== undefined) this._municipality = changes.municipality;
    if (changes.type !== undefined) this._type = changes.type;
    if (changes.operationType !== undefined) this._operationType = changes.operationType;
    if (changes.status !== undefined) this._status = changes.status;
    if (changes.bedrooms !== undefined) this._bedrooms = changes.bedrooms;
    if (changes.bathrooms !== undefined) this._bathrooms = changes.bathrooms;
    if (changes.parkingSpaces !== undefined) this._parkingSpaces = changes.parkingSpaces;
    if (changes.squareMeters !== undefined) this._squareMeters = changes.squareMeters;
    if (changes.images !== undefined) this._images = changes.images;
    if (changes.videos !== undefined) this._videos = changes.videos;
    if (changes.whatsapp !== undefined) this._whatsapp = changes.whatsapp;
  }

  get id(): string {
    return this._id;
  }

  get adminId(): string {
    return this._adminId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get address(): string {
    return this._address;
  }

  get state(): string {
    return this._state;
  }

  get municipality(): string {
    return this._municipality;
  }

  get type(): PropertyType {
    return this._type;
  }

  get operationType(): OperationType {
    return this._operationType;
  }

  get price(): number {
    return this._price;
  }

  get status(): PropertyStatus {
    return this._status;
  }

  get bedrooms(): number | null {
    return this._bedrooms;
  }

  get bathrooms(): number | null {
    return this._bathrooms;
  }

  get parkingSpaces(): number | null {
    return this._parkingSpaces;
  }

  get squareMeters(): number | null {
    return this._squareMeters;
  }

  get images(): string[] {
    return this._images;
  }

  get videos(): string[] {
    return this._videos;
  }

  get whatsapp(): string | null {
    return this._whatsapp;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
