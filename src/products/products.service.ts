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
import { CategoryService } from '../category/category.service';
import { ImageService } from '../image/image.service';
import { SubscriptionTypesService } from '../subscription-types/subscription-types.service';
import { SubscriptionDurationsService } from '../subscription-durations/subscription-durations.service';
import { MongooseUtils } from '../common/utils/mongoose.utils';
import { CloudinaryService } from '../upload/cloudinary.service';
import { Category, CategoryDocument } from '../category/schemas/category.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService,
    private readonly subscriptionTypesService: SubscriptionTypesService,
    private readonly subscriptionDurationsService: SubscriptionDurationsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File
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

      // Upload ảnh lên Cloudinary nếu có
      if (file) {
        const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');
        data.image = imageUrl;
      }

      // Tạo sản phẩm mới
      const newProduct = new this.productModel(data);
      const savedProduct = await newProduct.save();

      return new ProductModel(savedProduct);
    } catch (error) {
      throw new BadRequestException(
        `Không thể tạo sản phẩm: ${error.message}`
      );
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
      console.log(id);
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
    file?: Express.Multer.File
  ): Promise<ProductModel> {
    try {
      // Chuyển đổi string ID sang ObjectId
      const updateData = MongooseUtils.convertToObjectIds(updateProductDto);

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

      // Handle file update
      if (file) {
        // Xóa ảnh cũ nếu tồn tại và là ảnh Cloudinary
        if (existingProduct.image && existingProduct.image.includes('cloudinary')) {
          const publicId = this.cloudinaryService.getPublicIdFromUrl(existingProduct.image);
          await this.cloudinaryService.deleteImage(publicId);
        }
        
        // Upload ảnh mới
        const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');
        updateData.image = imageUrl;
      }

      // Prepare update data
      const updateDataFinal = {
        ...updateData
      };

      // Remove undefined fields
      Object.keys(updateDataFinal).forEach(
        (key) => updateDataFinal[key] === undefined && delete updateDataFinal[key]
      );

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateDataFinal, { new: true })
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      return new ProductModel(updatedProduct);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Không thể cập nhật sản phẩm: ${error.message}`
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

      // Xóa ảnh sản phẩm từ Cloudinary nếu tồn tại
      if (product.image && product.image.includes('cloudinary')) {
        const publicId = this.cloudinaryService.getPublicIdFromUrl(product.image);
        await this.cloudinaryService.deleteImage(publicId);
      }

      const deletedProduct = await this.productModel.findByIdAndDelete(id);
      return new ProductModel(deletedProduct);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Không thể xóa sản phẩm: ${error.message}`
      );
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

  async updateProductImage(id: string, file: Express.Multer.File): Promise<ProductModel> {
    try {
      const product = await this.findById(id);
      
      // Xóa ảnh cũ nếu tồn tại và là ảnh Cloudinary
      if (product.image && product.image.includes('cloudinary')) {
        const publicId = this.cloudinaryService.getPublicIdFromUrl(product.image);
        await this.cloudinaryService.deleteImage(publicId);
      }
      
      // Upload ảnh mới
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'products');
      
      // Cập nhật sản phẩm với URL ảnh mới
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        { image: imageUrl },
        { new: true }
      ).exec();
      
      return new ProductModel(updatedProduct);
    } catch (error) {
      throw new BadRequestException(
        `Không thể cập nhật ảnh sản phẩm: ${error.message}`
      );
    }
  }

  async findByCategoryName(categoryName: string): Promise<ProductModel[]> {
    try {
      console.log(categoryName);
      // Tìm category theo tên
      const category = await this.categoryService.findByName(categoryName);
      if (!category) {
        throw new NotFoundException(`Không tìm thấy danh mục với tên: ${categoryName}`);
      }

      // Tìm tất cả sản phẩm thuộc category này
      const products = await this.productModel.find({ id_category: (category as CategoryDocument)._id })
        .populate('id_category')
        .populate('id_discount')
        .populate('id_inventory')
        .exec();

      return products.map(product => {
        const productData = {
          ...product.toObject(),
          price: product.base_price,
          desc: product.description
        };
        return ProductModel.fromEntity(productData);
      });
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Không thể tìm sản phẩm theo danh mục: ${error.message}`
      );
    }
  }
}
