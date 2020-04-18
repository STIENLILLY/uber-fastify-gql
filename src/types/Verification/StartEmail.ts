import { ArgsType, Field } from 'type-graphql';
import { IsEmail } from 'class-validator';

@ArgsType()
export class StartEmailVerificationArgs {
    @Field()
    @IsEmail()
    email: string;
}
