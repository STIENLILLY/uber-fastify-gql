import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class ToggleDrivingModeResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}
