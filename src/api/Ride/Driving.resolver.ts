import { Resolver, Mutation, UseMiddleware, Ctx, Args, Query, PubSub, PubSubEngine } from 'type-graphql';
import User from '../../entities/User';
import { isAuthenticated } from '../../utils/authorization';
import { IContext } from '../../types/types';
import { ToggleDrivingModeResponse } from '../../types/Ride/ToggleDrivingMode';
import { ReportMovementResponse, ReportMovementArgs } from '../../types/Ride/ReportMovement';
import Location from '../../entities/Location';
import { GetNearByDriversResponse } from '../../types/Ride/GetNearByDrivers';
import { getConnection } from 'typeorm';
import { DRIVER_MODE, PASSENGER_MODE, DriverRider } from '../../constants/ride';

@Resolver()
export class DrivingResolver {
    @UseMiddleware(isAuthenticated)
    @Mutation(() => ToggleDrivingModeResponse)
    async toggleDrivingMode(@Ctx() ctx: IContext): Promise<ToggleDrivingModeResponse> {
        try {
            const userId = ctx.payload.id;
            const getCachedDriverMode = String(await ctx.redis.get(`STATUS:${userId}`));
            const userDriveMode: boolean =
                getCachedDriverMode !== 'null' ? (getCachedDriverMode === '0' ? false : true) : (await User.findOneOrFail({ select: ['isDriving'], where: { id: userId } })).isDriving;
            await User.update(userId, { isDriving: !userDriveMode });
            await ctx.redis.set(`STATUS:${userId}`, userDriveMode ? DriverRider.PASSENGER : DriverRider.DRIVER);
            await ctx.redis.zrem(userDriveMode ? DRIVER_MODE : PASSENGER_MODE, userId);

            return new ToggleDrivingModeResponse(true);
        } catch (error) {
            console.error(error);
            return new ToggleDrivingModeResponse(false);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => ReportMovementResponse)
    async reportMovement(@PubSub() pubsub: PubSubEngine, @Args() { lat, lng, orientation }: ReportMovementArgs, @Ctx() ctx: IContext): Promise<ReportMovementResponse> {
        try {
            const userId = ctx.payload.id;
            const geom = {
                type: 'Point',
                coordinates: [lng, lat],
            };

            await Location.create({ userId, geom, orientation }).save();

            const getCachedDriverMode = String(await ctx.redis.get(`STATUS:${userId}`));
            const userDriveMode: boolean =
                getCachedDriverMode !== 'null' ? (getCachedDriverMode === '0' ? false : true) : (await User.findOneOrFail({ select: ['isDriving'], where: { id: userId } })).isDriving;

            if (userDriveMode) {
                await ctx.redis.send_command('GEOADD', [DRIVER_MODE, lng, lat, userId]);
                for (const x of [-0.1, 0, 0.1]) {
                    for (const y of [-0.1, 0, 0.1]) {
                        await pubsub.publish(`LOCATION:${Number(Number(lng.toFixed(1)) + x).toFixed(1)}-${Number(Number(lat.toFixed(1)) + y).toFixed(1)}`, { lng, lat, orientation, userId });
                    }
                }
            } else {
                await ctx.redis.send_command('GEOADD', [PASSENGER_MODE, lng, lat, userId]);
            }
            return new ReportMovementResponse(true);
        } catch (error) {
            console.error(error);
            return new ReportMovementResponse(false);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Query(() => GetNearByDriversResponse)
    async getNearByDrivers(@Ctx() ctx: IContext): Promise<GetNearByDriversResponse> {
        const ownUserId = ctx.payload.id;
        const [geom] = await ctx.redis.send_command('GEOPOS', [PASSENGER_MODE, ownUserId]);
        if (geom) {
            const origin = {
                type: 'Point',
                coordinates: geom,
            };
            const locationOfDrivers = await getConnection()
                .createQueryBuilder()
                .select('user.id', 'userId')
                .addSelect('ST_X(lcs.geom)', 'longitude')
                .addSelect('ST_Y(lcs.geom)', 'latitude')
                .addSelect('lcs.orientation', 'orientation')
                .addSelect('"lcs"."geom"<->ST_GeomFromGeoJSON(:origin)::geometry', 'distance')
                .from(subQuery => {
                    return subQuery
                        .select('DISTINCT ON (location.userId) *')
                        .from(Location, 'location')
                        .where('ST_DWithin(geom, ST_GeomFromGeoJSON(:origin)::geometry,8000)')
                        .andWhere("location.createAt >= CURRENT_TIMESTAMP(0) - interval '1 hour'")
                        .orderBy('location.userId', 'DESC')
                        .addOrderBy('location.createAt', 'DESC')
                        .addOrderBy('"location"."geom"<->ST_GeomFromGeoJSON(:origin)::geometry', 'ASC')
                        .setParameters({ origin: JSON.stringify(origin) });
                }, 'lcs')
                .innerJoin(User, 'user', 'user.id = "lcs"."userId"')
                .where('user.isDriving = :isDriving', { isDriving: true })
                .execute();

            return new GetNearByDriversResponse(true, locationOfDrivers);
        }
        return new GetNearByDriversResponse(false, []);
    }
}
