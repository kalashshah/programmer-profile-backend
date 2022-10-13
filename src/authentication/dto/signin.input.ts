import { Field } from '@nestjs/graphql';
import { MinLength, IsEmail } from 'class-validator';

export class SigninInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}
