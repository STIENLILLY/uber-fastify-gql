import { ObjectType, Field, ArgsType, Int } from 'type-graphql';

@ObjectType()
export class SendMessageResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class SendMessageArgs {
    @Field(() => Int)
    chatId: number;

    @Field()
    message: string;
}
