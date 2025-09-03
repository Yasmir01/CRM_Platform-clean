import type { SignEnvelopeInput, SignEnvelopeResult, SignProvider } from '../provider';

export function helloSignProvider(): SignProvider {
  return {
    async createEnvelope(_input: SignEnvelopeInput): Promise<SignEnvelopeResult> {
      throw new Error('HelloSign provider not implemented');
    },
    async voidEnvelope(_envelopeId: string) {
      throw new Error('HelloSign provider not implemented');
    },
  };
}
