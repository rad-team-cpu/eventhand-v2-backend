import { clerkClient } from '@clerk/clerk-sdk-node';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { BookingService } from './booking.service';

@Injectable()
export class BookingOwnershipGuard implements CanActivate {
  [x: string]: any;
  constructor(private readonly bookingsService: BookingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const req = context.switchToHttp().getRequest();
    const bookingId = request.params.id;

    try {

        const booking = await this.bookingsService.getClerkIds(bookingId);


        if (!booking) {
            throw new ForbiddenException('Booking not found');
        }

    if ( request.role === 'VENDOR' && booking.vendorClerkId !== request.clerkId) {
      throw new ForbiddenException('You do not own this booking');
    }

    if  ( request.role === 'CLIENT' && booking.clientClerkId !== request.clerkId) {
      throw new ForbiddenException('You do not own this booking');
    }
        console.log("verified")

      } catch (err) {
        console.log(err);
      }


    return true;
  }
}