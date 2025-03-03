/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductModel } from './model/product.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { CategoryService } from '../category/category.service';
import { ImageService } from '../image/image.service';
import { CreateImageDto } from '../image/dto/create-image.dto';
import { SubscriptionTypesService } from '../subscription-types/subscription-types.service';
import { SubscriptionDurationsService } from '../subscription-durations/subscription-durations.service';
import { MongooseUtils } from '../common/utils/mongoose.utils';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService,
    private readonly subscriptionTypesService: SubscriptionTypesService,
    private readonly subscriptionDurationsService: SubscriptionDurationsService
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File
  ): Promise<ProductModel> {
    try {
      // Chuyển đổi string ID sang ObjectId
      const data = MongooseUtils.convertToObjectIds(createProductDto);

      // Validate ObjectIds
      if (!isValidObjectId(data.id_category)) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }

      if (
        data.id_discount &&
        !isValidObjectId(data.id_discount)
      ) {
        throw new BadRequestException('ID khuyến mãi không hợp lệ');
      }

      if (
        data.id_inventory &&
        !isValidObjectId(data.id_inventory)
      ) {
        throw new BadRequestException('ID kho hàng không hợp lệ');
      }

      // Check if category exists
      await this.categoryService.findOne(data.id_category);

      // Validate and save file
      if (!file) {
        throw new BadRequestException('File ảnh là bắt buộc');
      }

      // Save image first
      const savedImage = await this.imageService.create(
        { type: 'product' } as CreateImageDto,
        file
      );

      // Create product with validated ObjectIds and saved image
      const createdProduct = new this.productModel({
        ...data,
        image: savedImage.link,
        thumbnail: savedImage.thumbnail
      });

      const savedProduct = await createdProduct.save();
      return ProductModel.fromEntity(savedProduct);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error === MessengeCode.PRODUCT.NOT_FOUND) {
        throw new NotFoundException('Không tìm thấy danh mục');
      }
      throw new BadRequestException('Không thể tạo sản phẩm: ' + error.message);
    }
  }

  async findAll(): Promise<ProductModel[]> {
    const products = await this.productModel.find()
      .populate('id_category')
      .populate('id_discount')
      .populate('id_inventory')
      .exec();
    
    return products.map(product => {
      // Ensure we have all necessary fields
      const productData = {
        ...product.toObject(),
        price: product.base_price, // Map base_price to price
        desc: product.description // Map description to desc
      };
      return ProductModel.fromEntity(productData);
    });
  }

  async findOne(id: string): Promise<ProductModel> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('ID sản phẩm không hợp lệ');
      }

      const product = await this.productModel
        .findById(new Types.ObjectId(id))
        .populate('id_category')
        .populate('id_discount')
        .populate('id_inventory')
        .exec();

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Ensure we have all necessary fields
      const productData = {
        ...product.toObject(),
        price: product.base_price, // Map base_price to price
        desc: product.description // Map description to desc
      };
      
      return ProductModel.fromEntity(productData);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể tìm sản phẩm: ' + error.message);
    }
  }

  async findById(id: string): Promise<ProductModel> {
    const product = await this.productModel.findById(id)
      .populate('id_category')
      .populate('id_discount')
      .populate('id_inventory')
      .exec();
      
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Ensure we have all necessary fields
    const productData = {
      ...product.toObject(),
      price: product.base_price, // Map base_price to price
      desc: product.description // Map description to desc
    };
    
    return ProductModel.fromEntity(productData);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File
  ): Promise<ProductModel> {
    try {
      // Chuyển đổi string ID sang ObjectId
      const updateData = MongooseUtils.convertToObjectIds(updateProductDto);

      // Validate product ID
      if (!isValidObjectId(id)) {
        throw new BadRequestException('ID sản phẩm không hợp lệ');
      }

      // Get existing product
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Validate other ObjectIds if provided
      if (
        updateData.id_category &&
        !isValidObjectId(updateData.id_category)
      ) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }

      if (
        updateData.id_discount &&
        !isValidObjectId(updateData.id_discount)
      ) {
        throw new BadRequestException('ID khuyến mãi không hợp lệ');
      }

      if (
        updateData.id_inventory &&
        !isValidObjectId(updateData.id_inventory)
      ) {
        throw new BadRequestException('ID kho hàng không hợp lệ');
      }

      // Check if category exists if provided
      if (updateData.id_category) {
        await this.categoryService.findOne(updateData.id_category);
      }

      // Handle file update
      let imagePath = existingProduct.image;
      let thumbnailPath = existingProduct.thumbnail;
      if (file) {
        // Save new image
        const savedImage = await this.imageService.create(
          { type: 'product' } as CreateImageDto,
          file
        );
        imagePath = savedImage.link;
        thumbnailPath = savedImage.thumbnail;
      }

      // Prepare update data
      const updateDataFinal = {
        ...updateData,
        id_category: updateData.id_category
          ? new Types.ObjectId(updateData.id_category)
          : undefined,
        id_discount: updateData.id_discount
          ? new Types.ObjectId(updateData.id_discount)
          : undefined,
        id_inventory: updateData.id_inventory
          ? new Types.ObjectId(updateData.id_inventory)
          : undefined,
        image: imagePath,
        thumbnail: thumbnailPath
      };

      // Remove undefined fields
      Object.keys(updateDataFinal).forEach(
        (key) => updateDataFinal[key] === undefined && delete updateDataFinal[key]
      );

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(new Types.ObjectId(id), updateDataFinal, { new: true })
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      return ProductModel.fromEntity(updatedProduct);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Không thể cập nhật sản phẩm: ' + error.message
      );
    }
  }

  async remove(id: string): Promise<ProductModel> {
    try {
      
      if (!isValidObjectId(id)) {
        throw new BadRequestException('ID sản phẩm không hợp lệ');
      }

      const product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Delete product image from images collection
      if (product.image) {
        await this.imageService.removeByLink(product.image);
      }

      // Delete product
      const deletedProduct = await this.productModel
        .findByIdAndDelete(new Types.ObjectId(id))
        .exec();
      
      return ProductModel.fromEntity(deletedProduct);
    } catch (error) {
      console.log('Không thể xóa sản phẩm: ' + error);
      throw new BadRequestException('Không thể xóa sản phẩm: ' + error.message);
    }
  }

  async findByCategory(categoryId: string): Promise<ProductModel[]> {
    try {
      if (!isValidObjectId(categoryId)) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }

      const products = await this.productModel
        .find({ id_category: new Types.ObjectId(categoryId) })
        .populate('id_category')
        .populate('id_discount')
        .populate('id_inventory')
        .exec();
      
      return products.map(product => {
        // Ensure we have all necessary fields
        const productData = {
          ...product.toObject(),
          price: product.base_price, // Map base_price to price
          desc: product.description // Map description to desc
        };
        return ProductModel.fromEntity(productData);
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Không thể lấy danh sách sản phẩm theo danh mục: ' + error.message
      );
    }
  }

  async getProductDetails(id: string): Promise<any> {
    const product = await this.findById(id);
    
    // Lấy danh sách loại gói đăng ký của sản phẩm
    const subscriptionTypes = await this.subscriptionTypesService.findByProductId(id);
    
    // Lấy danh sách thời hạn gói đăng ký của sản phẩm
    const subscriptionDurations = await this.subscriptionDurationsService.findByProductId(id);
     
    return {
      ...product,
      subscription_types: subscriptionTypes,
      subscription_durations: subscriptionDurations
    };
  }
}
