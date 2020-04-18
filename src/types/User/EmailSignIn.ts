import { ObjectType, ArgsType, Field } from 'type-graphql';
import { IsEmail, MinLength } from 'class-validator';

@ObjectType()
export class EmailSignInResponse {
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
export class EmailSignInArgs {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @MinLength(8)
    password: string;
}
