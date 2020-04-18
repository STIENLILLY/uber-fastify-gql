import { ObjectType, Field, ArgsType, Int } from 'type-graphql';
import { RideStatus } from '../../constants/ride';

@ArgsType()
export class UpdateStatusArgs {
    @Field(() => RideStatus)
    status: RideStatus;

    @Field(() => Int)
    rideId: number;
}

@ObjectType()
export class UpdateStatusResponse {
    @Field(() => Boolean)
    ok: boolean;
    
    constructor(ok: boolean) {
        this.ok = ok;
    }
}
