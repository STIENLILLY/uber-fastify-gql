import { ArgsType, Field } from 'type-graphql';
import { IsPhoneNumber } from 'class-validator';

@ArgsType()
export class StartPhoneVerificationArgs {
    @Field()
    @IsPhoneNumber('ZZ')
    phoneNumber: string;
}
