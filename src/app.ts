import { createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import Redis from 'ioredis';
import GQL from 'fastify-gql';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import './dotenv';
import connectionOptions from './ormConfig';
import { isAuthenticatedforSubscription } from './utils/authorization';
import { IncomingMessage, ServerResponse } from 'http';

export default async () => {
    const app = Fastify();
    const redis = new Redis();

    const redisOptions = {
        retryStrategy: (times: number) => {
            return Math.min(times * 50, 2000);
        },
    };
    const schema = await buildSchema({
        resolvers: [__dirname + '/api/**/*.resolver.*'],
        pubSub: new RedisPubSub({
            publisher: new Redis(redisOptions),
            subscriber: new Redis(redisOptions),
        }),
    });

    app.register(GQL, {
        schema,
        jit: 1,
        context: (request: FastifyRequest<IncomingMessage>, reply: FastifyReply<ServerResponse>) => {
            return { request, reply, redis };
        },
        graphiql: 'playground',
    });

    try {
        await createConnection(connectionOptions);
        app.listen(8080, () => {
            SubscriptionServer.create(
                {
                    schema,
                    execute,
                    subscribe,
                    onConnect: (connectionParams: object) => {
                        return {
                            ...isAuthenticatedforSubscription(connectionParams['authorization']),
                            redis,
                        };
                    },
                },
                {
                    server: app.server,
                    path: '/graphql',
                }
            );
            console.log('running');
        });
    } catch (err) {
        console.error(err);
    }
};
