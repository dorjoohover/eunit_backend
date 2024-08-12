import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  ActionMessage,
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  ItemPosition,
  ItemTypes,
} from '../../utils/enum';
import {
  Ad,
  AdDocument,
  Category,
  CategoryDocument,
  User,
  UserDocument,
} from '../../schema';
import { CategoryService } from '../category/category.service';
import { AdDataDto, AdDto, AdRequired, FilterDto } from './dto/ad.dto';
import {
  AdAlreadyExists,
  AdNotFound,
  AdWrongExists,
} from './ad.exists.exception';
import { ObjectId } from 'mongodb';
import { CategoryNotFound } from '../category/category.exits.exception';

@Injectable()
export class AdService {
  constructor(
    @InjectModel(Ad.name) private model: Model<AdDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createAd(dto: AdDto, user: string) {
    if (!AdRequired(dto)) throw new AdWrongExists();
    let prevAd = await this.model
      .find({}, null, { sort: { num: -1 } })
      .limit(1);

    let adNum = 1;

    if (prevAd) adNum = prevAd?.[0]?.num + 1;

    if (isNaN(adNum)) adNum = 1;
    let ad = await this.model.findOne({
      $or: [
        {
          num: adNum,
        },
        {
          $and: [
            {
              title: dto.title,
              description: dto.description,
              location: dto.location,
            },
          ],
        },
      ],
    });
    if (ad) throw new AdAlreadyExists();
    ad = await this.model.create({
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

    return {
      success: true,
      status: 201,
      id: ad._id,
      message: ActionMessage.success,
    };
  }

  async uploadData(dto: AdDataDto) {
    // let adNum = Number(`${Date.now()}`);
    // const ad = await this.model.create({
    //   num: adNum,
    //   user: new ObjectId('65fd0fdd141800e0a6619a5a'),
    //   images: [],
    //   title: dto.title,
    //   description: dto.description,
    //   location: dto.location,
    //   category: new ObjectId('63f212d2742b202a77c109d5'),
    //   subCategory: dto.subCategory,
    //   sellType: dto.sellType,
    //   items: dto.items,
    //   adType: dto.adType,
    //   adStatus: dto.adStatus,
    //   image: dto.image,
    //   file: dto.file,
    //   view: dto.view,
    //   createdAt: dto.date,
    // });

    return {
      success: true,
      id: '',
    };
  }
  async getAds(
    num: number,
    limit: number,
    view: boolean,
    type: AdTypes,
    isType: boolean,
    status: AdStatus,
    length: number,
    cateId?: string,
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
      .find(
        {
          ...body,
          $or: [
            {
              subCategory:
                cateId == undefined
                  ? { $ne: '641c932bf60152dbf901c070' }
                  : cateId,
            },
            {
              category:
                cateId == undefined
                  ? { $ne: '641c932bf60152dbf901c070' }
                  : cateId,
            },
          ],
        },
        null,
        { sort: { updatedAt: -1 } },
      )
      .populate('user', 'id phone email username profileImg', this.userModel)
      .populate('category', 'id name', this.categoryModel)
      .populate('subCategory', 'id name', this.categoryModel)
      .limit(limit)
      .skip(num * limit);

    let l =
      length == 0
        ? await this.model
            .find({
              ...body,
              $or: [
                {
                  subCategory:
                    cateId == undefined
                      ? { $ne: '641c932bf60152dbf901c070' }
                      : cateId,
                },
                {
                  category:
                    cateId == undefined
                      ? { $ne: '641c932bf60152dbf901c070' }
                      : cateId,
                },
              ],
            })
            .countDocuments()
        : length;
    if (!ads) throw new AdNotFound();
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

    if (ads.length == 0 || !ads) throw new AdNotFound();
    return ads;
  }
  async updateNum() {
    const ads = await this.model.find();
    for (let i = 0; i < ads.length; i++) {
      let items = ads[i].items;
      if (i == 2) break;
      items.map((item) => {
        let i = item;
        let id = i.id;
        let name = i.name;
        let value = i.value;
        let types = ItemTypes.dropdown;
        let position = ItemPosition.default;
        let index = 1;
        let search = true;
        let use = true;
        if (id == 'price') {
          types = ItemTypes.text;
          position = ItemPosition.side;
          index = 0;
        }
        if (id == 'buildingProcess') {
          types = ItemTypes.text;
          index = 5;
          search = false;
        }
        if (id == 'area') {
          types = ItemTypes.text;
          index = -1;
          position = ItemPosition.any;
        }
        if (id == 'floor') {
          index = 10;
        }
        if (id == 'operation') {
          index = 2;
          types = ItemTypes.date;
        }
        if (id == 'garage') {
          index = 11;
        }
        if (id == 'windowUnit') {
          index = 7;
        }
        if (id == 'paymentMethod') {
          index = 12;
        }
        if (id == 'location') {
          index = 1;
          i = { ...i, other: true };
        }
        if (id == 'landUsage') {
          index = 2;
        }
        if (id == 'howFloor') {
          index = 4;
          i = { ...i, parentId: 'buildingFloor' };
        }
        if (id == 'balcony') {
          index = 9;
          name = 'Тагтны тоо';
          value = value.toString().split(' ')?.[0] ?? 'Тагтгүй';
          id = 'balconyUnit';
        }
        let nothing = ['title', 'description'];
        if (!nothing.includes(i.id))
          i = {
            isUse: use,
            id: id,
            isSearch: search,
            index: index,
            name: name,
            value: value,
            position: position,
            type: types,
            ...i,
          };
        return i;
      });
      console.log(ads[i].items[0].index);
      console.log(i, ads[i].id);
      ads[i].save();
    }
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
    if (
      !(
        id &&
        Object.values(AdStatus).includes(status) &&
        Object.values(AdView).includes(view)
      )
    )
      throw new AdWrongExists();
    if (isAdmin) {
      if (status == AdStatus.returned) {
        let ad = await this.model.findByIdAndUpdate(id, {
          adStatus: status,
          view: view,
          returnMessage: message ?? '',
        });

        return {
          success: true,
          id: ad._id,
          status: 201,
          message: ActionMessage.success,
        };
      } else {
        let ad = await this.model.findByIdAndUpdate(id, {
          adStatus: status,
          view: view,
        });

        return {
          success: true,
          id: ad._id,
          status: 201,
          message: ActionMessage.success,
        };
      }
    } else {
      let ad = await this.model.findOne({ _id: id, user: user });
      ad.adStatus = status;
      ad.view = view;
      ad.save();
      return {
        success: true,
        id: ad._id,
        status: 201,
        message: ActionMessage.success,
      };
    }
  }

  async addAdView(id: string, userId: string) {
    let ad = await this.model.findById(id);
    if (!ad) throw new AdNotFound();
    if (
      ad.views.find((a) => a.toString() == userId) == undefined &&
      ad.user.toString() != userId
    ) {
      await this.model.findByIdAndUpdate(ad._id, {
        $push: { views: userId },
      });
      return {
        success: true,
        id: id,
        length: ad.views.length + 1,
        messagse: ActionMessage.success,
      };
    }
    return {
      success: false,
      message: 'Already registered',
    };
  }

  async searchAd(
    value: string,
    type: AdTypes,
    limit: number,
    page: number,
    length: number,
  ) {
    const body = {
      title: { $regex: value, $options: 'i' },
      view: AdView.show,
      adType: type == AdTypes.all ? { $ne: AdTypes.all } : type,
    };
    let ads = await this.model
      .find(body, null, { sort: { createdAt: -1 } })
      .limit(limit)
      .skip(page * limit);
    const l =
      length == 0 ? await this.model.find(body).countDocuments() : length;
    if (!ads || ads.length == 0) throw new AdNotFound();

    return {
      ads: ads,
      length: l,
    };
  }

  async getManyAds(
    dto: {
      dto?: string[];
      cateId?: string;
    },
    num: number,
    type: AdTypes,
    isView: boolean,
    l: number,
    status: AdStatus,
    length: number,
  ) {
    let ads = [],
      limit = 0;
    let isNum = false;
    if (!isValidObjectId(dto.dto?.[0])) isNum = true;
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
            isNum ? { num: { $in: dto.dto } } : { _id: { $in: dto.dto ?? [] } },
            { view: { $ne: AdView.end } },
            {
              adType:
                type == AdTypes.all
                  ? { $nin: [AdTypes.all, AdTypes.sharing] }
                  : type,
            },

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
    limit = length == 0 ? await this.model.find(body).countDocuments() : length;
    if (!ads || ads.length == 0) throw new AdNotFound();
    return {
      ads: ads,
      limit: limit,
    };
  }
  async getAdById(id: string) {
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
    if (!ad) throw new AdNotFound();
    return ad;
  }
  async getAdsCount(dto: string[]) {
    let ads = await this.model
      .find({
        _id: { $in: dto },
        adStatus: { $nin: [AdStatus.sold, AdStatus.timed] },
      })
      .countDocuments();
    if (!ads || ads == 0) throw new AdNotFound();
    return ads;
  }

  async getAdByCategoryId(
    id: string,
    num: number,
    limit: number,
    type: AdTypes,
    length: number,
  ) {
    let category = await this.categoryModel.findOne({ href: id });
    if (!category) throw new CategoryNotFound();
    const body = {
      $or: [
        {
          subCategory: category._id,
        },
        { category: category._id },
      ],
      view: AdView.show,
      adType:
        type == AdTypes.default
          ? { $in: [AdTypes.default, AdTypes.sharing] }
          : AdTypes.special,
      adStatus: {
        $nin: [
          AdStatus.deleted,
          AdStatus.sold,
          AdStatus.timed,
          AdStatus.checking,
        ],
      },
    };
    const ads = await this.model
      .find(body)
      .populate('category', 'id name', this.categoryModel)
      .populate('subCategory', 'id name', this.categoryModel)
      .populate(
        'user',
        'phone username email profileImg userType',
        this.userModel,
      )
      .limit((num + 1) * limit)
      .skip(num * limit)
      .sort({ updatedAt: 'desc' });

    if (!ads) throw new AdNotFound();
    const l =
      length == 0 ? await this.model.find(body).countDocuments() : length;
    return { ads: ads, limit: l };
  }
  async suggestAd(
    id: string,
    suggest: {
      id: string;
      value: string;
    },
    l: number,
    page: number,
  ) {
    let ad = await this.model.findById(id);
    if (!ad) throw new AdNotFound();
    let ads = [];
    let body = {};
    let limit = 0;
    let sellType =
      ad.sellType == AdSellType.sellRent
        ? [AdSellType.rent, AdSellType.sell, AdSellType.sellRent]
        : [ad.sellType, AdSellType.sellRent];
    if (suggest.id == 'map') {
      body = {
        view: AdView.show,
        subCategory: ad.subCategory,
      };
    } else {
      body = {
        view: AdView.show,
        items: { $elemMatch: { id: suggest.id, value: suggest.value } },
      };
    }

    body = {
      ...body,
      _id: { $ne: ad._id },
      adStatus: AdStatus.created,
      sellType: sellType,
      adType: { $nin: [AdTypes.sharing] },
    };
    ads = await this.model.find(body).limit(l).skip(page);

    return {
      ads: ads,
      limit: l,
    };
  }
  // filter
  async filterAd(
    dto: FilterDto,
    num: number,
    limit: number,
    type: AdTypes,
    length: number,
  ) {
    const categoryId = isValidObjectId(dto.cateId);

    const category = await this.categoryModel.findOne(
      categoryId ? { _id: new ObjectId(dto.cateId) } : { href: dto.cateId },
    );
    if (!category && dto.cateId != '') throw new CategoryNotFound();
    let cate = [
      {
        subCategory:
          dto.cateId == '' ? { $ne: '641c932bf60152dbf901c070' } : category._id,
      },
      {
        category:
          dto.cateId == '' ? { $ne: '641c932bf60152dbf901c070' } : category._id,
      },
    ];
    let items =
      dto.items?.length > 0
        ? dto.items.map((d) => ({
            $and: [
              {
                'items.id': d.id,
              },
              {
                'items.value':
                  d.value != undefined ? d.value : { $gte: d.min, $lte: d.max },
              },
            ],
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
      adType: type === AdTypes.all ? { $ne: AdTypes.all } : type,

      sellType:
        dto.sellTypes.length > 0
          ? { $in: [...dto.sellTypes, AdSellType.sellRent] }
          : { $nin: [] },
    };
    let ads = await this.model
      .find(body)
      .limit(limit)
      .skip(num * limit)
      .sort({ updatedAt: 'desc' });
    let l = length == 0 ? await this.model.find(body).countDocuments() : length;

    return { ads: ads, limit: l };
  }

  async getMyAds(
    num: number,
    limit: number,
    cate: string,
    status: AdStatus,
    length: number,
    type: AdTypes,
    user: string,
  ) {
    const body = {
      user: user,
      adStatus: status,
      $or: [
        {
          category: cate == ' ' ? { $ne: '641c932bf60152dbf901c070' } : cate,
        },
        {
          subCategory: cate == ' ' ? { $ne: '641c932bf60152dbf901c070' } : cate,
        },
      ],
      type:
        type == AdTypes.all ? { $nin: [AdTypes.all, AdTypes.sharing] } : type,
    };

    const ads = await this.model
      .find(body, {}, { num: -1 })
      .limit(limit)
      .skip(num * limit);
    if (!ads) throw new AdNotFound();
    const l =
      length == 0 ? await this.model.find(body).countDocuments() : length;
    return {
      ads: ads,
      limit: l,
    };
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
    const res = await this.model.deleteMany();
    return {
      success: true,
      message: ActionMessage.success,
      status: 200,
    };
  }
}
