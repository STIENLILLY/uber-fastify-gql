import { ObjectType, Field, ArgsType, Float } from 'type-graphql';
import { IsLatitude, IsLongitude } from 'class-validator';

@ObjectType()
export class AddPlaceResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class AddPlaceArgs {
    @Field()
    name: string;

    @Field(() => Float)
    @IsLatitude()
    latitude: number;

    @Field(() => Float)
    @IsLongitude()
    longitude: number;

    @Field(() => Float)
    orientation: number;

    @Field()
    address: string;

    @Field(() => Boolean)
    isFavorite: boolean;
}
