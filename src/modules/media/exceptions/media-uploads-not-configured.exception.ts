import { DomainServiceUnavailableException } from '../../../shared/domain/exceptions/domain-service-unavailable.exception';

export class MediaUploadsNotConfiguredException extends DomainServiceUnavailableException {
  constructor() {
    super(
      'Media uploads are not configured yet (missing CLOUDINARY_* environment variables).',
    );
  }
}
