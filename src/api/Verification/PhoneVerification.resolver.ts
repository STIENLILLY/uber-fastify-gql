import { Resolver, Mutation, Args, Ctx } from 'type-graphql';
import { StartPhoneVerificationArgs } from '../../types/Verification/StartPhone';
import { IContext } from '../../types/types.d';
import { sendVerificationSMS } from '../../utils/sendSMS';
import { CompletePhoneVerificationArgs, CompletePhoneVerificationResponse } from '../../types/Verification/CompletePhone';
import User from '../../entities/User';
import { createAccessToken } from '../../utils/authorization';
import { crc32 } from '../../utils/crc32';

@Resolver()
export class PhoneVerificationResolver {
    @Mutation(() => Boolean)
    async startPhoneVerification(@Args() { phoneNumber }: StartPhoneVerificationArgs, @Ctx() ctx: IContext): Promise<Boolean> {
        try {
            const code = Math.floor(Math.random() * 100000)
                .toString()
                .padStart(5, '0');
            const verifiedUser = await User.findOne({ select: ['verifiedPhoneNumber'], where: { phoneNumber } });
            if (verifiedUser && verifiedUser.verifiedPhoneNumber === true) {
                return false;
            }
            await sendVerificationSMS(phoneNumber, code);
            await ctx.redis.set(`phone-${crc32(phoneNumber)}`, code, 'ex', 60 * 60 * 6);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    @Mutation(() => CompletePhoneVerificationResponse)
    async completePhoneVerification(@Args() { phoneNumber, verificationCode }: CompletePhoneVerificationArgs, @Ctx() ctx: IContext): Promise<CompletePhoneVerificationResponse> {
        try {
            const hashedPhoneNumber = crc32(phoneNumber);
            const userCode = await ctx.redis.get(`phone-${hashedPhoneNumber}`);
            if (verificationCode === userCode) {
                await ctx.redis.del(`phone-${hashedPhoneNumber}`);

                const verifiedUser = await User.findOne({ select: ['verifiedPhoneNumber'], where: { phoneNumber } });
                if (verifiedUser) {
                    await User.update(verifiedUser.id, { verifiedPhoneNumber: true }, { reload: false });
                    return new CompletePhoneVerificationResponse(true, createAccessToken(verifiedUser.id));
                }
                const createdNewUser = await User.create({ phoneNumber, verifiedPhoneNumber: true }).save();
                return new CompletePhoneVerificationResponse(true, createAccessToken(createdNewUser.id));
            } else {
                return new CompletePhoneVerificationResponse(false, 'Verification Error');
            }
        } catch (error) {
            console.error(error);
            return new CompletePhoneVerificationResponse(false, error);
        }
    }
}
