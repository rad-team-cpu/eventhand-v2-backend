// // users.controller.spec.ts
// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { NotFoundException } from '@nestjs/common';

// describe('UsersController', () => {
//   let controller: UsersController;
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [
//         {
//           provide: UsersService,
//           useValue: {
//             findByClerkId: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<UsersController>(UsersController);
//     service = module.get<UsersService>(UsersService);
//   });

//   describe('findUserByClerkId', () => {
//     it('should return the user when found', async () => {
//       const clerkId = 'clerk123';
//       const expectedUser = { id: 1, clerkId, name: 'John Doe' };
//       service.findByClerkId.mockResolvedValueOnce(expectedUser);

//       const result = await controller.findUserByClerkId(clerkId);

//       expect(service.findByClerkId).toHaveBeenCalledWith(clerkId);
//       expect(result).toEqual(expectedUser);
//     });

//     it('should throw NotFoundException when user is not found', async () => {
//       const clerkId = 'clerk456';
//       service.findByClerkId.mockResolvedValueOnce(null);

//       await expect(controller.findUserByClerkId(clerkId)).rejects.toThrowError(
//         NotFoundException,
//       );
//       expect(service.findByClerkId).toHaveBeenCalledWith(clerkId);
//     });

//     it('should throw any other exception from the service', async () => {
//       const clerkId = 'clerk789';
//       const error = new Error('Something went wrong');
//       service.findByClerkId.mockRejectedValueOnce(error);

//       await expect(controller.findUserByClerkId(clerkId)).rejects.toThrowError(
//         error,
//       );
//       expect(service.findByClerkId).toHaveBeenCalledWith(clerkId);
//     });
//   });
// });
