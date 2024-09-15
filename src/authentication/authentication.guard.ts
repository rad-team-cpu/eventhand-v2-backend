import { clerkClient } from '@clerk/clerk-sdk-node';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const bearerToken = req.headers.authorization?.replace('Bearer ', '');

    try {
      const verifiedToken = await clerkClient.verifyToken(bearerToken);
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }
}
