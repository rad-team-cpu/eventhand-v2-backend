import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { getModelToken } from '@nestjs/mongoose';
import { Tag } from './entities/tag.schema';
import { Model } from 'mongoose';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

describe('TagsService', () => {
  let service: TagsService;
  let model: Model<Tag>;

  const mockTag = {
    _id: 'someId',
    name: 'Test Tag',
    description: 'Test Description',
  };

  const mockTagModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getModelToken(Tag.name),
          useValue: mockTagModel,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    model = module.get<Model<Tag>>(getModelToken(Tag.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const createTagDto: CreateTagDto = {
        name: 'New Tag',
        description: 'New Description',
      };
      mockTagModel.create.mockResolvedValue(mockTag);

      const result = await service.create(createTagDto);
      expect(result).toEqual(mockTag);
      expect(mockTagModel.create).toHaveBeenCalledWith(createTagDto);
    });

    it('should throw an error if creation fails', async () => {
      const createTagDto: CreateTagDto = {
        name: 'New Tag',
        description: 'New Description',
      };
      const error = new Error('Creation failed');
      mockTagModel.create.mockRejectedValue(error);

      await expect(service.create(createTagDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const tags = [mockTag];
      mockTagModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(tags),
      });

      const result = await service.findAll();
      expect(result).toEqual(tags);
      expect(mockTagModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single tag', async () => {
      mockTagModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTag),
      });

      const result = await service.findOne('someId');
      expect(result).toEqual(mockTag);
      expect(mockTagModel.findById).toHaveBeenCalledWith('someId');
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const updateTagDto: UpdateTagDto = { name: 'Updated Tag' };
      mockTagModel.findByIdAndUpdate.mockResolvedValue({
        ...mockTag,
        ...updateTagDto,
      });

      const result = await service.update('someId', updateTagDto);
      expect(result).toEqual({ ...mockTag, ...updateTagDto });
      expect(mockTagModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'someId',
        updateTagDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tag', async () => {
      mockTagModel.findByIdAndDelete.mockResolvedValue(mockTag);

      const result = await service.remove('someId');
      expect(result).toEqual(mockTag);
      expect(mockTagModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
    });
  });
});
