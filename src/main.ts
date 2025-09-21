/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  // Debug environment variables
  console.log('Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log('MONGOURL:', process.env.MONGOURL);
  console.log('DATABASE:', process.env.DATABASE);
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
 
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Remove global JWT guard if it exists
  // app.useGlobalGuards(new JwtAuthGuard());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NhatTin API')
    .setDescription('API documentation for NhatTin project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Use PORT environment variable provided by Render, or default to 3080
  const port = process.env.PORT || 3080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
