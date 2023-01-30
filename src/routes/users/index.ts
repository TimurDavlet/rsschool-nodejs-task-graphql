import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return reply.send(fastify.db.users.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
				key: 'id',
				equals: request.params.id,
			});
      return user ? reply.send(user) : reply.code(404).send({ message: 'Пользователь не найден' });
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const createUser = await fastify.db.users.create(request.body)
      return reply.status(201).send(createUser);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
				const deletedUser = await fastify.db.users.delete(request.params.id);
				const users = await fastify.db.users.findMany({
					key: 'subscribedToUserIds',
					equals: [deletedUser.id],
				});
				const posts = await fastify.db.posts.findMany({
					key: 'userId',
					equals: deletedUser.id,
				});
				const profile = await fastify.db.profiles.findOne({
					key: 'userId',
					equals: deletedUser.id,
				});
				if (profile) {
					await fastify.db.profiles.delete(profile.id);
				}
				posts.forEach(async (post) => await fastify.db.posts.delete(post.id));
				users.forEach(
					async (user) =>
						await fastify.db.users.change(user.id, {
							subscribedToUserIds: user.subscribedToUserIds.filter(
								(userId) => userId !== deletedUser.id
							),
						})
				);
				return reply.send(deletedUser);
			} catch (error) {
				return reply.status(400).send({ message: (error as Error).message });
			}
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscriber = await fastify.db.users.findOne({
				key: 'id',
				equals: request.params.id,
			});

			const candidate = await fastify.db.users.findOne({
				key: 'id',
				equals: request.body.userId,
			});

			if (!subscriber || !candidate) {
				return reply.status(404).send({ message: "Не найдено" });
			}
			const followerIndex = subscriber.subscribedToUserIds.findIndex(
				(follower) => follower === request.body.userId
			);
			if (followerIndex != -1) {
				return reply.status(400).send({ message: "Ошибка запроса" });
			}
			const subscriberSubscribedToIds = [
				...subscriber.subscribedToUserIds,
				candidate.id,
			];
			const candidateSubscribedToUserIds = [
				...candidate.subscribedToUserIds,
				subscriber.id,
			];
			const updatedUser = await fastify.db.users.change(request.params.id, {
				subscribedToUserIds: subscriberSubscribedToIds,
			});
			await fastify.db.users.change(request.body.userId, {
				subscribedToUserIds: candidateSubscribedToUserIds,
			});
			return reply.status(200).send(updatedUser);
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const us = await fastify.db.users.findOne({
				key: 'id',
				equals: request.params.id,
			});
			const theCandidate = await fastify.db.users.findOne({
				key: 'id',
				equals: request.body.userId,
			});
			if (!us || !theCandidate) {
				return reply.status(404).send({ message: "Не найдено" });
			}
			const followerIndex = us.subscribedToUserIds.findIndex(
				(follower) => follower === request.body.userId
			);
			const usIndex = theCandidate.subscribedToUserIds.findIndex(
				(us) => us === request.params.id
			);
			if (followerIndex === -1 || usIndex === -1) {
				return reply.status(400).send({ message: "Ошибка в запросе" });
			}
			const updatedUser = await fastify.db.users.change(request.params.id, {
				subscribedToUserIds: us.subscribedToUserIds.filter(
					(follower) => follower != request.body.userId
				),
			});
			await fastify.db.users.change(request.body.userId, {
				subscribedToUserIds: theCandidate.subscribedToUserIds.filter(
					(subscriber) => subscriber != request.params.id
				),
			});
			return reply.send(updatedUser);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
				const updateUser = await fastify.db.users.change(
					request.params.id,
					request.body
				);
				return reply.send(updateUser);
			} catch (error) {
				return reply.status(400).send({ message: (error as Error).message });
			}
    }
  );
};

export default plugin;
