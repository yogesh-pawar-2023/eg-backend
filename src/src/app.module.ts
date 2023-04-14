import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { UserController } from './user.controller';

@Module({
  imports: [HttpModule],
  controllers: [AppController, UserController, GeolocationController],
  providers: [AppService, GeolocationService],
})
export class AppModule {}
