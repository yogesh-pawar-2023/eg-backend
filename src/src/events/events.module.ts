import { Module } from '@nestjs/common';
import { HasuraModule } from 'src/services/hasura/hasura.module';
import { UserModule } from 'src/user.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';


@Module({
  imports: [UserModule,HasuraModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
