import type { SignEnvelopeInput, SignEnvelopeResult, SignProvider } from '../provider';

export function mockProvider(): SignProvider {
  return {
    async createEnvelope(input: SignEnvelopeInput): Promise<SignEnvelopeResult> {
      const id = `mock_${Date.now()}`;
      const signUrl = `/sign/mock/${encodeURIComponent(id)}?title=${encodeURIComponent(input.title)}`;
      return { envelopeId: id, signUrl, status: 'created' };
    },
    async voidEnvelope(envelopeId: string) {
      // no-op for mock
    },
  };
}
