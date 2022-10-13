import { Field } from '@nestjs/graphql';
import { MinLength, IsEmail } from 'class-validator';

export class SignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  name: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  @MinLength(6)
  confirmPassword: string;
}
