import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SoapClientService {
  constructor(@Inject('SOAP_CLIENT') private soapClient: any) {}

  private async call(method: string, args: any) {
    const fnAsync = this.soapClient[`${method}Async`];
    if (!fnAsync) throw new Error(`Método SOAP ${method} no disponible`);
    const [result] = await fnAsync(args);
    return result;
  }

  registroCliente(args: any) {
    return this.call('registroCliente', args);
  }
  recargaBilletera(args: any) {
    return this.call('recargaBilletera', args);
  }
  iniciarPago(args: any) {
    return this.call('iniciarPago', args);
  }
  confirmarPago(args: any) {
    return this.call('confirmarPago', args);
  }
  consultarSaldo(args: any) {
    return this.call('consultarSaldo', args);
  }
}
