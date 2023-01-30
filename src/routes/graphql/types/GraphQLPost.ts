import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';

export const GraphQLPost = new GraphQLObjectType({
	name: 'GraphQLPost',
	fields: () => ({
		id: { type: GraphQLString },
		title: { type: GraphQLString },
		content: { type: GraphQLString },
		userId: { type: GraphQLID },
	}),
});
