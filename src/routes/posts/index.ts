import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {return reply.send(fastify.db.posts.findMany())});

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({
				key: 'id',
				equals: request.params.id,
			});
      return !post ? reply.code(404).send({ message: "Ошибка" }) : reply.send(post);
    });

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const user = await fastify.db.users.findOne({
				key: 'id',
				equals: request.body.userId,
			});
      return !user ? reply.status(404).send({ message: "USER_ERROR" }) : await fastify.db.posts.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
				return reply.send(await fastify.db.posts.delete(request.params.id));
			} catch (error) {
				return reply.code(400).send({ message: (error as Error).message });
			}
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
				const updatedPost = await fastify.db.posts.change(
					request.params.id,
					request.body
				);

				return reply.send(updatedPost);
			} catch (error) {
				return reply.code(400).send({ message: (error as Error).message });
			}
    }
  );
};

export default plugin;
