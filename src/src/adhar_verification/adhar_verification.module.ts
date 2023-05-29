import { Module } from '@nestjs/common';
import { AdharVerificationService } from './adhar_verification.service';

@Module({
  providers: [AdharVerificationService],
  exports:[AdharVerificationService]
})
export class AdharVerificationModule {}
