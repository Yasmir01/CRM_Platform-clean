export type SignEnvelopeInput = {
  envelopeId?: string;
  title: string;
  html: string;
  tenantEmail: string;
  tenantName: string;
  ccEmails?: string[];
  redirectUrl?: string;
};

export type SignEnvelopeResult = {
  envelopeId: string;
  signUrl: string;
  status: 'created' | 'sent';
};

export interface SignProvider {
  createEnvelope(input: SignEnvelopeInput): Promise<SignEnvelopeResult>;
  voidEnvelope(envelopeId: string): Promise<void>;
}

export async function getSignProvider(): Promise<SignProvider> {
  const provider = (process.env.SIGN_PROVIDER || 'mock').toLowerCase();
  if (provider === 'hellosign') {
    const mod = await import('./providers/hellosign');
    return mod.helloSignProvider();
  }
  const mod = await import('./providers/mock');
  return mod.mockProvider();
}
