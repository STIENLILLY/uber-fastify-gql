import { ObjectType, ArgsType, Field } from 'type-graphql';
import { IsEmail } from 'class-validator';

@ObjectType()
export class FacebookConnectResponse {
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
export class FacebookConnectArgs {
    @Field(() => String, { nullable: true })
    firstName?: string;

    @Field(() => String, { nullable: true })
    lastName?: string;

    @Field(() => String, { nullable: true })
    @IsEmail()
    email?: string;

    @Field()
    facebookId: string;
}
