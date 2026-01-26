import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'alice.admin@abctuition.com',
    description: 'User email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Str0ngP@ssword!',
    minLength: 8,
    description: 'User password',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'abc-tuition',
    description: 'Organization slug to establish tenant context',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'organizationSlug must contain only lowercase letters, numbers, and hyphens',
  })
  organizationSlug: string;
}
