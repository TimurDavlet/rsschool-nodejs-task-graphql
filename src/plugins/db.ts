import fp from 'fastify-plugin';
import DB from '../utils/DB/DB';
import { DataLoaders } from './loader';


export default fp(async (fastify): Promise<void> => {
  const db = new DB();
  const loaders = new DataLoaders(db);

  fastify.decorate('db', db);
  fastify.decorate('loaders', loaders);
});

declare module 'fastify' {
  export interface FastifyInstance {
    db: DB;
    loaders: DataLoaders
  }
}
