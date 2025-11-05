import 'reflect-metadata';
import { startSoapServer } from './soap-server';

async function bootstrap() {
  const port = Number(process.env.SOAP_PORT || 8001);
  await startSoapServer(port);
}

bootstrap().catch((err) => {
  console.error('SOAP server error', err);
});
