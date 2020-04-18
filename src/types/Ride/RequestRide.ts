import { ArgsType, Float, Field, ObjectType } from 'type-graphql';
import { IsLatitude, IsLongitude } from 'class-validator';

@ObjectType()
export class RequestRideResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class RequestRideArgs {
    @Field()
    pickUpAddress: string;

    @Field(() => Float)
    @IsLatitude()
    pickUpLat: number;

    @Field(() => Float)
    @IsLongitude()
    pickUpLng: number;

    @Field()
    dropOffAddress: string;

    @Field(() => Float)
    @IsLatitude()
    dropOffLat: number;

    @Field(() => Float)
    @IsLongitude()
    dropOffLng: number;

    @Field(() => Float)
    price: number;

    @Field()
    duration: string;

    @Field()
    distance: string;
}
