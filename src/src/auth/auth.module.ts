import { Module } from '@nestjs/common';
import { AdharVerificationModule } from 'src/adhar_verification/adhar_verification.module';
import { HasuraModule } from 'src/services/hasura/hasura.module';
import { KeycloakModule } from 'src/services/keycloak/keycloak.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Module({
  imports: [
    KeycloakModule, HasuraModule,AdharVerificationModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
