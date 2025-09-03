import type { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

let _browser: Browser | null = null;

export async function getBrowser() {
  if (_browser) return _browser;
  const puppeteer = await import('puppeteer-core');
  const exePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const useLambda = !!process.env.AWS_REGION;
  _browser = await puppeteer.launch(useLambda ? {
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  } : {
    headless: 'new' as any,
    executablePath: exePath,
  });
  return _browser;
}

export async function htmlToPdfBytes(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
  });
  await page.close();
  return pdf as unknown as Uint8Array;
}
