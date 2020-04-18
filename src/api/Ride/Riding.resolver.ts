import { Resolver, UseMiddleware, Ctx, Args, Mutation, Query, PubSub, PubSubEngine } from 'type-graphql';
import { isAuthenticated } from '../../utils/authorization';
import { IContext } from '../../types/types';
import Ride from '../../entities/Ride';
import { RequestRideArgs, RequestRideResponse } from '../../types/Ride/RequestRide';
import User from '../../entities/User';
import { RideStatus, DRIVER_MODE } from '../../constants/ride';
import { GetNearByRidersResponse } from '../../types/Ride/GetNearByRiders';
import { getConnection } from 'typeorm';

@Resolver()
export class RidingResolver {
    @UseMiddleware(isAuthenticated)
    @Mutation(() => RequestRideResponse)
    async requestRide(@PubSub() pubsub: PubSubEngine, @Args() { pickUpLng, pickUpLat, dropOffLng, dropOffLat, ...args }: RequestRideArgs, @Ctx() ctx: IContext): Promise<RequestRideResponse> {
        const userId = ctx.payload.id;
        const getCachedDriverMode = String(await ctx.redis.get(`STATUS:${userId}`));
        const userDriveMode: boolean =
            getCachedDriverMode !== 'null' ? (getCachedDriverMode === '0' ? false : true) : (await User.findOneOrFail({ select: ['isDriving'], where: { id: userId } })).isDriving;

        if (!userDriveMode) {
            const getCachedRidingMode = String(await ctx.redis.get(`RIDE:${userId}`));
            if (getCachedRidingMode === '1') {
                return new RequestRideResponse(false);
            } else if (getCachedRidingMode === 'null') {
                const [exist] = await Ride.createQueryBuilder()
                    .select('1', 'exist')
                    .where('(Ride.passengerId = :userId OR Ride.driverId = :userId)', { userId })
                    .andWhere('(Ride.status IN (:...status))', {
                        status: [RideStatus.ACCEPTED, RideStatus.ONROUTE, RideStatus.REQUESTING],
                    })
                    .limit(1)
                    .execute();
                if (exist) {
                    await ctx.redis.set(`RIDE:${userId}`, 1);
                    return new RequestRideResponse(false);
                }
            }

            const pickUpgeom = {
                type: 'Point',
                coordinates: [pickUpLng, pickUpLat],
            };
            const dropOffgeom = {
                type: 'Point',
                coordinates: [dropOffLng, dropOffLat],
            };
            await ctx.redis.set(`RIDE:${userId}`, 1);

            for (const x of [-0.1, 0, 0.1]) {
                for (const y of [-0.1, 0, 0.1]) {
                    await pubsub.publish(`RQ:${Number(Number(pickUpLng.toFixed(1)) + x).toFixed(1)}-${Number(Number(pickUpLat.toFixed(1)) + y).toFixed(1)}`, {
                        pickUpLng,
                        pickUpLat,
                        dropOffLng,
                        dropOffLat,
                        userId,
                        ...args,
                    });
                }
            }
            await Ride.create({ ...args, passengerId: ctx.payload.id, pickUpgeom, dropOffgeom }).save();
            return new RequestRideResponse(true);
        }
        return new RequestRideResponse(false);
    }

    @UseMiddleware(isAuthenticated)
    @Query(() => GetNearByRidersResponse)
    async getNearByRiders(@Ctx() ctx: IContext): Promise<GetNearByRidersResponse> {
        const ownUserId = ctx.payload.id;
        const [geom] = await ctx.redis.send_command('GEOPOS', [DRIVER_MODE, ownUserId]);
        if (geom) {
            const origin = {
                type: 'Point',
                coordinates: geom,
            };

            const locationOfRiders = await getConnection()
                .createQueryBuilder()
                .select('passenger.id', 'passengerId')
                .addSelect(['"passenger"."firstName"', '"passenger"."lastName"', '"passenger"."profilePhoto"'])
                .addSelect('ST_X("lcs"."pickUpgeom")', 'pickUplongitude')
                .addSelect('ST_Y("lcs"."pickUpgeom")', 'pickUplatitude')
                .addSelect('ST_X("lcs"."dropOffgeom")', 'dropOfflongitude')
                .addSelect('ST_Y("lcs"."dropOffgeom")', 'dropOfflatitude')
                .addSelect(['"lcs"."status"', '"lcs"."duration"', '"lcs"."distance"', '"lcs"."pickUpAddress"', '"lcs"."dropOffAddress"', '"lcs"."price"'])
                .from(subQuery => {
                    return subQuery
                        .from(Ride, 'Ride')
                        .where('ST_DWithin("Ride"."pickUpgeom", ST_GeomFromGeoJSON(:origin),8000) AND "Ride"."status" = :status')
                        .orderBy('"Ride"."pickUpgeom"<->ST_GeomFromGeoJSON(:origin)::geometry', 'ASC')
                        .setParameters({ origin: JSON.stringify(origin), status: RideStatus.REQUESTING });
                }, 'lcs')
                .leftJoin(User, 'passenger', 'passenger.id = "lcs"."passengerId"')
                .execute();

            return new GetNearByRidersResponse(true, locationOfRiders);
        } else {
            return new GetNearByRidersResponse(false, []);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Query(() => Ride, { nullable: true })
    async getRide(@Ctx() ctx: IContext): Promise<Ride | null> {
        try {
            const userId = ctx.payload.id;
            const rideEntity = await Ride.createQueryBuilder('ride')
                .leftJoinAndSelect('ride.passenger', 'passenger')
                .leftJoinAndSelect('ride.driver', 'driver') //performance ?
                .where('(passenger.id = :userId OR driver.id = :userId) AND Ride.status IN(:...status)', { userId, status: [RideStatus.ACCEPTED, RideStatus.REQUESTING] })
                .getOne();

            return rideEntity ? rideEntity : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
