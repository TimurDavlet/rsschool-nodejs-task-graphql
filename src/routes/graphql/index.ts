import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLSchema, parse, validate } from 'graphql';
import { RootMutation } from './mutations';
import { RootQuery } from './query';
import { graphqlBodySchema } from './schema';
import * as depthLimit from 'graphql-depth-limit';

const GRAPHQL_DEPTH = 6;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
	fastify
): Promise<void> => {
	fastify.post(
		'/',
		{
			schema: {
				body: graphqlBodySchema,
			},
		},
		async function (request, reply) {
			const { query, variables } = request.body;

			const schema: GraphQLSchema = new GraphQLSchema({
				query: RootQuery,
				mutation: RootMutation,
			});

			const errors = validate(schema, parse(String(query)), [
				depthLimit(GRAPHQL_DEPTH),
			]);

			fastify.loaders.clearCache();

			if (errors.length > 0) {
				reply.send({ data: null, errors: errors });

				return;
			}

			return await graphql({
				schema: schema,
				source: String(query),
				variableValues: variables,
				contextValue: fastify,
			});
		}
	);
};

export default plugin;
