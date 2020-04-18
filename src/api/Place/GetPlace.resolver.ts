import { Resolver, Query, UseMiddleware, Ctx } from 'type-graphql';
import { isAuthenticated } from '../../utils/authorization';
import { IContext } from '../../types/types';
import Place from '../../entities/Place';

@Resolver()
export class GetPlaceResolver {
    @UseMiddleware(isAuthenticated)
    @Query(() => [Place])
    async getMyPlaces(@Ctx() ctx: IContext): Promise<Place[]> {
        return await Place.createQueryBuilder().where('Place.userId = :userId', { userId: ctx.payload.id }).getMany();
    }
}
