import { ObjectType, Field, Float, ID } from 'type-graphql';
import { RideStatus } from '../../constants/ride';

@ObjectType()
export class RidersNearByResult {
    @Field(() => RideStatus)
    status: RideStatus;

    @Field()
    duration: string;

    @Field()
    distance: string;

    @Field()
    pickUpAddress: string;

    @Field(() => Float)
    pickUplongitude: number;

    @Field(() => Float)
    pickUplatitude: number;

    @Field()
    dropOffAddress: string;

    @Field(() => Float)
    dropOfflongitude: number;

    @Field(() => Float)
    dropOfflatitude: number;

    @Field(() => Float)
    price: number;

    @Field(() => ID)
    passengerId: number;

    @Field()
    profilePhoto: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field(() => String)
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}

@ObjectType()
export class GetNearByRidersResponse {
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => [RidersNearByResult], { nullable: 'itemsAndList' })
    result: RidersNearByResult[];

    constructor(ok: boolean, result: RidersNearByResult[]) {
        this.ok = ok;
        this.result = result;
    }
}
