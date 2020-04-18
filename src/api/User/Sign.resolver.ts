import { Resolver, Query, Args, Mutation } from 'type-graphql';
import User from '../../entities/User';
import { FacebookConnectResponse, FacebookConnectArgs } from '../../types/User/FacebookConnect';
import { EmailSignInResponse, EmailSignInArgs } from '../../types/User/EmailSignIn';
import { createAccessToken } from '../../utils/authorization';
import { PhoneSignInResponse, PhoneSignInArgs } from '../../types/User/PhoneSignIn';

@Resolver()
export class SignResolver {
    @Mutation(() => FacebookConnectResponse)
    async facebookConnect(@Args() args: FacebookConnectArgs): Promise<FacebookConnectResponse> {
        try {
            const { facebookId } = args;
            const existingUser = await User.findOne({ facebookId });
            if (existingUser) {
                return new FacebookConnectResponse(true, createAccessToken(existingUser.id));
            }
            const createdUserInformation = await User.create({ ...args, profilePhoto: `http://graph.facebook.com/${facebookId}/picture?type=square` }).save();

            return new FacebookConnectResponse(true, createAccessToken(createdUserInformation.id));
        } catch (err) {
            console.error(err);
            return new FacebookConnectResponse(false, 'test error');
        }
    }

    @Query(() => EmailSignInResponse)
    async emailSiginIn(@Args() { email, password }: EmailSignInArgs): Promise<EmailSignInResponse> {
        try {
            const findUser = await User.findOne({ email });
            if (findUser && (await findUser.comparePassword(password))) {
                return new EmailSignInResponse(true, createAccessToken(findUser.id));
            } else {
                return new EmailSignInResponse(false, 'Fail');
            }
        } catch (error) {
            console.error(error);
            return new EmailSignInResponse(false, error);
        }
    }

    @Query(() => PhoneSignInResponse)
    async phoneSiginIn(@Args() { phoneNumber, password }: PhoneSignInArgs): Promise<PhoneSignInResponse> {
        try {
            const findUser = await User.findOne({ phoneNumber });
            if (findUser && (await findUser.comparePassword(password))) {
                return new PhoneSignInResponse(true, createAccessToken(findUser.id));
            } else {
                return new PhoneSignInResponse(false, 'Fail');
            }
        } catch (error) {
            console.error(error);
            return new PhoneSignInResponse(false, error);
        }
    }
}
