import { ObjectType, ArgsType, Field } from 'type-graphql';
import { MinLength, IsPhoneNumber } from 'class-validator';

@ObjectType()
export class PhoneSignInResponse {
    @Field(() => Boolean)
    ok: boolean;

    @Field()
    token: string;
    constructor(ok: boolean, token: string) {
        this.ok = ok;
        this.token = token;
    }
}

@ArgsType()
export class PhoneSignInArgs {
    @Field()
    @IsPhoneNumber('ZZ')
    phoneNumber: string;

    @Field()
    @MinLength(8)
    password: string;
}
