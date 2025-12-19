import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');


   app.enableCors({
    origin: 'http://localhost:5173', // tu frontend
    credentials: true,
  });

  // 👇 registra el adaptador de Socket.IO
 app.useWebSocketAdapter(new IoAdapter(app));
 
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


await app.listen(process.env.PORT || 3000);
logger.log(`App running on port ${process.env.PORT || 3000}`);

}
bootstrap();
