import 'dotenv/config';
import {Logger, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {AppLandingPageModule, AppModule} from './modules/app.module';
import { PeerService } from './modules/peer/peer.service';
import {swagger} from "./main.swagger";
import process from "node:process";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.enableCors();

  // Enable global validation + transformation for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      skipUndefinedProperties: true,
      skipNullProperties: true,
    })
  );

  const peerService = app.get(PeerService);
  peerService.enablePeerServer(app);

  swagger(app);

  const port =  process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`
  );
}

async function bootstrapLandingPage() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppLandingPageModule, {}
  );

  const port =  process.env.PORT_LANDING_PAGE ||  process.env.PORT || 3004;
  await app.listen(port);

  Logger.log(
    `🚀 Landing-Page is running on: http://localhost:${port} ${process.env['APP_ENV']}`
  );
}

if(process.env['APP_ENV'] == 'landing-page') bootstrapLandingPage();
else bootstrap();

