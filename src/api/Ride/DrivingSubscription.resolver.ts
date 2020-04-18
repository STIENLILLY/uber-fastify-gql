import { Subscription, Root, ObjectType, Field, Float, Int, Arg } from 'type-graphql';
import { getDistance } from 'geolib';
import { PASSENGER_MODE } from '../../constants/ride';

@ObjectType()
export class DriverLocation {
    @Field(() => Float)
    lng: number;

    @Field(() => Float)
    lat: number;

    @Field(() => Float)
    orientation: number;

    @Field(() => Int)
    userId: number;
}

export class DrivingSubscriptionResolver {
    @Subscription({
        topics: ({ args }) => `LOCATION:${args.long}-${args.lat}`,
        filter: async ({ payload, context }) => {
            const userId = context.payload.id;
            const [geom] = await context.redis.send_command('GEOPOS', [PASSENGER_MODE, userId]);
            return (
                getDistance(
                    {
                        latitude: payload.lat,
                        longitude: payload.lng,
                    },
                    {
                        latitude: geom[1],
                        longitude: geom[0],
                    }
                ) <= 8000
            );
        },
    })
    reportedNearByDriverLocation(@Arg('long') long: string, @Arg('lat') lat: string, @Root() root: DriverLocation): DriverLocation {
        return root;
    }
}
