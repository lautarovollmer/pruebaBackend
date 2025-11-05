import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { soapClientProvider } from './providers/soap-client.provider';
import { SoapClientService } from './services/soap-client.service';

@Module({
  imports: [],
  controllers: [WalletController],
  providers: [soapClientProvider, SoapClientService],
})
export class AppModule {}
