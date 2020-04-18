import { ObjectType, ArgsType, Field, Int } from 'type-graphql';
import { IsInt, MinLength } from 'class-validator';

@ObjectType()
export class ProfileSignResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class ProfileSignArgs {
    @Field()
    @MinLength(8)
    password: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field(() => Int, { nullable: true })
    @IsInt()
    age?: number;

    @Field({ nullable: true })
    profilePhoto?: string;
}
