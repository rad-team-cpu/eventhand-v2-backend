import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response, response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { WebhookService } from './clerk.service';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

@Controller('clerk')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const WEBHOOK_SECRET = this.configService.get<string>('WEBHOOK_SECRET');
    if (!WEBHOOK_SECRET) {
      throw new Error('You need a WEBHOOK_SECRET in your .env');
    }

    const headers = req.headers;
    const payload = JSON.stringify(req.body);

    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Error occurred -- no svix headers',
      });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.log('Error verifying webhook:', err);
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: err,
      });
    }

    // Handle the webhook
    return (await this.webhookService.handleEvent(evt))
      ? response.status(201)
      : response.status(400);
  }
}
