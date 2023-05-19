import { Module } from '@nestjs/common';

import { UserModule } from 'src/user.module';
import { AgController } from './ag.controller';
import { AgService } from './ag.service';

@Module({
 imports:[UserModule],
  controllers: [AgController],
  providers: [AgService],
})
export class AgModule {}
