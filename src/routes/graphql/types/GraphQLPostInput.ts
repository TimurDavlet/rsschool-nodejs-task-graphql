import {
	GraphQLID,
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLString,
} from 'graphql';

export const CreatePostDtoInput = new GraphQLInputObjectType({
	name: 'CreatePostDtoInput',
	fields: {
		content: { type: new GraphQLNonNull(GraphQLString) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});

export const UpdatePostDtoInput = new GraphQLInputObjectType({
	name: 'UpdatePostDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		content: { type: GraphQLString },
		title: { type: GraphQLString },
	},
});
