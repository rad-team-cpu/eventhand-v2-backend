import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
@Injectable()
export class VerificationService {
  // constructor(private readonly puppeteer: puppeteer.Puppeteer) {}
  private browser: puppeteer.Browser;

  async initializeBrowser(): Promise<void> {}

  async closeBrowser(): Promise<void> {
    await this.browser.close();
  }
}
