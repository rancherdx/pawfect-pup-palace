// OpenAPI Specification for GDS Puppies API
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GDS Puppies API',
    version: '1.0.0',
    description: 'API for managing puppy breeding business operations',
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'session',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'string' },
        },
        required: ['error'],
      },
      Puppy: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          breed: { type: 'string' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          color: { type: 'string' },
          birthDate: { type: 'string', format: 'date' },
          price: { type: 'number' },
          status: { type: 'string', enum: ['Available', 'Reserved', 'Sold'] },
          description: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
        },
      },
      Litter: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          mother: { type: 'string' },
          father: { type: 'string' },
          breed: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          puppyCount: { type: 'number' },
          status: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  paths: {
    '/puppies': {
      get: {
        summary: 'Get all puppies',
        tags: ['Puppies'],
        parameters: [
          {
            name: 'breed',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by breed',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by status',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            description: 'Number of results to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of results to skip',
          },
        ],
        responses: {
          200: {
            description: 'List of puppies',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    puppies: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Puppy' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        limit: { type: 'number' },
                        offset: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/Error' },
        },
      },
      post: {
        summary: 'Create a new puppy',
        tags: ['Puppies'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Puppy' },
            },
          },
        },
        responses: {
          201: {
            description: 'Puppy created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Puppy' },
              },
            },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          500: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/puppies/{id}': {
      get: {
        summary: 'Get puppy by ID',
        tags: ['Puppies'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Puppy ID',
          },
        ],
        responses: {
          200: {
            description: 'Puppy details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Puppy' },
              },
            },
          },
          404: { $ref: '#/components/responses/Error' },
          500: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/litters': {
      get: {
        summary: 'Get all litters',
        tags: ['Litters'],
        responses: {
          200: {
            description: 'List of litters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    litters: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Litter' },
                    },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          500: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'User registration',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: { $ref: '#/components/responses/Error' },
          500: { $ref: '#/components/responses/Error' },
        },
      },
    },
  },
  responses: {
    Error: {
      description: 'Error response',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
  tags: [
    { name: 'Puppies', description: 'Puppy management endpoints' },
    { name: 'Litters', description: 'Litter management endpoints' },
    { name: 'Authentication', description: 'User authentication endpoints' },
    { name: 'Admin', description: 'Admin-only endpoints' },
  ],
};