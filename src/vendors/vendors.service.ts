import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FactorType } from './entities/factor.types';
import { UpdateVendorTagsDto } from './dto/update-vendor-tags.dto';
import { Tag } from 'src/tags/entities/tag.schema';
import { SelectedTagsDto, Selection } from './dto/selected-vendor-tags.dto';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';

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
    console.log(tags);
    const tagObjectIds = tags.map((tag) => new Types.ObjectId(tag));
    console.log(tagObjectIds);

    let query;

    switch (selection) {
      case Selection.And:
        // Match all tags (AND)
        query = {
          tags: {
            $all: tagObjectIds,
          },
        };
        console.log(query);
        break;

      case Selection.Or:
        // Match at least one tag (OR)
        query = {
          tags: { $in: tagObjectIds },
        };
        console.log(query);
        break;

      case Selection.Exclusive:
        // Match exactly these tags and no others
        query = {
          tags: tagObjectIds,
          $expr: { $eq: [{ $size: '$tags' }, tagObjectIds.length] },
        };
        console.log(query);
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

  // calculate credibility of vendor
  // we need to calculate credibility based on the following:
  // On a scale of 0 - 100, we weigh different
  // Branding: has a Logo, has a banner, has a bio
  // async calculateCredibility(id: string): Promise<void> {
  //   const vendor = await this.vendorModel.findById(id).exec();

  // Branding Present
  // const hasLogo = Number(Boolean(vendor.logo));
  // const hasBanner = Number(Boolean(vendor.banner));
  // const hasBio = Number(Boolean(vendor.bio));

  // const brandingScore = (hasLogo + hasBanner + hasBio) * 0.2; // Weighs 20%

  // Contact Details
  // const contactNumberValidated = false; // TBA
  // const emailIsValidated = false; // TBA
  // TBA;

  // Reviews
  // const reviews = await this.reviewsService.findSome({
  //   vendorId: vendor._id,
  // });

  // vendor.credibilityFactor;
  // vendor.save();
  //   return;
  // }
}
