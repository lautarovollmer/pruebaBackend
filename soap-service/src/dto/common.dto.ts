export interface SoapResponse<T = any> {
  success: boolean;
  cod_error: string;
  message_error: string;
  data?: T;
}
