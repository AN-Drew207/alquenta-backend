import { DomainNotFoundException } from './domain-not-found.exception';

export class EntityNotFoundException extends DomainNotFoundException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id "${id}" was not found`);
  }
}
