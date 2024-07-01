import { IsEmail, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MaxLength(6, { message: 'Password must no more then 6 symbols' })
  password: string;
}
