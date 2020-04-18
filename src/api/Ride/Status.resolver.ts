import { Resolver, UseMiddleware, Ctx, Args, Mutation, PubSub, PubSubEngine } from 'type-graphql';
import { getDistance } from 'geolib';
import { isAuthenticated } from '../../utils/authorization';
import { IContext } from '../../types/types';
import { RideStatus, DRIVER_MODE } from '../../constants/ride';
import { UpdateStatusResponse, UpdateStatusArgs } from '../../types/Ride/UpdateStatus';
import Ride from '../../entities/Ride';
import User from '../../entities/User';
import Chat from '../../entities/Chat';

@Resolver()
export class StatusResolver {
    @UseMiddleware(isAuthenticated)
    @Mutation(() => UpdateStatusResponse)
    async updateStatus(@PubSub() pubsub: PubSubEngine, @Args() { rideId, status }: UpdateStatusArgs, @Ctx() ctx: IContext): Promise<UpdateStatusResponse> {
        try {
            const userId = ctx.payload.id;
            const getCachedDriverMode = String(await ctx.redis.get(`STATUS:${userId}`));
            const userDriveMode: boolean =
                getCachedDriverMode !== 'null' ? (getCachedDriverMode === '0' ? false : true) : (await User.findOneOrFail({ select: ['isDriving'], where: { id: userId } })).isDriving;
            const rideEntity = await Ride.findOneOrFail({ id: rideId });

            if (userDriveMode && rideEntity.status === RideStatus.REQUESTING && status === RideStatus.ACCEPTED) {
                const [geom] = await ctx.redis.send_command('GEOPOS', [DRIVER_MODE, userId]);
                if (rideEntity && geom) {
                    if (getDistance({ longitude: rideEntity.pickUpgeom.coordinates[0], latitude: rideEntity.pickUpgeom.coordinates[1] }, { longitude: geom[0], latitude: geom[1] }) <= 12000) {
                        const driverEntity = User.create({ id: userId });
                        const passengerEntity = User.create({ id: rideEntity.passengerId });
                        const chatRoom = Chat.create({ participants: [driverEntity, passengerEntity] });

                        await Ride.update(rideId, { status: RideStatus.ACCEPTED, driverId: userId });
                        await pubsub.publish(`RideStatus:${rideId}`, { driverId: userId, status: RideStatus.ACCEPTED, passengerId: rideEntity.passengerId });
                        await chatRoom.save();
                        await ctx.redis.set(`RIDE:${userId}`, 1);
                        await ctx.redis.set(`RIDE:${rideEntity.passengerId}`, 1);
                        return new UpdateStatusResponse(true);
                    }
                }
            } else if ((rideEntity.status === RideStatus.REQUESTING || rideEntity.status === RideStatus.ACCEPTED) && status === RideStatus.CANCELED) {
                if (rideEntity.passengerId === userId || rideEntity.driverId === userId) {
                    await Ride.update(rideId, { status: RideStatus.CANCELED });
                    await pubsub.publish(`RideStatus:${rideId}`, { driverId: rideEntity.driverId, status: RideStatus.CANCELED, passengerId: rideEntity.passengerId });
                    await ctx.redis.del(`RIDE:${userId}`);
                    await ctx.redis.del(`RIDE:${rideEntity.passengerId}`);
                    return new UpdateStatusResponse(true);
                }
            } else if (rideEntity.status === RideStatus.ACCEPTED && status === RideStatus.ONROUTE) {
                if (rideEntity.driverId === userId) {
                    // distance comparison is needed but dont implement it -> driver<-> pickup<->passenger
                    await Ride.update(rideId, { status: RideStatus.ONROUTE });
                    await pubsub.publish(`RideStatus:${rideId}`, { driverId: userId, status: RideStatus.ONROUTE, passengerId: rideEntity.passengerId });
                    await ctx.redis.set(`RIDE:${userId}`, 1);
                    await ctx.redis.set(`RIDE:${rideEntity.passengerId}`, 1);
                    return new UpdateStatusResponse(true);
                }
            } else if (rideEntity.status === RideStatus.ONROUTE && status === RideStatus.FINISHED) {
                if (rideEntity.driverId === userId) {
                    // distance comparison is needed but dont implement it -> driver <->passenger =0 , driver<->endpoint=0
                    await Ride.update(rideId, { status: RideStatus.FINISHED });
                    await pubsub.publish(`RideStatus:${rideId}`, { driverId: userId, status: RideStatus.FINISHED, passengerId: rideEntity.passengerId });
                    await ctx.redis.del(`RIDE:${userId}`);
                    await ctx.redis.del(`RIDE:${rideEntity.passengerId}`);
                    return new UpdateStatusResponse(true);
                }
            }
            return new UpdateStatusResponse(false);
        } catch (error) {
            console.error(error);
            return new UpdateStatusResponse(false);
        }
    }
}
