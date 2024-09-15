import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FactorType } from './entities/factor.types';
import { UpdateVendorTagsDto } from './dto/update-vendor-tags.dto';
import { Tag } from 'src/tags/entities/tag.schema';
import { SelectedTagsDto, Selection } from './dto/selected-vendor-tags.dto';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';
import { format } from 'date-fns';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const { newTags = [], tags = [], ...vendor } = createVendorDto;

    const createdTags = (await this.eventEmitter.emitAsync(
      'tags.new',
      newTags as CreateTagDto[],
    )) as unknown as Tag[];

    const result = await this.vendorModel.create({
      ...vendor,
      visibility: false,
      tags: [...tags, ...createdTags.map((tag) => tag._id)],
    });

    return this.findOne({ _id: result.id });
  }

  async findAll(query?: FilterQuery<Vendor>): Promise<Vendor[]> {
    return await this.vendorModel
      .find(query)
      .populate('tags', 'name')
      .populate('bookings')
      .exec();
  }

  async findAllByTags(selectedTagsDto: SelectedTagsDto): Promise<Vendor[]> {
    const { tags = [], selection } = selectedTagsDto;
    const tagObjectIds = tags.map((tag) => new Types.ObjectId(tag));

    let query;

    switch (selection) {
      case Selection.And:
        // Match all tags (AND)
        query = {
          tags: {
            $all: tagObjectIds,
          },
        };
        break;

      case Selection.Or:
        // Match at least one tag (OR)
        query = {
          tags: { $in: tagObjectIds },
        };
        break;

      case Selection.Exclusive:
        // Match exactly these tags and no others
        query = {
          tags: tagObjectIds,
          $expr: { $eq: [{ $size: '$tags' }, tagObjectIds.length] },
        };
        break;

      default:
        throw new Error('Invalid selection type');
    }

    return this.vendorModel.find(query).populate('tags', 'name').exec();
  }

  async findOne(query: FilterQuery<Vendor>): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findOne(query)
      .populate('tags', 'name')
      .populate('bookings')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`user with doesn't exist`);
    }

    return vendor;
  }

  private async aggregate(pipelines: PipelineStage[]): Promise<any> {
    const result = await this.vendorModel.aggregate(pipelines);
    return result;
  }

  async search(query: string = ''): Promise<any> {
    const lookupWithSearch: PipelineStage[] = [
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
          pipeline: [
            {
              $search: {
                index: 'default',
                text: {
                  query: query,
                  path: ['name'],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'vendorPackages',
          localField: '_id',
          foreignField: 'vendorId',
          pipeline: [
            {
              $search: {
                index: 'packages',
                text: {
                  query: query,
                  path: ['name'],
                },
              },
            },
          ],
          as: 'packages',
        },
      },
    ];

    const result = await this.aggregate(lookupWithSearch);
    return result;
  }

  async findOneWithPackages(vendorId: string): Promise<Vendor> {
    const result = await this.vendorModel
      .findById(vendorId)
      .populate('tags', 'name')
      .populate('packages')
      .populate('bookings')
      .exec();

    return result;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findByIdAndUpdate(id, updateVendorDto, { new: true })
      .populate('tags', 'name')
      .exec();

    if (!vendor) {
      throw new NotFoundException(`user with doesn't exist`);
    }

    return vendor;
  }

  async updateTags(
    id: string,
    updateVendorTagsDto: UpdateVendorTagsDto,
  ): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(id).exec();

    if (!vendor) {
      throw new NotFoundException(`user with doesn't exist`);
    }

    const { tags = [], newTags = [] } = updateVendorTagsDto;

    let createdTags: Tag[] = [];

    if (newTags.length > 0) {
      createdTags = (
        await this.eventEmitter.emitAsync('tags.new', newTags)
      ).flat();
    }

    // Flatten and normalize the structure of all tags
    const updatedTags = [...tags, ...createdTags];

    // Update Vendor
    const updatedVendor = await this.vendorModel
      .findByIdAndUpdate(id, { $set: { tags: updatedTags } }, { new: true })
      .populate('tags', 'name')
      .exec();

    return updatedVendor;
  }

  async remove(filter: FilterQuery<Vendor>): Promise<Vendor> {
    return await this.vendorModel.findOneAndDelete(filter).exec();
  }

  @OnEvent('factor.updated')
  async updateScore(
    vendorId: string,
    scoreType: FactorType,
    score: number,
  ): Promise<void> {
    await this.vendorModel
      .findByIdAndUpdate(vendorId, {
        $set: { [`credibilityFactors.${scoreType}`]: score },
      })
      .exec();

    // await this.calculateCredibility(vendorId);
  }

  async getVendorsWithRatings(clerkId: string, tagId: string) {
    const today = format(new Date(), 'eeee').toUpperCase(); // Get current day of the week in uppercase
    const tagObjectId = new Types.ObjectId(tagId);

    const vendors = await this.aggregate([
      {
        // Filter vendors by clerkId and ensure they are not blocked on the current day
        $match: {
          clerkId: { $ne: clerkId },
          visibility: true,
          blockedDays: { $nin: [today] },
        },
      },
      {
        // Lookup VendorPackages by vendorId and filter by package tag
        $lookup: {
          from: 'vendorPackages',
          localField: '_id',
          foreignField: 'vendorId',
          as: 'packages',
        },
      },
      {
        $unwind: {
          path: '$packages',
        },
      },
      {
        // Filter packages by tagId
        $match: {
          'packages.tags': tagObjectId,
        },
      },
      {
        // Lookup reviews for the vendor
        $lookup: {
          from: 'vendorReviews',
          localField: '_id',
          foreignField: 'vendorId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          // Calculate the average rating from reviews (1-5 only)
          averageRating: {
            $avg: {
              $filter: {
                input: '$reviews.rating',
                as: 'rating',
                cond: {
                  $and: [{ $gte: ['$$rating', 1] }, { $lte: ['$$rating', 5] }],
                },
              },
            },
          },
        },
      },
      {
        // Group by vendor ID to avoid duplicates
        $group: {
          _id: '$_id', // Group by vendor ID
          name: { $first: '$name' }, // Take the first name for each group
          logo: { $first: '$logo' }, // Take the first logo for each group
          averageRating: { $first: '$averageRating' }, // Take the first average rating
        },
      },
      {
        // Group to return vendor id, name, logo, and average rating
        $project: {
          _id: 1,
          name: 1,
          logo: 1,
          averageRating: 1,
        },
      },
    ]);

    return vendors;
  }

  async getRealVendors() {
    const regex = new RegExp(`^user_`);

    const vendors = await this.vendorModel
      .aggregate([
        {
          $match: {
            clerkId: { $regex: regex, $options: 'i' },
            visibility: true,
          },
        },
        {
          $lookup: {
            from: 'vendorPackages',
            localField: '_id',
            foreignField: 'vendorId',
            as: 'packages',
          },
        },
        {
          $unwind: {
            path: '$packages',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'vendorReviews',
            localField: '_id',
            foreignField: 'vendorId',
            as: 'reviews',
          },
        },
        {
          $addFields: {
            averageRating: {
              $avg: {
                $filter: {
                  input: '$reviews.rating',
                  as: 'rating',
                  cond: {
                    $and: [
                      { $gte: ['$$rating', 1] },
                      { $lte: ['$$rating', 5] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            logo: { $first: '$logo' },
            averageRating: { $first: '$averageRating' },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            logo: 1,
            averageRating: 1,
          },
        },
      ])
      .exec();

    return vendors;
  }

  async getVendorWithPackagesAndTags(vendorId: string) {
    try {
      const vendor = await this.vendorModel
        .aggregate([
          {
            $match: { _id: new Types.ObjectId(vendorId) },
          },
          {
            $lookup: {
              from: 'vendorPackages',
              localField: '_id',
              foreignField: 'vendorId',
              as: 'packages',
            },
          },
          {
            $lookup: {
              from: 'vendorReviews',
              localField: '_id',
              foreignField: 'vendorId',
              as: 'reviews',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'reviews.clientId',
              foreignField: '_id',
              as: 'clients',
            },
          },
          {
            $addFields: {
              allTagIds: {
                $reduce: {
                  input: {
                    $map: {
                      input: '$packages',
                      as: 'package',
                      in: { $ifNull: ['$$package.tags', []] },
                    },
                  },
                  initialValue: [],
                  in: { $concatArrays: ['$$value', '$$this'] },
                },
              },
            },
          },
          {
            $addFields: {
              allTagIds: {
                $cond: {
                  if: { $isArray: '$allTagIds' },
                  then: { $setUnion: ['$allTagIds', []] },
                  else: [],
                },
              },
            },
          },
          {
            $lookup: {
              from: 'tags',
              let: { tagIds: '$allTagIds' },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ['$_id', '$$tagIds'] },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                  },
                },
              ],
              as: 'tagDetails',
            },
          },
          {
            $addFields: {
              tags: {
                $map: {
                  input: '$allTagIds',
                  as: 'tagId',
                  in: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$tagDetails',
                          as: 'tag',
                          cond: { $eq: ['$$tag._id', '$$tagId'] },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
          {
            $addFields: {
              averageRatings: {
                $avg: {
                  $filter: {
                    input: '$reviews.rating',
                    as: 'rating',
                    cond: {
                      $and: [
                        { $gte: ['$$rating', 1] },
                        { $lte: ['$$rating', 5] },
                      ],
                    },
                  },
                },
              },
              totalBookings: {
                $size: {
                  $ifNull: [
                    {
                      $filter: {
                        input: '$bookings',
                        as: 'booking',
                        cond: { $eq: ['$$booking.status', 'CONFIRMED'] },
                      },
                    },
                    [],
                  ],
                },
              },
              reviews: {
                $map: {
                  input: '$reviews',
                  as: 'review',
                  in: {
                    id: '$$review._id',
                    client: {
                      id: '$$review.clientId',
                      name: {
                        $let: {
                          vars: {
                            clientData: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: '$clients',
                                    as: 'client',
                                    cond: {
                                      $eq: [
                                        '$$client._id',
                                        '$$review.clientId',
                                      ],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            $concat: [
                              '$$clientData.firstName',
                              ' ',
                              '$$clientData.lastName',
                            ],
                          },
                        },
                      },
                    },
                    comment: '$$review.comment',
                    rating: '$$review.rating',
                    package: '$$review.package',
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              logo: 1,
              bio: 1,
              address: 1,
              email: 1,
              tags: 1,
              packages: 1,
              reviews: 1,
              averageRatings: 1,
              totalBookings: 1,
            },
          },
        ])
        .exec();

      // Error handling for vendor not found
      console.log(vendor[0].tags);
      if (!vendor || vendor.length === 0) {
        throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
      }

      return vendor[0]; // Return the first result since it's expected to be unique
    } catch (error) {
      // Handle specific mongoose errors or throw generic internal error
      console.log(error);
      // if (error instanceof mongoose.Error.CastError) {
      //   throw new NotFoundException(`Invalid vendor ID format`);
      // }
      // throw new InternalServerErrorException(
      //   'An error occurred while retrieving the vendor',
      // );
    }
  }
}
