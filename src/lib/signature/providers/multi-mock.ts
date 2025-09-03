import type { MultiEnvelopeInput, MultiEnvelopeResult, MultiSignProvider, SignEnvelopeInput, SignEnvelopeResult } from '../provider';

export function multiMockProvider(): MultiSignProvider {
  return {
    async createEnvelope(input: SignEnvelopeInput): Promise<SignEnvelopeResult> {
      const envelopeId = `mm_${Date.now()}`;
      return { envelopeId, signUrl: `/sign/mock/${envelopeId}`, status: 'created' };
    },
    async voidEnvelope(_envelopeId: string) {},
    async createEnvelopeMulti(input: MultiEnvelopeInput): Promise<MultiEnvelopeResult> {
      const envelopeId = `mm_${Date.now()}`;
      const signerLinks = input.signers.map((s) => ({ email: s.email, url: `/sign/mock/${envelopeId}/${encodeURIComponent(s.email)}` }));
      return { envelopeId, signerLinks, status: 'created' };
    },
  };
}
