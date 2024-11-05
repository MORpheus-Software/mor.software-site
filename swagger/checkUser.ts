const checkUser = {
  get: {
    summary: 'Check if user exists',
    tags: ['User Operations'],
    parameters: [
      {
        in: 'query',
        name: 'userId',
        schema: {
          type: 'string',
        },
        required: true,
        description: 'The first parameter',
      },
    ],
    responses: {
      '200': {
        description: 'Successfully retrieved check user data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
          },
        },
      },
      '400': {
        description: 'Error Happened',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'userId is required',
                },
              },
            },
          },
        },
      },
    },
  },
};

export default checkUser;
