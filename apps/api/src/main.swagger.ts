import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

export const swagger = (app) => {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0.0')
    .addBearerAuth({
      description: `Please enter token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config,{
  });

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
