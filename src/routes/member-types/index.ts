import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {return reply.send(fastify.db.memberTypes.findMany())});

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const member = await fastify.db.memberTypes.findOne({
				key: 'id',
				equals: request.params.id,
			});

			if (!member) {
				return reply
					.code(404)
					.send({ message: "TYPE_ERROR" });
			}

			return reply.send(member);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
				const newMember = await fastify.db.memberTypes.change(
					request.params.id,
					request.body
				);

				return reply.send(newMember);
			} catch (error) {
				return reply.code(400).send({ message: (error as Error).message });
			}
    }
  );
};

export default plugin;
