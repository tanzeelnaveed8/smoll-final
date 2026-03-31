import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { ALLOWED_ORIGIN } from './constants';
import { Admin } from './modules/admin/admin.entity';
import { PartnerSpeciality } from './modules/partner/entities/partner.speciality.entity';
import { Logger } from './configs/logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import expressBasicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  console.log('Starting Smoll API...');
  const logger = Logger.initialize();

  console.log('Loading app module (DB + Redis)...');
  // Create NestJS app with Winston logger
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });
  console.log('App module loaded.');

  const configService = app.get(ConfigService);

  const swaggerUser = configService.get<string>('SWAGGER_USER');
  const swaggerPass = configService.get<string>('SWAGGER_PASSWORD');

  app.use(
    '/payments/webhook',
    express.raw({ type: 'application/json' }), // apply only to this route
  );

  // Basic Auth middleware for Swagger docs
  if (swaggerUser && swaggerPass) {
    app.use(
      ['/api', '/api-json'],
      expressBasicAuth({
        users: { [swaggerUser]: swaggerPass },
        challenge: true,
      }),
    );
  } else {
    logger.warn(
      'Swagger basic auth credentials missing; protecting Swagger is skipped',
    );
  }

  app.use(cookieParser());

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));

  // Use Morgan for basic request logging
  app.use(
    morgan('short', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );

  // Custom middleware for error logging
  app.use((req, res, next) => {
    const oldJson = res.json;

    res.json = function (data) {
      if (res.statusCode >= 400) {
        logger.error(`Error: ${res.statusCode} - ${JSON.stringify(data)}`);
      }

      return oldJson.call(this, data);
    };

    next();
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableVersioning();

  const isDev = configService.get('ENVIRONMENT') === 'development';
  app.enableCors({
    origin: (origin, cb) => {
      // In development allow any origin (Expo app, physical device, emulator)
      if (isDev) return cb(null, true);
      if (!origin || ALLOWED_ORIGIN.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Smoll API')
    .setDescription('APIs for Smoll Mobile/Vet/Admin')
    .setVersion('1.0')
    .addCookieAuth('sfAccessToken', {
      type: 'http',
      scheme: 'Bearer',
      in: 'Header',
    })
    .addBasicAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Seeding
  console.log('Running seeds...');
  await Admin.seed();
  await PartnerSpeciality.seed();
  console.log('Seeds done.');

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Smoll API is running on http://localhost:${port}`);
  logger.info('Smoll API is running');
}

bootstrap();
