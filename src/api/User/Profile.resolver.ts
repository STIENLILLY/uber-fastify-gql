import { Resolver, Query, Mutation, Args, UseMiddleware, Ctx } from 'type-graphql';
import User from '../../entities/User';
import { UpdateProfileArgs, UpdateProfileResponse } from '../../types/User/UpdateProfile';
import { isAuthenticated } from '../../utils/authorization';
import { ProfileSignArgs, ProfileSignResponse } from '../../types/User/ProfileSign';
import { IContext } from '../../types/types';

@Resolver()
export class ProfileResolver {
    @UseMiddleware(isAuthenticated)
    @Query(() => User)
    async getProfile(@Ctx() ctx: IContext): Promise<User> {
        return User.findOneOrFail(ctx.payload.id);
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => ProfileSignResponse)
    async profileSign(@Args() args: ProfileSignArgs, @Ctx() ctx: IContext): Promise<ProfileSignResponse> {
        try {
            const userId = ctx.payload.id;
            const user = await User.findOne(userId);

            if (user && (user.verifiedEmail || user.verifiedPhoneNumber) && (!user.firstName || !user.lastName)) {
                const createUser = User.create({ ...args });
                await User.update(userId, createUser);
                return new ProfileSignResponse(true);
            }
        } catch (err) {
            console.error(err);
        }
        return new ProfileSignResponse(false);
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => UpdateProfileResponse)
    async updateProfile(@Args() { currentPassword, password, firstName, lastName, age, profilePhoto }: UpdateProfileArgs, @Ctx() ctx: IContext): Promise<UpdateProfileResponse> {
        try {
            const userId = ctx.payload.id;
            const user = await User.findOneOrFail(userId);
            const args = User.create({ firstName, lastName, age, profilePhoto });

            if (currentPassword && password && (await user.comparePassword(currentPassword))) {
                Object.assign(args, { password });
            }
            await User.update(userId, args);

            return new UpdateProfileResponse(true);
        } catch (error) {
            console.error(error);
            return new UpdateProfileResponse(false);
        }
    }
}
