import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';

@Injectable()
export class VerificationService {
  // constructor(private readonly puppeteer: puppeteer.Puppeteer) {}
  private browser: puppeteer.Browser;

  async initializeBrowser(): Promise<void> {
    const pathToExtension = require('path').join(__dirname, '2captcha-solver');
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
      executablePath: executablePath(),
    });
  }

  async closeBrowser(): Promise<void> {
    await this.browser.close();
  }

  async;
}
