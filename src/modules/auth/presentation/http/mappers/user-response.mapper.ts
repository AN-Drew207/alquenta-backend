import { User } from '../../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { PublicProfileResponseDto } from '../dto/public-profile-response.dto';

export class UserResponseMapper {
  static toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      showPhoneOnListings: user.showPhoneOnListings,
    };
  }

  static toPublicDto(user: User): PublicProfileResponseDto {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
    };
  }
}
