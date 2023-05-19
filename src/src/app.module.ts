import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgModule } from './ag/ag.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticateModule } from './authenticate/authenticate.module';
import { EnumModule } from './enum/enum.module';
import { EventsModule } from './events/events.module';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { HasuraModule } from './hasura/hasura.module';
import { HelperModule } from './helper/helper.module';
import { S3Module } from './services/s3/s3.module';
import { UploadFileModule } from './upload-file/upload-file.module';
import { UserModule } from './user.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        {
            ...HttpModule.register({}),
            global: true,
        },
        HelperModule,
        EnumModule,
        AuthenticateModule,
        UserModule,
        EventsModule,
        HasuraModule,
        S3Module,
        UploadFileModule,
        AgModule,
        BeneficiariesModule
        
    ],
    controllers: [AppController, GeolocationController],
    providers: [AppService, GeolocationService]
})
export class AppModule { }
