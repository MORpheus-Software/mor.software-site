import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import checkUser from '@/swagger/checkUser';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MOR.SOFTWARE API',
    version: '1.0.0',
    description: 'API documentation',
  },
  paths: {
    '/api/check-user': checkUser,
  },
  servers: [
    {
      url: 'http://localhost:3006', // Update with your base URL
      description: 'Local server',
    },
  ],
};

const options: Options = {
  definition: swaggerDefinition,
  apis: ['./app/api/**/*.ts'], // Adjust to match your API files' location
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
