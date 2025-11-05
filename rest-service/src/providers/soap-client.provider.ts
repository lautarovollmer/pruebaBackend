import * as soap from 'soap';

export const soapClientProvider = {
  provide: 'SOAP_CLIENT',
  useFactory: async () => {
    const url = process.env.SOAP_WSDL_URL || 'http://localhost:8001/wsdl?wsdl';
    const client = await soap.createClientAsync(url);

    return client;
  },
};
