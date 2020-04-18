import { ObjectType, Field, Int, Float } from 'type-graphql';

@ObjectType()
export class DriversNearByResult {
    @Field(() => Int)
    userId: number;

    @Field(() => Float)
    latitude: number;

    @Field(() => Float)
    longitude: number;

    @Field(() => Float)
    orientation: number;

    @Field(() => Float)
    distance: number;
}

@ObjectType()
export class GetNearByDriversResponse {
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => [DriversNearByResult], { nullable: 'itemsAndList' })
    result: DriversNearByResult[];

    constructor(ok: boolean, result: DriversNearByResult[]) {
        this.ok = ok;
        this.result = result;
    }
}
