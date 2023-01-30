import {
	GraphQLID,
	GraphQLInputObjectType,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLString,
} from 'graphql';

export const CreateProfileDtoInput = new GraphQLInputObjectType({
	name: 'CreateProfileDtoInput',
	fields: {
		avatar: { type: new GraphQLNonNull(GraphQLString) },
		sex: { type: new GraphQLNonNull(GraphQLString) },
		birthday: { type: new GraphQLNonNull(GraphQLInt) },
		country: { type: new GraphQLNonNull(GraphQLString) },
		street: { type: new GraphQLNonNull(GraphQLString) },
		city: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
		memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
	},
});

export const UpdateProfileDtoInput = new GraphQLInputObjectType({
	name: 'UpdateProfileDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		avatar: { type: GraphQLString },
		sex: { type: GraphQLString },
		birthday: { type: GraphQLInt },
		country: { type: GraphQLString },
		street: { type: GraphQLString },
		city: { type: GraphQLString },
		memberTypeId: { type: GraphQLString },
	},
});
