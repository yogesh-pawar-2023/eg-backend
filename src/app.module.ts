import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {UserController } from './user.controller';

@Module({
  imports: [HttpModule],
  controllers: [AppController,UserController],
  providers: [AppService],
})
export class AppModule {}
