import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {return reply.send(fastify.db.profiles.findMany())});

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({
				key: 'id',
				equals: request.params.id,
			});

			if (!profile) {
				return reply.code(404).send({ message: "Ошибка профайла" });
			}

			return reply.send(profile);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const user = await fastify.db.users.findOne({
				key: 'id',
				equals: request.body.userId,
			});

			const checkProfile = await fastify.db.profiles.findOne({
				key: 'userId',
				equals: request.body.userId,
			});

			const memberTypes = ['basic', 'business'];

			if (!user) {
				return reply.status(404).send({ message: "Ошибка профайла" });
			}

			const newProfile = await fastify.db.profiles.create(request.body);

			if (
				!memberTypes.includes(newProfile.memberTypeId) ||
				checkProfile ||
				!newProfile.id
			) {
				return reply.status(400).send({ message: "Ошибка запроса" });
			}

			return reply.send(newProfile);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
				const deleteProfile = await fastify.db.profiles.delete(
					request.params.id
				);

				return reply.send(deleteProfile);
			} catch (error) {
				return reply.code(400).send({ message: (error as Error).message });
			}
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
				const updatedProfile = await fastify.db.profiles.change(
					request.params.id,
					request.body
				);

				return reply.send(updatedProfile);
			} catch (error) {
				return reply.code(400).send({ message: (error as Error).message });
			}
    }
  );
};

export default plugin;
