import { FastifyInstance } from 'fastify';
import {
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { ErrorMessages } from '../../../utils/response';
import {
	GraphQLMemberType,
	GraphQLPost,
	GraphQLProfile,
	GraphQLUser,
} from '../types';

export const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		users: {
			type: new GraphQLList(GraphQLUser),
			resolve: async (
				source,
				args,
				context: FastifyInstance
			): Promise<UserEntity[]> => {
				return await context.db.users.findMany();
			},
		},
		profiles: {
			type: new GraphQLList(GraphQLProfile),
			resolve: async (
				source,
				args,
				context: FastifyInstance
			): Promise<ProfileEntity[]> => {
				return await context.db.profiles.findMany();
			},
		},
		posts: {
			type: new GraphQLList(GraphQLPost),
			resolve: async (
				source,
				args,
				context: FastifyInstance
			): Promise<PostEntity[]> => {
				return await context.db.posts.findMany();
			},
		},
		memberTypes: {
			type: new GraphQLList(GraphQLMemberType),
			resolve: async (
				source,
				args,
				context: FastifyInstance
			): Promise<MemberTypeEntity[]> => {
				return await context.db.memberTypes.findMany();
			},
		},
		user: {
			type: GraphQLUser,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: async (
				_,
				{ id },
				context: FastifyInstance
			): Promise<UserEntity> => {
				const user = await context.loaders.users.load(id);

				if (!user) {
					throw context.httpErrors.notFound(ErrorMessages.USER_ERROR);
				}

				return user;
			},
		},
		profile: {
			type: GraphQLProfile,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: async (
				_,
				{ id },
				context: FastifyInstance
			): Promise<ProfileEntity> => {
				const profile = await context.loaders.profiles.load(id);

				if (!profile) {
					throw context.httpErrors.notFound(ErrorMessages.PROFILE_ERROR);
				}

				return profile;
			},
		},
		post: {
			type: GraphQLPost,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: async (
				_,
				{ id },
				context: FastifyInstance
			): Promise<PostEntity> => {
				const post = await context.loaders.posts.load(id);

				if (!post) {
					throw context.httpErrors.notFound(ErrorMessages.POST_ERROR);
				}

				return post;
			},
		},
		memberType: {
			type: GraphQLMemberType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: async (
				_,
				{ id },
				context: FastifyInstance
			): Promise<MemberTypeEntity> => {
				const memberType = await context.loaders.memberTypes.load(id);

				if (!memberType) {
					throw context.httpErrors.notFound(ErrorMessages.MEMBER_TYPE_ERROR);
				}

				return memberType;
			},
		},
	},
});
