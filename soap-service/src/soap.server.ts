import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import * as soap from 'soap';
import { DataSource } from 'typeorm';
import config from '../ormconfig';
import { WalletService } from './services/wallet.service';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { PaymentSession } from './entities/payment-session.entity';

export async function startSoapServer(port = 8001) {
  const dataSource = new DataSource(config);
  await dataSource.initialize();
  console.log('TypeORM connected');

  const walletService = new WalletService(dataSource);

  const serviceObject = {
    WalletService: {
      WalletServiceSoapPort: {
        async registroCliente(args: any) {
          const { documento, nombres, email, celular } = args;
          return walletService.registroCliente(
            documento,
            nombres,
            email,
            celular,
          );
        },
        async recargaBilletera(args: any) {
          const { documento, celular, valor } = args;
          return walletService.recargaBilletera(
            documento,
            celular,
            Number(valor),
          );
        },
        async iniciarPago(args: any) {
          const { documento, celular, valor } = args;
          return walletService.iniciarPago(documento, celular, Number(valor));
        },
        async confirmarPago(args: any) {
          const { id_sesion, token } = args;
          return walletService.confirmarPago(id_sesion, token);
        },
        async consultarSaldo(args: any) {
          const { documento, celular } = args;
          return walletService.consultarSaldo(documento, celular);
        },
      },
    },
  };

  const app = express();
  const wsdlXml = fs.readFileSync(
    path.join(__dirname, 'wsdl', 'wallet.wsdl'),
    'utf8',
  );

  const server = app.listen(port, function () {
    soap.listen(server, '/wsdl', serviceObject, wsdlXml);
    console.log(`SOAP server listening on http://localhost:${port}/wsdl?wsdl`);
  });

  return { app, server };
}
