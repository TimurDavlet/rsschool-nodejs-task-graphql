import { FastifyInstance } from 'fastify';
import { GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { ErrorMessages } from '../../../utils/response';
import {
	CreatePostDtoInput,
	CreateProfileDtoInput,
	CreateUserDtoInput,
	GraphQLMemberType,
	GraphQLPost,
	GraphQLProfile,
	GraphQLUser,
	SubscribeUserDtoInput,
	UnSubscribeUserDtoInput,
	UpdateMemberDtoInput,
	UpdatePostDtoInput,
	UpdateProfileDtoInput,
	UpdateUserDtoInput,
} from '../types';

export const RootMutation = new GraphQLObjectType({
	name: 'RootMutationType',
	fields: {
		createUser: {
			type: GraphQLUser,
			args: { data: { type: new GraphQLNonNull(CreateUserDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', Omit<UserEntity, 'id'>>,
				context: FastifyInstance
			) => {
				return await context.db.users.create(data);
			},
		},
		createPost: {
			type: GraphQLPost,
			args: { data: { type: new GraphQLNonNull(CreatePostDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', Omit<PostEntity, 'id'>>,
				context: FastifyInstance
			) => {
				const { userId } = data;

				const user = await context.db.users.findOne({
					key: 'id',
					equals: userId,
				});

				if (!user) {
					throw context.httpErrors.notFound(ErrorMessages.USER_ERROR);
				}

				const newPost = await context.db.posts.create(data);

				return newPost;
			},
		},
		createProfile: {
			type: GraphQLProfile,
			args: { data: { type: new GraphQLNonNull(CreateProfileDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', Omit<ProfileEntity, 'id'>>,
				context: FastifyInstance
			) => {
				const { userId, memberTypeId } = data;

				const user = await context.db.users.findOne({
					key: 'id',
					equals: userId,
				});

				if (!user) {
					throw context.httpErrors.notFound(ErrorMessages.USER_ERROR);
				}

				const profileByUserId = await context.db.profiles.findOne({
					key: 'userId',
					equals: userId,
				});

				if (profileByUserId !== null) {
					throw context.httpErrors.badRequest(ErrorMessages.PROFILE_EXISTS);
				}

				const memberType = await context.db.memberTypes.findOne({
					key: 'id',
					equals: memberTypeId,
				});

				if (!memberType) {
					throw context.httpErrors.notFound(ErrorMessages.MEMBER_TYPE_ERROR);
				}

				const newProfile = await context.db.profiles.create(data);

				return newProfile;
			},
		},
		updateUser: {
			type: GraphQLUser,
			args: { data: { type: new GraphQLNonNull(UpdateUserDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', UserEntity>,
				context: FastifyInstance
			) => {
				const { id } = data;

				const user = await context.db.users.findOne({
					key: 'id',
					equals: id,
				});

				if (!user) {
					throw context.httpErrors.notFound(ErrorMessages.USER_ERROR);
				}

				const updatedUser = await context.db.users.change(id, data);

				return updatedUser;
			},
		},
		updatePost: {
			type: GraphQLPost,
			args: { data: { type: new GraphQLNonNull(UpdatePostDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', PostEntity>,
				context: FastifyInstance
			) => {
				const { id } = data;

				const post = await context.db.posts.findOne({
					key: 'id',
					equals: id,
				});

				if (!post) {
					throw context.httpErrors.notFound(ErrorMessages.POST_ERROR);
				}

				const updatedPost = await context.db.posts.change(id, data);

				return updatedPost;
			},
		},
		updateProfile: {
			type: GraphQLProfile,
			args: { data: { type: new GraphQLNonNull(UpdateProfileDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', ProfileEntity>,
				context: FastifyInstance
			) => {
				const { id } = data;

				const profile = await context.db.profiles.findOne({
					key: 'id',
					equals: id,
				});

				if (!profile) {
					throw context.httpErrors.notFound(ErrorMessages.PROFILE_ERROR);
				}

				const updatedProfile = await context.db.profiles.change(id, data);

				return updatedProfile;
			},
		},
		updateMemberType: {
			type: GraphQLMemberType,
			args: { data: { type: new GraphQLNonNull(UpdateMemberDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', MemberTypeEntity>,
				context: FastifyInstance
			) => {
				const { id } = data;

				const member = await context.db.memberTypes.findOne({
					key: 'id',
					equals: id,
				});

				if (!member) {
					throw context.httpErrors.notFound(ErrorMessages.MEMBER_TYPE_ERROR);
				}

				const newMember = await context.db.memberTypes.change(id, data);

				return newMember;
			},
		},
		subscribeUser: {
			type: GraphQLUser,
			args: { data: { type: new GraphQLNonNull(SubscribeUserDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', Pick<ProfileEntity, 'id' | 'userId'>>,
				context: FastifyInstance
			) => {
				const { id, userId } = data;

				if (id === userId) {
					throw context.httpErrors.badRequest(ErrorMessages.USER_SUBSCRIBE);
				}

				const subscriber = await context.db.users.findOne({
					key: 'id',
					equals: id,
				});

				const candidate = await context.db.users.findOne({
					key: 'id',
					equals: userId,
				});

				if (!subscriber || !candidate) {
					throw context.httpErrors.notFound(ErrorMessages.NOT_FOUND);
				}

				const followerIndex = subscriber.subscribedToUserIds.findIndex(
					(follower: string) => follower === userId
				);

				if (followerIndex != -1) {
					throw context.httpErrors.notFound(ErrorMessages.BAD_REQUEST);
				}

				const subscriberSubscribedToIds = [
					...subscriber.subscribedToUserIds,
					candidate.id,
				];

				const candidateSubscribedToUserIds = [
					...candidate.subscribedToUserIds,
					subscriber.id,
				];

				const updatedUser = await context.db.users.change(id, {
					subscribedToUserIds: subscriberSubscribedToIds,
				});

				await context.db.users.change(userId, {
					subscribedToUserIds: candidateSubscribedToUserIds,
				});

				return updatedUser;
			},
		},
		unSubscribeUser: {
			type: GraphQLUser,
			args: { data: { type: new GraphQLNonNull(UnSubscribeUserDtoInput) } },
			resolve: async (
				_,
				{ data }: Record<'data', Pick<ProfileEntity, 'id' | 'userId'>>,
				context: FastifyInstance
			) => {
				const { id, userId } = data;

				const unSubscriber = await context.db.users.findOne({
					key: 'id',
					equals: id,
				});

				const candidate = await context.db.users.findOne({
					key: 'id',
					equals: userId,
				});

				if (!unSubscriber || !candidate) {
					throw context.httpErrors.notFound(ErrorMessages.NOT_FOUND);
				}

				const followerIndex = unSubscriber.subscribedToUserIds.findIndex(
					(follower: string) => follower === userId
				);

				const subscriberIndex = candidate.subscribedToUserIds.findIndex(
					(subscriber: string) => subscriber === id
				);

				if (followerIndex === -1 || subscriberIndex === -1) {
					throw context.httpErrors.notFound(ErrorMessages.BAD_REQUEST);
				}

				const updatedUser = await context.db.users.change(id, {
					subscribedToUserIds: unSubscriber.subscribedToUserIds.filter(
						(follower: string) => follower != userId
					),
				});

				await context.db.users.change(userId, {
					subscribedToUserIds: candidate.subscribedToUserIds.filter(
						(subscriber: string) => subscriber != id
					),
				});

				return updatedUser;
			},
		},
	},
});
