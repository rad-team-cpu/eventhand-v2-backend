import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly eventEmiter: EventEmitter2) {}

  async handleEvent(evt: WebhookEvent): Promise<string> {
    switch (evt.type) {
      case 'user.created': {
        const {
          id,
          first_name,
          last_name,
          email_addresses,
          gender,
          phone_numbers,
          image_url,
        } = evt.data;

        return this.eventEmiter.emitAsync('user.created', {
          clerkId: id,
          firstName: first_name,
          lastName: last_name,
          contactNumber: phone_numbers[0]?.phone_number,
          email: email_addresses[0]?.email_address,
          profilePicture: image_url,
        } as CreateUserDto)
          ? `New User ${id} created`
          : `failed to create new user`;
      }
    }
    return `event type: ${evt.type} unsupported`;
  }
}
