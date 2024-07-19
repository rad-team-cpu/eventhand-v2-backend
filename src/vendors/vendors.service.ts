import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FactorType } from './entities/factor.types';
import { UpdateVendorTagsDto } from './dto/update-vendor-tags.dto';
import { Tag, TagDocument } from 'src/tags/entities/tag.schema';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const { newTags, tags, ...vendor } = createVendorDto;

    const createdTags: Promise<Tag>[] = newTags.map(
      async (x) =>
        (await this.eventEmitter.emitAsync(
          'tags.new',
          x,
        )) as unknown as Promise<Tag>,
    );

    const result = await this.vendorModel.create({
      ...vendor,
      tags: { ...tags, ...createdTags },
    });

    return result;
  }

  async findAll(params?: FilterQuery<Vendor>): Promise<Vendor[]> {
    return await this.vendorModel.find(params).exec();
  }

  async findOne(filter: FilterQuery<Vendor>): Promise<Vendor> {
    const vendor = await this.vendorModel.findOne(filter).exec();
    console.log(vendor);

    if (!vendor) {
      throw new NotFoundException(`user with doesn't exist`);
    }

    return vendor;
  }

  async findOneWithPackages(vendorId: string): Promise<Vendor> {
    const result = await this.vendorModel
      .aggregate([
        {
          $match: { _id: new Types.ObjectId(vendorId) },
        },
        {
          $lookup: {
            from: 'packages',
            localField: '_id', //use that to search all vendorId
            foreignField: 'vendorId',
            as: 'packages',
          },
        },
      ])
      .exec();

    return result[0];
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findByIdAndUpdate(id, updateVendorDto)
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
    const vendorExists = await this.vendorModel.exists({ _id: id }).exec();

    if (!vendorExists) {
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
    const updatedTags = [
      ...tags.map((tag) => ({ _id: tag._id, name: tag.name })),
      ...createdTags.map((tag) => ({ _id: tag._id, name: tag.name })),
    ];

    const updatedVendor = await this.vendorModel
      .findByIdAndUpdate(id, { $set: { tags: updatedTags } }, { new: true })
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

    await this.calculateCredibility(vendorId);
  }

  // calculate credibility of vendor
  // we need to calculate credibility based on the following:
  // On a scale of 0 - 100, we weigh different
  // Branding: has a Logo, has a banner, has a bio
  async calculateCredibility(id: string): Promise<void> {
    const vendor = await this.vendorModel.findById(id).exec();

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
  }
}
