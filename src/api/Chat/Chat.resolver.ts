import { Resolver, UseMiddleware, Mutation, Args, Ctx, PubSub, PubSubEngine, Query, Arg } from 'type-graphql';
import { isAuthenticated } from '../../utils/authorization';
import { SendMessageResponse, SendMessageArgs } from '../../types/Chat/SendMessage';
import { IContext } from '../../types/types';
import Chat from '../../entities/Chat';
import Message from '../../entities/Message';
import { GetMessagesResponse } from '../../types/Chat/GetMessages';

@Resolver()
export class ChatResolver {
    @UseMiddleware(isAuthenticated)
    @Mutation(() => SendMessageResponse)
    async sendMessage(@PubSub() pubsub: PubSubEngine, @Args() { message, chatId }: SendMessageArgs, @Ctx() ctx: IContext): Promise<SendMessageResponse> {
        try {
            const userId = ctx.payload.id;
            const roomEntity = await Chat.createQueryBuilder('chat').leftJoinAndSelect('chat.participants', 'user').where('chat.id = :chatId', { chatId }).getOne();
            if (roomEntity) {
                const participants = roomEntity.participants.map(participant => participant.id);
                if (participants.includes(userId)) {
                    await Message.create({ text: message, userId, chat: roomEntity }).save();
                    await pubsub.publish(`CHAT_ROOM:${chatId}`, { message, publisher: userId, participants });
                    return new SendMessageResponse(true);
                } else {
                    return new SendMessageResponse(false);
                }
            } else {
                return new SendMessageResponse(false);
            }
        } catch (error) {
            console.error(error);
            return new SendMessageResponse(false);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Query(() => GetMessagesResponse)
    async getMessages(@Arg('chatId') chatId: number, @Ctx() ctx: IContext): Promise<GetMessagesResponse> {
        try {
            const userId = ctx.payload.id;
            const isExist = await Chat.createQueryBuilder('chat')
                .select('chat.id')
                .leftJoinAndSelect('chat.participants', 'user')
                .where('chat.id = :chatId AND user.id = :userId', { chatId, userId })
                .getOne();
            return isExist?.hasId() ? new GetMessagesResponse(true, await Message.find({ chatId })) : new GetMessagesResponse(false, []);
        } catch (error) {
            console.log(error);
            return new GetMessagesResponse(false, []);
        }
    }
}
