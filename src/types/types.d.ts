import { Redis } from 'ioredis';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

export interface IContext {
    request: FastifyRequest<IncomingMessage>;
    reply: FastifyReply<ServerResponse>;
    redis: Redis;
    payload: { id: number };
}
