import { ConnectionOptions } from 'typeorm';

const connectionOptions: ConnectionOptions = {
    type: 'postgres',
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: true,
    entities: ['src/entities/*.*'],
    host: process.env.DB_ENDPOINT,
    port: 5432,
    username: process.env.DB_USERNAME,
};

export default connectionOptions;
