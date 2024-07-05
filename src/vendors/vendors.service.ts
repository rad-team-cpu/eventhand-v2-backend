import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
// import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ReviewsService } from 'src/reviews/reviews.service';
import { OnEvent } from '@nestjs/event-emitter';
import { FactorType } from './entities/factor.types';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    private readonly reviewsService: ReviewsService,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorModel.create(createVendorDto);
  }

  async findAll(): Promise<Vendor[]> {
    return await this.vendorModel.find().exec();
  }

  async findOne(filter: FilterQuery<Vendor>): Promise<Vendor> {
    const vendor = await this.vendorModel.findOne(filter).exec();

    if (!vendor) {
      throw new NotFoundException(`user with doesn't exist`);
    }

    return vendor;
  }

  // update(id: number, updateVendorDto: UpdateVendorDto) {
  //   return `This action updates a #${id} vendor`;
  // }

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
        $set: { `credibilityFactors.${scoreType}`: score },
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
