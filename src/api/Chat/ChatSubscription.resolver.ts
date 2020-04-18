import { Subscription, Root, ObjectType, Field, Int, Arg } from 'type-graphql';

@ObjectType()
export class ChatMessage {
    @Field()
    message: string;

    @Field(() => Int)
    publisher: number;

    @Field(() => Int, { nullable: 'items' })
    participants: number[];
}

export class ChatSubscriptionResolver {
    @Subscription({
        topics: ({ args }) => `CHAT_ROOM:${args.chatId}`,
        filter: ({ payload, context }) => {
            const userId = context.payload.id;
            return payload.participants.includes(userId);
        },
    })
    subscriptionMessage(@Arg('chatId') chatId: number, @Root() root: ChatMessage): ChatMessage {
        return root;
    }
}
