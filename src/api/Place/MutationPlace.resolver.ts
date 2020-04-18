import { Resolver, Mutation, UseMiddleware, Ctx, Args } from 'type-graphql';
import User from '../../entities/User';
import { isAuthenticated } from '../../utils/authorization';
import { IContext } from '../../types/types';
import Place from '../../entities/Place';
import { AddPlaceResponse, AddPlaceArgs } from '../../types/Place/AddPlace';
import { EditPlaceResponse, EditPlaceArgs } from '../../types/Place/EditPlace';
import { DeletePlaceResponse, DeletePlaceArgs } from '../../types/Place/DeletePlace';

@Resolver()
export class MutationPlaceResolver {
    @UseMiddleware(isAuthenticated)
    @Mutation(() => AddPlaceResponse)
    async addPlace(@Args() args: AddPlaceArgs, @Ctx() ctx: IContext): Promise<AddPlaceResponse> {
        try {
            const user = User.create({ id: ctx.payload.id });
            const newPlace = Place.create({ ...args, user });

            await Place.insert(newPlace);
            return new AddPlaceResponse(true);
        } catch (error) {
            console.error(error);
            return new AddPlaceResponse(false);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => EditPlaceResponse)
    async editPlace(@Args() { placeId, name, isFavorite }: EditPlaceArgs, @Ctx() ctx: IContext): Promise<EditPlaceResponse> {
        try {
            const place = await Place.findOneOrFail({ select: ['id'], where: { id: placeId, userId: ctx.payload.id } });
            if (place) {
                const args = Place.create({ name, isFavorite });
                await Place.update(placeId, args);
                return new EditPlaceResponse(true);
            } else {
                return new EditPlaceResponse(false);
            }
        } catch (error) {
            console.error(error);
            return new EditPlaceResponse(false);
        }
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => DeletePlaceResponse)
    async deletePlace(@Args() { placeId }: DeletePlaceArgs, @Ctx() ctx: IContext): Promise<DeletePlaceResponse> {
        try {
            const isOwnPlaceAndExist = await Place.findOneOrFail({ select: ['id'], where: { id: placeId, userId: ctx.payload.id } });
            if (isOwnPlaceAndExist) {
                await Place.delete(isOwnPlaceAndExist);
                return new DeletePlaceResponse(true);
            }
        } catch (error) {
            console.error(error);
        }
        return new DeletePlaceResponse(false);
    }
}
