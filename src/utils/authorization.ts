import { sign, verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import { IContext } from '../types/types.d';
import { ACCESS_TOKEN } from '../constants/secretToken';

export const createAccessToken = (id: number) => {
    return sign({ id }, process.env.ACCESS_TOKEN || ACCESS_TOKEN, { expiresIn: '7d' }); //15m
};

export const isAuthenticated: MiddlewareFn<IContext> = ({ context }, next) => {
    const authorization = context.request.headers['authorization'];
    if (!authorization) {
        throw new Error('Invalid Authorization header');
    }
    try {
        context.payload = verify(authorization, process.env.ACCESS_TOKEN || ACCESS_TOKEN) as any;
    } catch (error) {
        console.error(error);
    }

    return next();
};

export const isAuthenticatedforSubscription = (passedToken: string): { payload: { id: number } } | {} => {
    if (!passedToken) {
        throw new Error('Invalid Authorization header');
    }
    try {
        return { payload: verify(passedToken, process.env.ACCESS_TOKEN || ACCESS_TOKEN) as { id: number } };
    } catch (error) {
        console.error(error);
        return {};
    }
};
