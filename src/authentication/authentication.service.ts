import { clerkClient } from '@clerk/clerk-sdk-node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
  async generateToken(): Promise<any> {
    return await clerkClient.testingTokens.createTestingToken();
  }
}
