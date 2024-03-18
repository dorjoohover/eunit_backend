import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types, isValidObjectId } from 'mongoose';
import { AdStatus, AdTypes, AdView } from 'src/utils/enum';
import {
  Ad,
  AdDocument,
  Category,
  CategoryDocument,
  User,
  UserDocument,
} from 'src/schema';
import { CategoryService } from '../category/category.service';
import { AdDto, FilterDto } from './ad.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class AdService {
  constructor(
    @InjectModel(Ad.name) private model: Model<AdDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private categoryService: CategoryService,
  ) {}

  async createAd(dto: AdDto, user: string) {
    let prevAd = await this.model
      .find({}, null, { sort: { num: -1 } })
      .limit(1);

    let adNum = 1;

    if (prevAd) adNum = prevAd?.[0]?.num + 1;

    if (isNaN(adNum)) adNum = 1;
    try {
      let ad = await this.model.create({
        num: adNum,
        user: user,
        images: dto.images,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        category: dto.category,
        subCategory: dto.subCategory,
        sellType: dto.sellType,
        items: dto.items,
        adType: dto.adType,
        adStatus: dto.adStatus,
        image: dto.image,
        file: dto.file,
        view: dto.view,
      });
      await this.userModel.findByIdAndUpdate(user, {
        $push: { ads: ad._id },
      });
      if (ad.adType == AdTypes.sharing) {
        await this.userModel.findByIdAndUpdate(user, {
          $inc: { point: 10000 },
        });
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 500);
    }
    return true;
  }

  async getAds(
    num: number,
    limit: number,
    view: boolean,
    type: AdTypes,
    isType: boolean,
    status: AdStatus,
  ) {
    const body =
      isType && view
        ? {
            view: AdView.show,
            adType:
              type == AdTypes.default
                ? { $in: [AdTypes.default, AdTypes.sharing] }
                : type,
            adStatus:
              status == AdStatus.all
                ? {
                    $nin: [
                      AdStatus.deleted,
                      AdStatus.sold,
                      AdStatus.timed,
                      AdStatus.checking,
                      AdStatus.returned,
                    ],
                  }
                : status,
          }
        : isType
          ? {
              adStatus:
                status == AdStatus.all
                  ? {
                      $nin: [
                        AdStatus.deleted,
                        AdStatus.sold,
                        AdStatus.timed,
                        AdStatus.checking,
                        AdStatus.returned,
                      ],
                    }
                  : status,
              adType: type,
            }
          : view
            ? {
                view: AdView.show,
                adStatus:
                  status == AdStatus.all
                    ? {
                        $nin: [
                          AdStatus.deleted,
                          AdStatus.sold,
                          AdStatus.timed,
                          AdStatus.checking,
                        ],
                      }
                    : status,
              }
            : {
                adStatus:
                  status == AdStatus.all
                    ? {
                        $nin: [AdStatus.deleted, AdStatus.sold, AdStatus.timed],
                      }
                    : status,
                adType: { $ne: AdTypes.sharing },
              };
    let ads = await this.model
      .find(body, null, { sort: { updatedAt: -1 } })
      .populate('user', 'id phone email username profileImg', this.userModel)
      .populate('category', 'id name', this.categoryModel)
      .populate('subCategory', 'id name', this.categoryModel)
      .limit(limit)
      .skip(num * limit);
    let l = await this.model.find(body).countDocuments();
    if (!ads) throw new HttpException('not found ads', HttpStatus.BAD_REQUEST);
    return { ads: ads, limit: l };
  }

  async getAdsExcel(type: AdTypes) {
    let ads: { id: string; ads: any[] }[] = [];
    await this.model
      .find({
        adType: type == 'all' ? { $ne: AdTypes.sharing } : type,
      })
      .populate('subCategory', 'id name', this.categoryModel)
      .populate('category', 'id name', this.categoryModel)
      .select('-location -title -description -view -user -views -__v -images')
      .then((d) => {
        d.map((ad) => {
          let fixedAd = {
            adType: ad.adType,
            type: ad.sellType,
          };
          ad.items.map((item) => {
            fixedAd[item.name] = item.value;
          });
          fixedAd['num'] = ad.num;
          fixedAd['date'] = ad['createdAt'];
          if (
            ads.length == 0 ||
            ads?.find((a) => a.id == ad.subCategory['name'].toString()) ==
              undefined
          ) {
            ads.push({
              id: ad.subCategory['name'].toString(),
              ads: [fixedAd],
            });
          } else {
            let selectedAd = ads.filter(
              (a) => a.id == ad.subCategory['name'].toString(),
            )[0];
            selectedAd.ads.push(fixedAd);
          }
        });
      });
    return ads;
  }
  async updateStatusTimed() {
    const date = Date.now();
    const deletedDate = date - 3 * 24 * 60 * 60 * 1000;
    const lateDate = date - 30 * 24 * 60 * 60 * 1000;
    const specialDate = date - 5 * 24 * 60 * 60 * 1000;
    const specialMediumDate = date - 10 * 24 * 60 * 60 * 1000;

    await this.model.updateMany(
      {
        $or: [
          {
            $and: [
              { updatedAt: { $lt: specialDate } },
              { adStatus: AdStatus.created },
              { adType: AdTypes.special },
            ],
          },
          {
            $and: [
              { updatedAt: { $lt: specialMediumDate } },
              { adStatus: AdStatus.created },
              { adType: AdTypes.specialM },
            ],
          },
        ],
      },
      {
        $set: { adType: AdTypes.default },
      },
    );
    await this.model.updateMany(
      {
        $and: [
          { updatedAt: { $lt: lateDate } },
          { adType: AdTypes.default },
          { adStatus: AdStatus.created },
        ],
      },
      {
        $set: { adStatus: AdStatus.deleted },
      },
    );
    await this.model.updateMany(
      {
        $and: [
          { updatedAt: { $lt: deletedDate } },
          { adStatus: AdStatus.deleted },
        ],
      },
      {
        $set: { adStatus: AdStatus.timed },
      },
    );
  }

  async updateTypeAd(id: string, type: AdTypes, isTrue: boolean) {
    try {
      if (isTrue) {
        let ad = await this.model.findByIdAndUpdate(id, {
          adType: type,
        });
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new HttpException(err, 500);
    }
  }

  async getAdsByUserId(id: string) {
    try {
      let ads = await this.model
        .find({
          user: id,
          adStatus: 'created',
        })
        .sort({ createdAt: 'desc' });
      return { ads };
    } catch (error) {
      throw new HttpException('server error', 500);
    }
  }
  async updateStatusAd(
    id: string,
    status: AdStatus,
    view: AdView,
    user: string,
    isAdmin: boolean,
    message?: string,
  ) {
    try {
      if (isAdmin) {
        if (status == AdStatus.returned) {
          let ad = await this.model.findByIdAndUpdate(id, {
            adStatus: status,
            view: view,
            returnMessage: message ?? '',
          });
          return ad;
        } else {
          let ad = await this.model.findByIdAndUpdate(id, {
            adStatus: status,
            view: view,
          });
          return ad;
        }
      } else {
        let ad = await this.model.findOne({ _id: id, user: user });
        ad.adStatus = status;
        ad.view = view;
        ad.save();
        return ad;
      }
    } catch (error) {
      throw new HttpException('server error', 500);
    }
  }

  async addAdView(id: string, userId: string) {
    let ad = await this.model.findById(id);
    if (
      ad.views.find((a) => a.toString() == userId) == undefined &&
      ad.user.toString() != userId
    ) {
      await this.model.findByIdAndUpdate(ad._id, {
        $push: { views: userId },
      });
      return ad.views.length + 1;
    }
  }

  async searchAd(value: string) {
    try {
      let defaultAds = await this.model.find({
        $text: { $search: value },
        isView: true,
        adType: AdTypes.default,
      });

      let specialAds = await this.model.find({
        $text: { $search: value },
        isView: true,
        adType: AdTypes.special,
      });

      if (!defaultAds || !specialAds) throw new HttpException('not found', 403);
      return {
        defaultAds: {
          ads: defaultAds,
          limit: defaultAds.length,
        },
        specialAds: {
          ads: specialAds,
          limit: specialAds.length,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getManyAds(
    dto: {
      dto: string[];
      cateId?: string;
    },
    num: number,
    type: AdTypes,
    isView: boolean,
    l: number,
    status: AdStatus,
  ) {
    let ads = [],
      limit = 0;
    let isNum = false;
    if (!isValidObjectId(dto.dto?.[0])) isNum = true;
    
    try {
      let body = isView
        ? {
            $and: [
              {
                $or: [
                  {
                    subCategory:
                      dto.cateId == undefined
                        ? { $ne: '641c932bf60152dbf901c070' }
                        : dto.cateId,
                  },
                  {
                    category:
                      dto.cateId == undefined
                        ? { $ne: '641c932bf60152dbf901c070' }
                        : dto.cateId,
                  },
                ],
              },
             isNum ?{ num: { $in: dto.dto }}  : { _id: { $in: dto.dto } },
              { view: { $ne: AdView.end } },
              { adType: type == AdTypes.all ? { $nin: [AdTypes.all] } : type },

              {
                adStatus:
                  status == AdStatus.all
                    ? {
                        $nin: [
                          AdStatus.deleted,
                          AdStatus.sold,
                          AdStatus.timed,
                          AdStatus.checking,
                          AdStatus.returned,
                        ],
                      }
                    : status,
              },
            ],
          }
        : {
            $and: [
              {
                _id: { $in: dto },
              },
              {
                $or: [
                  {
                    subCategory:
                      dto.cateId == undefined
                        ? { $ne: '641c932bf60152dbf901c070' }
                        : dto.cateId,
                  },
                  {
                    category:
                      dto.cateId == undefined
                        ? { $ne: '641c932bf60152dbf901c070' }
                        : dto.cateId,
                  },
                ],
              },

              { view: AdView.show },
              { adType: type == 'all' ? { $nin: [AdTypes.sharing] } : type },
              {
                adStatus:
                  status == 'all'
                    ? {
                        $nin: [
                          AdStatus.deleted,
                          AdStatus.sold,
                          AdStatus.timed,
                          AdStatus.checking,
                          AdStatus.returned,
                        ],
                      }
                    : status,
              },
            ],
          };
      ads = await this.model
        .find(body)
        .populate('category', 'id name', this.categoryModel)
        .populate('subCategory', 'id name', this.categoryModel)
        .limit((num + 1) * l)
        .skip(num * l)
        .sort({ updatedAt: 'desc' });
      limit = await this.model.find(body).countDocuments();
      return {
        ads: ads,
        limit: limit,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 500);
    }

    if (!ads) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return { ads, limit };
  }
  async getAdById(id: string) {
    try {
      let ad = await this.model
        // .findOne({ num: id, isView: true })
        .findOne({ num: id })
        .populate(
          'subCategory',
          'id name subCategory href english  suggestionItem isSearch',
          this.categoryModel,
        )
        .populate(
          'user',
          'phone username email profileImg userType',
          this.userModel,
        );
      if (!ad) throw new ForbiddenException('not found ad');
      return ad;
    } catch (error) {
      console.log(error);
      throw new HttpException('server error', 500);
    }
  }
  async getAdsCount(dto: string[]) {
    try {
      return await this.model
        .find({
          _id: { $in: dto },
          adStatus: { $nin: [AdStatus.sold, AdStatus.timed] },
        })
        .countDocuments();
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getAdByCategoryId(id: string, num: number) {
    try {
      let category = await this.categoryModel.findOne({ href: id });

      let defaultAds = await this.model
        .find({
          $or: [
            {
              subCategory: category._id,
            },
            { category: category._id },
          ],
          view: AdView.show,
          adType: { $in: [AdTypes.default, AdTypes.sharing] },
          adStatus: {
            $nin: [
              AdStatus.deleted,
              AdStatus.sold,
              AdStatus.timed,
              AdStatus.checking,
            ],
          },
        })
        .populate('category', 'id name', this.categoryModel)
        .populate('subCategory', 'id name', this.categoryModel)
        .populate(
          'user',
          'phone username email profileImg userType',
          this.userModel,
        )
        .limit((num + 1) * 20)
        .skip(num * 20)
        .sort({ updatedAt: 'desc' });

      let specialAds = await this.model
        .find({
          $or: [{ subCategory: category._id }, { category: category._id }],
          view: AdView.show,
          adType: AdTypes.special,
          adStatus: {
            $nin: [
              AdStatus.deleted,
              AdStatus.sold,
              AdStatus.timed,
              AdStatus.checking,
            ],
          },
        })
        .populate('category', 'id name', this.categoryModel)
        .populate('subCategory', 'id name', this.categoryModel)
        .populate(
          'user',
          'phone username email profileImg userType',
          this.userModel,
        )
        .limit((num + 1) * 20)
        .skip(num * 20)
        .sort({ updatedAt: 'desc' });

      if (!defaultAds) throw new ForbiddenException('not found default ad');
      if (!specialAds) throw new ForbiddenException('not found special ad');

      return {
        defaultAds: {
          ads: defaultAds,
          limit: defaultAds.length,
        },
        specialAds: {
          ads: specialAds,
          limit: specialAds.length,
        },
      };
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  // filter
  async filterAd(
    dto: FilterDto,
    num: number,
    limit: number,
    type: AdTypes,
    cateId: string,
  ) {
    try {
      let cate = [
        {
          subCategory:
            cateId == '' ? { $ne: '641c932bf60152dbf901c070' } : cateId,
        },
        {
          category: cateId == '' ? { $ne: '641c932bf60152dbf901c070' } : cateId,
        },
      ];
      let items =
        dto.items?.length > 0
          ? dto.items.map((d) => ({
              'items.id': d.id,
              'items.value':
                d.value != undefined ? d.value : { $gte: d.min, $lte: d.max },
            }))
          : [...[{ 'items.id': { $ne: '' } }]];
      const body = {
        $and: [{ $or: cate }, { $or: items }],
        view: AdView.show,
        adStatus: {
          $nin: [
            AdStatus.deleted,
            AdStatus.sold,
            AdStatus.timed,
            AdStatus.checking,
          ],
        },
        adType: type == AdTypes.all ? { $ne: AdTypes.all } : type,

        sellType: dto.types.length > 0 ? { $in: dto.types } : { $nin: [] },
      };
      let ads = await this.model
        .find(body)
        .limit(num * limit)
        .skip((num == 0 ? 0 : num - 1) * limit)
        .sort({ updatedAt: 'desc' });
      let l = await this.model.find(body).countDocuments();

      return { ads: ads, limit: l };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async updateAd(id: string, dto: AdDto) {
    try {
      return await this.model.findByIdAndUpdate(id, {
        images: dto.images,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        sellType: dto.sellType,
        items: dto.items,
        adStatus: AdStatus.pending,
        image: dto.image,
        file: dto.file,
        view: dto.view,
      });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async delete() {
    return await this.model.deleteMany();
  }
}
