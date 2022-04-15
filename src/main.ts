import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServerConfig } from './config/server.config';

const config = new ServerConfig();
async function bootstrap() {
    const port = config.PORT;
    const app = await NestFactory.create(AppModule);
    await app.listen(port);
}
bootstrap();
