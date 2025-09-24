import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import {JoinEventSchema, LeaveEventSchema, ObjectEventSchema} from './schemas/event-schemas';

export const swagger = (app) => {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0.0')
    .addBearerAuth({
      description: `Please enter token in the following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config,{
  });

  // Expose custom enum schemas in Swagger components
  (document.components = document.components || {}).schemas = (document.components.schemas || {});

  document.components.schemas[JoinEventSchema.title] = JoinEventSchema as any;
  document.components.schemas[LeaveEventSchema.title] = LeaveEventSchema as any;
  document.components.schemas[ObjectEventSchema.title] = ObjectEventSchema as any;

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
    },
  });

  if (process.env.APP_ENV == 'production') return;

  try {
    fs.writeFileSync(
      './config/api-swagger-spec.json',
      JSON.stringify(document).replace(/Controller/g, '')
    );

    require('child_process').exec('npm run ng-swagger');
  } catch (e) {
    console.error(e);
  }
};
