import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductModel } from './model/product.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductModel> {
    // Kiểm tra category tồn tại
    await this.categoryService.findOne(createProductDto.id_category);

    const createdProduct = new this.productModel({
      ...createProductDto,
      id_category: new Types.ObjectId(createProductDto.id_category),
      id_discount: createProductDto.id_discount ? new Types.ObjectId(createProductDto.id_discount) : undefined,
      id_inventory: createProductDto.id_inventory ? new Types.ObjectId(createProductDto.id_inventory) : undefined,
    });

    const savedProduct = await createdProduct.save();
    return ProductModel.fromEntity(savedProduct);
  }

  async findAll(): Promise<ProductModel[]> {
    const products = await this.productModel
      .find()
      .populate('id_category')
      .populate('id_discount')
      .populate('id_inventory')
      .exec();
    return ProductModel.fromEntities(products);
  }

  async findOne(id: string): Promise<ProductModel> {
    const product = await this.productModel
      .findById(new Types.ObjectId(id))
      .populate('id_category')
      .populate('id_discount')
      .populate('id_inventory')
      .exec();

    if (!product) {
      throw MessengeCode.PRODUCT.NOT_FOUND;
    }

    return ProductModel.fromEntity(product);
  }
  async findById(id: string): Promise<ProductModel> {
    const product = await this.productModel.findById(new Types.ObjectId(id)).exec();
    if (!product) {
      throw MessengeCode.PRODUCT.NOT_FOUND;
    }
    return ProductModel.fromEntity(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductModel> {
    if (updateProductDto.id_category) {
      await this.categoryService.findOne(updateProductDto.id_category);
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          ...updateProductDto,
          id_category: updateProductDto.id_category ? new Types.ObjectId(updateProductDto.id_category) : undefined,
          id_discount: updateProductDto.id_discount ? new Types.ObjectId(updateProductDto.id_discount) : undefined,
          id_inventory: updateProductDto.id_inventory ? new Types.ObjectId(updateProductDto.id_inventory) : undefined,
        },
        { new: true }
      )
      .exec();

    if (!updatedProduct) {
      throw MessengeCode.PRODUCT.NOT_FOUND;
    }

    return ProductModel.fromEntity(updatedProduct);
  }

  async remove(id: string): Promise<ProductModel> {
    const deletedProduct = await this.productModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedProduct) {
      throw MessengeCode.PRODUCT.NOT_FOUND;
    }

    return ProductModel.fromEntity(deletedProduct);
  }

  async findByCategory(categoryId: string): Promise<ProductModel[]> {
    const products = await this.productModel
      .find({ id_category: new Types.ObjectId(categoryId) })
      .populate('id_discount')
      .populate('id_inventory')
      .exec();
    return ProductModel.fromEntities(products);
  }
} 