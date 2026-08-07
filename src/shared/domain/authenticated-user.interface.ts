import { Role } from './role.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}
