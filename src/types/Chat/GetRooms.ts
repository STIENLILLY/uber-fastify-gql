import { ObjectType, Field } from 'type-graphql';
import Chat from '../../entities/Chat';

@ObjectType()
export class GetRoomsResponse {
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => Chat, { nullable: 'items' })
    rooms?: Chat[];

    constructor(ok: boolean, chat: Chat[]) {
        this.ok = ok;
        this.rooms = chat;
    }
}
