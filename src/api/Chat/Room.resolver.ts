import { Resolver, UseMiddleware, Mutation, Args, Ctx, Query } from 'type-graphql';
import { isAuthenticated } from '../../utils/authorization';
import { CreateRoomResponse, CreateRoomArgs } from '../..//types/Chat/CreateRoom';
import { IContext } from '../../types/types';
import Ride from '../../entities/Ride';
import Chat from '../../entities/Chat';
import User from '../../entities/User';
import { RideStatus } from '../../constants/ride';
import { GetRoomsResponse } from '../../types/Chat/GetRooms';

@Resolver()
export class RoomResovler {
    @UseMiddleware(isAuthenticated)
    @Mutation(() => CreateRoomResponse)
    async createRoom(@Args() { rideId }: CreateRoomArgs, @Ctx() ctx: IContext): Promise<CreateRoomResponse> {
        try {
            const userId = ctx.payload.id;
            const rideEntity = await Ride.findOneOrFail({ select: ['passengerId', 'driverId'], where: { id: rideId, status: RideStatus.ACCEPTED } });
            if (rideEntity.driverId === userId || rideEntity.passengerId === userId) {
                const driverEntity = User.create({ id: rideEntity.driverId });
                const passengerEntity = User.create({ id: rideEntity.passengerId });
                const chatRoom = Chat.create({ participants: [driverEntity, passengerEntity] });
                await chatRoom.save();
                return new CreateRoomResponse(true, chatRoom);
            } else {
                return new CreateRoomResponse(false, null);
            }
        } catch (error) {
            console.error(error);
            return new CreateRoomResponse(false, null);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Query(() => GetRoomsResponse)
    async getRooms(@Ctx() ctx: IContext): Promise<GetRoomsResponse> {
        try {
            const userId = ctx.payload.id;
            const roomEntities = await Chat.createQueryBuilder('chat').leftJoinAndSelect('chat.participants', 'user').where('user.id = :userId', { userId }).getMany();

            return new GetRoomsResponse(true, roomEntities);
        } catch (error) {
            console.error(error);
            return new GetRoomsResponse(false, []);
        }
    }
}
