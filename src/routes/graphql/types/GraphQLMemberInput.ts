import {
	GraphQLID,
	GraphQLInputObjectType,
	GraphQLInt,
	GraphQLNonNull,
} from 'graphql';

export const UpdateMemberDtoInput = new GraphQLInputObjectType({
	name: 'UpdateMemberDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		discount: { type: GraphQLInt },
		monthPostsLimit: { type: GraphQLInt },
	},
});
