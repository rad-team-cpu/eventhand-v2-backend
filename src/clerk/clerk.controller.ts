import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request, Response, response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { WebhookService } from './clerk.service';

@Controller('clerk')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post('/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>): Promise<Response> {
    const payload = req.rawBody.toString('utf-8');
    const headers = {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    };

    const wh = new Webhook(
      this.configService.get<string>('clerk.webhookSecret'),
    );
    const evt = wh.verify(payload, headers) as WebhookEvent;
    // Handle the webhook
    return (await this.webhookService.handleEvent(evt))
      ? response.status(201)
      : response.status(400);
  }
}
