export const graphqlBodySchema = {
	type: 'object',
	properties: {
		mutation: { type: 'string' },
		query: { type: 'string' },
		variables: {
			type: 'object',
		},
	},
	oneOf: [
		{
			type: 'object',
			required: ['query'],
			properties: {
				query: { type: 'string' },
				variables: {
					type: 'object',
				},
			},
			additionalProperties: false,
		},
		{
			type: 'object',
			required: ['mutation'],
			properties: {
				mutation: { type: 'string' },
				variables: {
					type: 'object',
				},
			},
			additionalProperties: false,
		},
	],
} as const;
