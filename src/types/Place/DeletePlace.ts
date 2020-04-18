import { ObjectType, Field, ArgsType, Int } from 'type-graphql';

@ObjectType()
export class DeletePlaceResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class DeletePlaceArgs {
    @Field(() => Int)
    placeId!: number;
}
