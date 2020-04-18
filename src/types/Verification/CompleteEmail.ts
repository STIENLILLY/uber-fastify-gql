import { ObjectType, ArgsType, Field } from 'type-graphql';
import { IsEmail } from 'class-validator';

@ObjectType()
export class CompleteEmailVerificationResponse {
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
export class CompleteEmailVerificationArgs {
    @Field()
    verificationCode: string;

    @Field()
    @IsEmail()
    email: string;
}
