import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { PaymentSession } from '../entities/payment-session.entity';
import { v4 as uuidv4 } from 'uuid';
import { sendTokenMail } from '../utils/mailer';
import { SoapResponse } from '../dto/common.dto';

export class WalletService {
  constructor(private dataSource: DataSource) {}

  private get userRepo() {
    return this.dataSource.getRepository(User);
  }
  private get walletRepo() {
    return this.dataSource.getRepository(Wallet);
  }
  private get sessionRepo() {
    return this.dataSource.getRepository(PaymentSession);
  }

  async registroCliente(
    documento: string,
    nombres: string,
    email: string,
    celular: string,
  ): Promise<SoapResponse> {
    if (!documento || !nombres || !email || !celular) {
      return {
        success: false,
        cod_error: '01',
        message_error: 'Campos requeridos faltantes',
      };
    }
    const existing = await this.userRepo.findOneBy({ documento });
    if (existing)
      return {
        success: false,
        cod_error: '03',
        message_error: 'Documento ya registrado',
      };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = this.userRepo.create({ documento, nombres, email, celular });
      const savedUser = await queryRunner.manager.save(user);
      const wallet = this.walletRepo.create({
        userId: savedUser.id,
        balance: 0,
      });
      await queryRunner.manager.save(wallet);
      await queryRunner.commitTransaction();
      return {
        success: true,
        cod_error: '00',
        message_error: 'OK',
        data: { userId: savedUser.id, documento, nombres, email, celular },
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return {
        success: false,
        cod_error: '07',
        message_error: 'Error interno al registrar cliente',
      };
    } finally {
      await queryRunner.release();
    }
  }

  async recargaBilletera(
    documento: string,
    celular: string,
    valor: number,
  ): Promise<SoapResponse> {
    if (!documento || !celular || valor == null)
      return {
        success: false,
        cod_error: '01',
        message_error: 'Campos requeridos faltantes',
      };
    const user = await this.userRepo.findOneBy({ documento });
    if (!user || user.celular !== celular)
      return {
        success: false,
        cod_error: '02',
        message_error: 'Usuario no encontrado o celular no coincide',
      };

    const wallet = await this.walletRepo.findOneBy({ userId: user.id });
    if (!wallet)
      return {
        success: false,
        cod_error: '07',
        message_error: 'Wallet no encontrada',
      };

    wallet.balance = Number(wallet.balance) + Number(valor);
    await this.walletRepo.save(wallet);
    return {
      success: true,
      cod_error: '00',
      message_error: 'Recarga exitosa',
      data: { newBalance: wallet.balance },
    };
  }

  private generateToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async iniciarPago(
    documento: string,
    celular: string,
    valor: number,
  ): Promise<SoapResponse> {
    if (!documento || !celular || valor == null)
      return {
        success: false,
        cod_error: '01',
        message_error: 'Campos requeridos faltantes',
      };
    const user = await this.userRepo.findOneBy({ documento });
    if (!user || user.celular !== celular)
      return {
        success: false,
        cod_error: '02',
        message_error: 'Usuario no encontrado o celular no coincide',
      };

    const wallet = await this.walletRepo.findOneBy({ userId: user.id });
    if (!wallet)
      return {
        success: false,
        cod_error: '07',
        message_error: 'Wallet no encontrada',
      };

    if (Number(wallet.balance) < Number(valor))
      return {
        success: false,
        cod_error: '04',
        message_error: 'Saldo insuficiente',
      };

    const token = this.generateToken();
    const id_sesion = uuidv4();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const session = this.sessionRepo.create({
      id: id_sesion,
      userId: user.id,
      amount: valor,
      token,
      status: 'PENDING',
      expires_at,
    });

    await this.sessionRepo.save(session);

    try {
      const previewUrl = await sendTokenMail(user.email, token);
      return {
        success: true,
        cod_error: '00',
        message_error: 'Token enviado al email',
        data: { id_sesion, previewEmailUrl: previewUrl },
      };
    } catch (e) {
      // Opcional: eliminar session si falló el mail
      await this.sessionRepo.delete({ id: id_sesion });
      return {
        success: false,
        cod_error: '05',
        message_error: 'Error al enviar email',
      };
    }
  }

  async confirmarPago(id_sesion: string, token: string): Promise<SoapResponse> {
    if (!id_sesion || !token)
      return {
        success: false,
        cod_error: '01',
        message_error: 'Campos requeridos faltantes',
      };

    const session = await this.sessionRepo.findOneBy({ id: id_sesion });
    if (!session)
      return {
        success: false,
        cod_error: '06',
        message_error: 'Sesión no encontrada',
      };
    if (session.status !== 'PENDING')
      return {
        success: false,
        cod_error: '06',
        message_error: 'Sesión no válida',
      };
    if (session.expires_at.getTime() < Date.now()) {
      session.status = 'EXPIRED';
      await this.sessionRepo.save(session);
      return {
        success: false,
        cod_error: '06',
        message_error: 'Sesión expirada',
      };
    }
    if (session.token !== token)
      return {
        success: false,
        cod_error: '06',
        message_error: 'Token inválido',
      };

    // Transacción: restar saldo y marcar confirmado
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const wallet = await queryRunner.manager.findOneBy(Wallet, {
        userId: session.userId,
      });
      if (!wallet) throw new Error('Wallet no encontrada');
      if (Number(wallet.balance) < Number(session.amount)) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          cod_error: '04',
          message_error: 'Saldo insuficiente',
        };
      }
      wallet.balance = Number(wallet.balance) - Number(session.amount);
      await queryRunner.manager.save(wallet);

      session.status = 'CONFIRMED';
      await queryRunner.manager.save(session);

      await queryRunner.commitTransaction();
      return {
        success: true,
        cod_error: '00',
        message_error: 'Pago confirmado',
        data: { newBalance: wallet.balance },
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return {
        success: false,
        cod_error: '07',
        message_error: 'Error interno al confirmar pago',
      };
    } finally {
      await queryRunner.release();
    }
  }

  async consultarSaldo(
    documento: string,
    celular: string,
  ): Promise<SoapResponse> {
    if (!documento || !celular)
      return {
        success: false,
        cod_error: '01',
        message_error: 'Campos requeridos faltantes',
      };
    const user = await this.userRepo.findOneBy({ documento });
    if (!user || user.celular !== celular)
      return {
        success: false,
        cod_error: '02',
        message_error: 'Usuario no encontrado o celular no coincide',
      };
    const wallet = await this.walletRepo.findOneBy({ userId: user.id });
    if (!wallet)
      return {
        success: false,
        cod_error: '07',
        message_error: 'Wallet no encontrada',
      };

    return {
      success: true,
      cod_error: '00',
      message_error: 'OK',
      data: { balance: wallet.balance },
    };
  }
}
