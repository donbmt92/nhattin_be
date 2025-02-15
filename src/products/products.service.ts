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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File
  ): Promise<ProductModel> {
    try {
      // Validate ObjectIds
      if (!isValidObjectId(createProductDto.id_category)) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }

      if (
        createProductDto.id_discount &&
        !isValidObjectId(createProductDto.id_discount)
      ) {
        throw new BadRequestException('ID khuyến mãi không hợp lệ');
      }

      if (
        createProductDto.id_inventory &&
        !isValidObjectId(createProductDto.id_inventory)
      ) {
        throw new BadRequestException('ID kho hàng không hợp lệ');
      }

      // Check if category exists
      await this.categoryService.findOne(createProductDto.id_category);

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
        ...createProductDto,
        id_category: new Types.ObjectId(createProductDto.id_category),
        id_discount: createProductDto.id_discount
          ? new Types.ObjectId(createProductDto.id_discount)
          : undefined,
        id_inventory: createProductDto.id_inventory
          ? new Types.ObjectId(createProductDto.id_inventory)
          : undefined,
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
    try {
      const products = await this.productModel
        .find()
        .populate('id_category')
        .populate('id_discount')
        .populate('id_inventory')
        .exec();
      return ProductModel.fromEntities(products);
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy danh sách sản phẩm: ' + error.message
      );
    }
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

      return ProductModel.fromEntity(product);
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
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('ID sản phẩm không hợp lệ');
      }

      const product = await this.productModel
        .findById(new Types.ObjectId(id))
        .exec();

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      return ProductModel.fromEntity(product);
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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File
  ): Promise<ProductModel> {
    try {
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
        updateProductDto.id_category &&
        !isValidObjectId(updateProductDto.id_category)
      ) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }

      if (
        updateProductDto.id_discount &&
        !isValidObjectId(updateProductDto.id_discount)
      ) {
        throw new BadRequestException('ID khuyến mãi không hợp lệ');
      }

      if (
        updateProductDto.id_inventory &&
        !isValidObjectId(updateProductDto.id_inventory)
      ) {
        throw new BadRequestException('ID kho hàng không hợp lệ');
      }

      // Check if category exists if provided
      if (updateProductDto.id_category) {
        await this.categoryService.findOne(updateProductDto.id_category);
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
      const updateData = {
        ...updateProductDto,
        id_category: updateProductDto.id_category
          ? new Types.ObjectId(updateProductDto.id_category)
          : undefined,
        id_discount: updateProductDto.id_discount
          ? new Types.ObjectId(updateProductDto.id_discount)
          : undefined,
        id_inventory: updateProductDto.id_inventory
          ? new Types.ObjectId(updateProductDto.id_inventory)
          : undefined,
        image: imagePath,
        thumbnail: thumbnailPath
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(new Types.ObjectId(id), updateData, { new: true })
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
      await this.imageService.remove(product.image);

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
        .populate('id_discount')
        .populate('id_inventory')
        .exec();
      return ProductModel.fromEntities(products);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Không thể lấy danh sách sản phẩm theo danh mục: ' + error.message
      );
    }
  }
}
