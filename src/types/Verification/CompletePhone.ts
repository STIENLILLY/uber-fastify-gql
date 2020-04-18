import { ObjectType, ArgsType, Field } from 'type-graphql';

@ObjectType()
export class CompletePhoneVerificationResponse {
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
export class CompletePhoneVerificationArgs {
    @Field()
    verificationCode: string;

    @Field()
    phoneNumber: string;
}
