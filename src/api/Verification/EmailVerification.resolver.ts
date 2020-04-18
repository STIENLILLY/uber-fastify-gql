import { Resolver, Mutation, Args, Ctx } from 'type-graphql';
import { IContext } from '../../types/types.d';
import User from '../../entities/User';
import { StartEmailVerificationArgs } from '../../types/Verification/StartEmail';
import { CompleteEmailVerificationArgs, CompleteEmailVerificationResponse } from '../../types/Verification/CompleteEmail';
import { sendEmail } from '../../utils/sendEmail';
import { crc32 } from '../../utils/crc32';
import { createAccessToken } from '../../utils/authorization';

@Resolver()
export class EmailVerificationResolver {
    @Mutation(() => Boolean)
    async startEmailVerification(@Args() { email }: StartEmailVerificationArgs, @Ctx() ctx: IContext): Promise<Boolean> {
        try {
            const code = Math.random().toString(36).substr(2);
            const verifiedUser = await User.findOne({ select: ['verifiedEmail'], where: { email } });
            if (verifiedUser && verifiedUser.verifiedEmail === true) {
                return false;
            }
            await sendEmail(email, code);
            await ctx.redis.set(`email-${crc32(email)}`, code, 'ex', 60 * 60);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    @Mutation(() => CompleteEmailVerificationResponse)
    async completeEmailVerification(@Args() { verificationCode, email }: CompleteEmailVerificationArgs, @Ctx() ctx: IContext): Promise<CompleteEmailVerificationResponse> {
        try {
            const hashedEmail = crc32(email);
            const userCode = await ctx.redis.get(`email-${hashedEmail}`);
            if (verificationCode === userCode) {
                await ctx.redis.del(`email-${hashedEmail}`);

                const verifiedUser = await User.findOne({ select: ['verifiedEmail'], where: { email } });
                if (verifiedUser) {
                    await User.update(verifiedUser.id, { verifiedEmail: true }, { reload: false });
                    return new CompleteEmailVerificationResponse(true, createAccessToken(verifiedUser.id));
                }

                const createdNewUser = await User.create({ email, verifiedEmail: true }).save();
                return new CompleteEmailVerificationResponse(true, createAccessToken(createdNewUser.id));
            } else {
                return new CompleteEmailVerificationResponse(false, 'Verification Error');
            }
        } catch (error) {
            console.error(error);
            return new CompleteEmailVerificationResponse(false, error);
        }
    }
}
