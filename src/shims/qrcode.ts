// ESM/CJS interop shim for 'qrcode'
// Some environments import default, but qrcode may not export default.
// This shim ensures a default export is available.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as QRCodeNS from 'qrcode';
const QRCode: any = (QRCodeNS as any)?.default || QRCodeNS;
export default QRCode;
export * from 'qrcode';
