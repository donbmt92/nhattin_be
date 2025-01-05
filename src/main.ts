import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { Swagger } from './common/config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  Swagger.build(app);
  await app.listen(3080);
}
bootstrap();
