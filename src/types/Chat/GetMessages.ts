import { ObjectType, Field } from 'type-graphql';
import Message from '../../entities/Message';

@ObjectType()
export class GetMessagesResponse {
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => Message, { nullable: 'items' })
    messages?: Message[];

    constructor(ok: boolean, messages: Message[]) {
        this.ok = ok;
        this.messages = messages;
    }
}
