import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ApiController],
  providers: [],
})
export class AppModule {}
