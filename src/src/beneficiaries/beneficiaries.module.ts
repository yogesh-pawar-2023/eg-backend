import { Module } from '@nestjs/common';
import { UserModule } from 'src/user.module';
import { BeneficiariesController } from './beneficiaries.controller';
import { BeneficiariesService } from './beneficiaries.service';
@Module({
  imports:[UserModule],
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService]
})
export class BeneficiariesModule {}
