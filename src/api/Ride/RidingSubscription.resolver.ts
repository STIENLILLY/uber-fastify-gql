import { Subscription, Root, Arg, Int, ObjectType, Float, Field } from 'type-graphql';
import { getDistance } from 'geolib';
import { DRIVER_MODE, RideStatus } from '../../constants/ride';

@ObjectType()
export class RequestRide {
    @Field(() => Int)
    userId: number;

    @Field()
    pickUpAddress: string;

    @Field(() => Float)
    pickUpLat: number;

    @Field(() => Float)
    pickUpLng: number;

    @Field()
    dropOffAddress: string;

    @Field(() => Float)
    dropOffLat: number;

    @Field(() => Float)
    dropOffLng: number;

    @Field(() => Float)
    price: number;

    @Field()
    duration: string;

    @Field()
    distance: string;
}

@ObjectType()
export class RideStatusSubscription {
    @Field(() => RideStatus)
    status: RideStatus;

    @Field(() => Int)
    driverId: number;

    @Field(() => Int)
    passengerId: number;
}

export class RidingSubscriptionResolver {
    @Subscription({
        topics: ({ args }) => `RQ:${args.long}-${args.lat}`,
        filter: async ({ payload, context }) => {
            const userId = context.payload.id;
            const [geom] = await context.redis.send_command('GEOPOS', [DRIVER_MODE, userId]);
            return (
                getDistance(
                    {
                        latitude: payload.pickUpLat,
                        longitude: payload.pickUpLng,
                    },
                    {
                        latitude: geom[1],
                        longitude: geom[0],
                    }
                ) <= 8000
            );
        },
    })
    reportedNearByRiderLocation(@Arg('long') long: string, @Arg('lat') lat: string, @Root() root: RequestRide): RequestRide {
        return root;
    }

    @Subscription({
        topics: ({ args }) => `RideStatus:${args.rideId}`,
        filter: async ({ payload, context }) => {
            const userId = context.payload.id;
            return payload.driverId === userId || payload.passengerId === userId;
        },
    })
    rideStatusSubscription(@Arg('rideId') rideId: string, @Root() root: RideStatusSubscription): RideStatusSubscription {
        return root;
    }
}
