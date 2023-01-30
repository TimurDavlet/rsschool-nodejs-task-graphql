import {
	GraphQLID,
	GraphQLInt,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';

export const GraphQLProfile = new GraphQLObjectType({
	name: 'GraphQLProfile',
	fields: () => ({
		id: { type: GraphQLString },
		userId: { type: GraphQLID },
		avatar: { type: GraphQLString },
		sex: { type: GraphQLString },
		birthday: { type: GraphQLInt },
		country: { type: GraphQLString },
		street: { type: GraphQLString },
		city: { type: GraphQLString },
		memberTypeId: { type: GraphQLString },
	}),
});
