import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { HasuraService } from 'src/hasura/hasura.service';
import { HasuraModule } from 'src/hasura/hasura.module';

@Module({
  imports: [HasuraModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
