import { ObjectType, Field, ArgsType, Float } from 'type-graphql';
import { IsLatitude, IsLongitude } from 'class-validator';

@ObjectType()
export class ReportMovementResponse {
    @Field(() => Boolean)
    ok: boolean;

    constructor(ok: boolean) {
        this.ok = ok;
    }
}

@ArgsType()
export class ReportMovementArgs {
    @Field(() => Float)
    @IsLatitude()
    lat: number;

    @Field(() => Float)
    @IsLongitude()
    lng: number;

    @Field(() => Float)
    orientation: number;
}
