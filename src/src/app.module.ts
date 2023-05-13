import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { EnumModule } from './enum/enum.module';
import { AuthenticateModule } from './authenticate/authenticate.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { HasuraModule } from './hasura/hasura.module';
import { HelperModule } from './helper/helper.module';

@Module({
  imports: [
    HttpModule,
    HelperModule,
    ConfigModule.forRoot(),
    EnumModule,
    AuthenticateModule,
    UsersModule,
    EventsModule,
    HasuraModule,
  ],
  controllers: [AppController, UserController, GeolocationController],
  providers: [AppService, GeolocationService, UserService],
})
export class AppModule {}
