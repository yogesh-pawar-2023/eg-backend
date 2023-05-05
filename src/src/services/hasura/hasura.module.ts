import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HasuraService } from './hasura.service';

@Module({
  providers: [HasuraService],
  exports: [HasuraService]
})
export class HasuraModule {}
