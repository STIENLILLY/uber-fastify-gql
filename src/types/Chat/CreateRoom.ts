import { ObjectType, Field, ArgsType, Int } from 'type-graphql';
import Chat from '../../entities/Chat';

@ObjectType()
export class CreateRoomResponse {
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => Chat, { nullable: true })
    chatRoom?: Chat | null;

    constructor(ok: boolean, chat: Chat | null) {
        this.ok = ok;
        this.chatRoom = chat;
    }
}

@ArgsType()
export class CreateRoomArgs {
    @Field(() => Int)
    rideId: number;
}
