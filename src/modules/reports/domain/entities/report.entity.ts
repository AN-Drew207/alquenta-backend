import { randomUUID } from 'node:crypto';
import { ReportReason } from '../enums/report-reason.enum';
import { ReportStatus } from '../enums/report-status.enum';

export class Report {
  private constructor(
    private readonly _id: string,
    private readonly _propertyId: string,
    private readonly _reporterId: string,
    private readonly _reason: ReportReason,
    private readonly _details: string | null,
    private _status: ReportStatus,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    propertyId: string;
    reporterId: string;
    reason: ReportReason;
    details?: string | null;
  }): Report {
    return new Report(
      randomUUID(),
      params.propertyId,
      params.reporterId,
      params.reason,
      params.details ?? null,
      ReportStatus.PENDING,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    propertyId: string;
    reporterId: string;
    reason: ReportReason;
    details: string | null;
    status: ReportStatus;
    createdAt: Date;
  }): Report {
    return new Report(
      params.id,
      params.propertyId,
      params.reporterId,
      params.reason,
      params.details,
      params.status,
      params.createdAt,
    );
  }

  dismiss(): void {
    this._status = ReportStatus.DISMISSED;
  }

  get id(): string {
    return this._id;
  }

  get propertyId(): string {
    return this._propertyId;
  }

  get reporterId(): string {
    return this._reporterId;
  }

  get reason(): ReportReason {
    return this._reason;
  }

  get details(): string | null {
    return this._details;
  }

  get status(): ReportStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
