import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { HasuraService } from './helper/hasura.service';
import { UserService } from './user.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [AppController, UserController, GeolocationController],
  providers: [AppService, GeolocationService,HasuraService,UserService],
})
export class AppModule {}
