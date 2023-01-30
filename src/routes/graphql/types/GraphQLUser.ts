import { FastifyInstance } from 'fastify';
import {
	GraphQLID,
	GraphQLList,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';
import { GraphQLMemberType } from './GraphQLMemberType';
import { GraphQLPost } from './GraphQLPost';
import { GraphQLProfile } from './GraphQLProfile';

// @ts-ignore
export const GraphQLUser = new GraphQLObjectType({
	name: 'GraphQLUser',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: GraphQLString },
		lastName: { type: GraphQLString },
		email: { type: GraphQLString },
		subscribedToUserIds: {
			type: new GraphQLList(GraphQLString),
		},
		subscribedToUser: {
			type: new GraphQLList(GraphQLUser),
			resolve: async (
				{ subscribedToUserIds },
				args,
				context: FastifyInstance
			) => {
				return await context.db.users.findMany({
					key: 'id',
					equalsAnyOf: subscribedToUserIds,
				});
			},
		},
		userSubscribedTo: {
			type: new GraphQLList(GraphQLUser),
			resolve: async (
				{ subscribedToUserIds },
				args,
				context: FastifyInstance
			) => {
				return await context.loaders.users.loadMany(subscribedToUserIds);
			},
		},
		memberType: {
			type: GraphQLMemberType,
			resolve: async ({ id }, args, context: FastifyInstance) => {
				const profile = await context.db.profiles.findOne({
					key: 'userId',
					equals: id,
				});

				if (!profile) {
					return Promise.resolve(null);
				}

				return await context.db.memberTypes.findOne({
					key: 'id',
					equals: profile.memberTypeId,
				});
			},
		},
		posts: {
			type: new GraphQLList(GraphQLPost),
			resolve: async ({ id }, args, context: FastifyInstance) => {
				return await context.db.posts.findMany({
					key: 'userId',
					equals: id,
				});
			},
		},
		profile: {
			type: GraphQLProfile,
			resolve: async ({ id }, args, context: FastifyInstance) => {
				return await context.db.profiles.findOne({
					key: 'userId',
					equals: id,
				});
			},
		},
	}),
});
