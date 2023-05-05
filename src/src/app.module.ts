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
import { EnumModule } from './enum/enum.module';
import { UserHelper } from './helper/userHelper';
import { UploadFileModule } from './upload-file/upload-file.module';
import { S3Module } from './services/s3/s3.module';
import { HasuraModule } from './services/hasura/hasura.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    {
      ...HttpModule.register({}),
      global: true,
    }, 
    EnumModule, UploadFileModule, S3Module, HasuraModule],
  controllers: [AppController, UserController, GeolocationController],
  providers: [AppService, GeolocationService,HasuraService,UserService,UserHelper],
})
export class AppModule {}
