import { ObjectType, ArgsType, Field, Int } from 'type-graphql';
import { IsInt, MinLength } from 'class-validator';

@ObjectType()
export class UpdateProfileResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class UpdateProfileArgs {
    @Field({ nullable: true })
    @MinLength(8)
    currentPassword?: string;

    @Field({ nullable: true })
    @MinLength(8)
    password?: string;

    @Field({ nullable: true })
    firstName?: string;

    @Field({ nullable: true })
    lastName?: string;

    @Field(() => Int, { nullable: true })
    @IsInt()
    age?: number;

    @Field({ nullable: true })
    profilePhoto?: string;
}
