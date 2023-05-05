import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HasuraModule } from 'src/services/hasura/hasura.module';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { S3Module } from 'src/services/s3/s3.module';
import { S3Service } from 'src/services/s3/s3.service';
import { UploadFileController } from './upload-file.controller';
import { UploadFileService } from './upload-file.service';

@Module({
  controllers: [UploadFileController],
  providers: [UploadFileService, S3Service, HasuraService],
  imports: [S3Module, HasuraModule]
})
export class UploadFileModule {}
