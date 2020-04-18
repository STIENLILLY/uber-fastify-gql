import { ObjectType, Field, ArgsType, Int } from 'type-graphql';

@ObjectType()
export class EditPlaceResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class EditPlaceArgs {
    @Field()
    name: string;

    @Field(() => Boolean)
    isFavorite: boolean;

    @Field(() => Int)
    placeId!: number;
}
