import { Body, Controller, Post } from '@nestjs/common';
import { SoapClientService } from '../services/soap-client.service';

@Controller('wallet')
export class WalletController {
  constructor(private soap: SoapClientService) {}

  @Post('registro')
  async registro(@Body() body) {
    const args = {
      documento: body.documento,
      nombres: body.nombres,
      email: body.email,
      celular: body.celular,
    };
    return this.soap.registroCliente(args);
  }

  @Post('recarga')
  async recarga(@Body() body) {
    return this.soap.recargaBilletera({
      documento: body.documento,
      celular: body.celular,
      valor: body.valor,
    });
  }

  @Post('pagar')
  async pagar(@Body() body) {
    return this.soap.iniciarPago({
      documento: body.documento,
      celular: body.celular,
      valor: body.valor,
    });
  }

  @Post('confirmarPago')
  async confirmar(@Body() body) {
    return this.soap.confirmarPago({
      id_sesion: body.id_sesion,
      token: body.token,
    });
  }

  @Post('saldo')
  async saldo(@Body() body) {
    return this.soap.consultarSaldo({
      documento: body.documento,
      celular: body.celular,
    });
  }
}
