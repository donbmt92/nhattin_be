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

  /**
   * Tạo slug từ tên sản phẩm
   * @param name Tên sản phẩm
   * @returns Slug URL-friendly
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Tạo slug unique bằng cách thêm số nếu slug đã tồn tại
   * @param baseSlug Slug gốc
   * @param excludeId ID sản phẩm cần loại trừ (khi update)
   * @returns Slug unique
   */
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: any = { slug: slug };
      if (excludeId) {
        query._id = { $ne: new Types.ObjectId(excludeId) };
      }

      const existingProduct = await this.productModel.findOne(query);
      if (!existingProduct) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

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

      // Tạo slug tự động nếu không có slug được cung cấp
      if (!data.slug && data.name) {
        const baseSlug = this.generateSlug(data.name);
        data.slug = await this.generateUniqueSlug(baseSlug);
      } else if (data.slug) {
        // Nếu có slug được cung cấp, đảm bảo nó unique
        data.slug = await this.generateUniqueSlug(data.slug);
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

  async findBySlug(slug: string): Promise<ProductModel> {
    try {
      if (!slug || slug.trim() === '') {
        throw new BadRequestException('Slug không được để trống');
      }

      const product = await this.productModel.findOne({ slug: slug })
        .populate('id_category')
        .populate('id_discount')
        .populate('id_inventory')
        .exec();
        
      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với slug: ${slug}`);
      }
      
      // Ensure we have all necessary fields
      const productData = {
        ...product.toObject(),
        price: product.base_price, // Map base_price to price
        desc: product.description // Map description to desc
      };
      
      return ProductModel.fromEntity(productData);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể tìm sản phẩm theo slug: ' + error.message);
    }
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

      // Xử lý slug
      if (updateData.name && !updateData.slug) {
        // Nếu tên thay đổi nhưng không có slug mới, tạo slug từ tên mới
        const baseSlug = this.generateSlug(updateData.name);
        updateData.slug = await this.generateUniqueSlug(baseSlug, id);
      } else if (updateData.slug) {
        // Nếu có slug mới được cung cấp, đảm bảo nó unique
        updateData.slug = await this.generateUniqueSlug(updateData.slug, id);
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
      const category: any = await this.categoryService.findByName(categoryName);
      if (!category) {
        throw new NotFoundException(`Không tìm thấy danh mục với tên: ${categoryName}`);
      }

      // Tìm tất cả sản phẩm thuộc category này
      const products = await this.productModel.find({ id_category: category._id })
        .populate('id_category')
        .populate('id_discount')
        .populate('id_inventory')
        .exec();
      console.log(products);
      
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

  async findByName(query: string): Promise<ProductModel[]> {
    try {
      // Tìm sản phẩm theo tên, sử dụng regex để tìm kiếm gần đúng
      const products = await this.productModel.find({
        name: { $regex: query, $options: 'i' }
      })
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
      throw new BadRequestException(
        `Không thể tìm sản phẩm theo tên: ${error.message}`
      );
    }
  }

  async findByBrand(brandName: string): Promise<ProductModel[]> {
    try {
      // Lưu ý: Giả định rằng thương hiệu được lưu trong trường name của Category
      // Tìm danh mục tương ứng với thương hiệu
      const category: any = await this.categoryService.findByName(brandName);
      
      if (!category) {
        return []; // Trả về mảng rỗng nếu không tìm thấy thương hiệu
      }
      
      // Tìm sản phẩm theo ID của danh mục (thương hiệu)
      // Category document has _id field from MongoDB
      return this.findByCategory(category._id.toString());
    } catch (error) {
      // Xử lý trường hợp không tìm thấy danh mục (MessengeCode.CATEGORY.NOT_FOUND)
      if (error.code === 'CATEGORY_NOT_FOUND') {
        return [];
      }
      throw new BadRequestException(
        `Không thể tìm sản phẩm theo thương hiệu: ${error.message}`
      );
    }
  }

  async findWithFilters(filters: {
    query?: string,
    slug?: string,
    categoryName?: string,
    brand?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortDir?: string
  }): Promise<ProductModel[]> {
    try {
      // Xây dựng các điều kiện tìm kiếm
      const query: any = {};
      
      // Điều kiện tên sản phẩm
      if (filters.query) {
        query.name = { $regex: filters.query, $options: 'i' };
      }
      
      // Điều kiện slug
      if (filters.slug) {
        query.slug = { $regex: filters.slug, $options: 'i' };
      }
      
      // Điều kiện danh mục
      if (filters.categoryName) {
        try {
          const category: any = await this.categoryService.findByName(filters.categoryName);
          // Category document has _id field from MongoDB
          query.id_category = category._id;
        } catch (error) {
          // Bỏ qua lỗi nếu không tìm thấy danh mục
          if (error.code !== 'CATEGORY_NOT_FOUND') throw error;
        }
      }
      
      // Điều kiện giá
      if (filters.minPrice || filters.maxPrice) {
        query.base_price = {};
        if (filters.minPrice) query.base_price.$gte = filters.minPrice;
        if (filters.maxPrice) query.base_price.$lte = filters.maxPrice;
      }
      
      // Điều kiện thương hiệu (giả sử thương hiệu là một loại danh mục)
      if (filters.brand) {
        try {
          const brand: any = await this.categoryService.findByName(filters.brand);
          // Category document has _id field from MongoDB
          query.id_category = brand._id;
        } catch (error) {
          // Bỏ qua lỗi nếu không tìm thấy thương hiệu
          if (error.code !== 'CATEGORY_NOT_FOUND') throw error;
        }
      }
      
      // Xây dựng điều kiện sắp xếp
      const sortOptions: any = {};
      if (filters.sortBy) {
        // Ánh xạ các trường sortBy từ giao diện người dùng sang trường trong DB
        const sortField = filters.sortBy === 'price' ? 'base_price' : 
                         (filters.sortBy === 'date' ? 'createdAt' : 
                         (filters.sortBy === 'popularity' ? 'sold' : filters.sortBy));
        
        sortOptions[sortField] = filters.sortDir === 'desc' ? -1 : 1;
      } else {
        sortOptions.createdAt = -1; // Mặc định sắp xếp theo thời gian tạo mới nhất
      }
      
      // Thực hiện truy vấn
      const products = await this.productModel.find(query)
        .sort(sortOptions)
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
      throw new BadRequestException(
        `Không thể tìm sản phẩm với bộ lọc: ${error.message}`
      );
    }
  }

  /**
   * Kiểm tra trạng thái slug của các sản phẩm hiện tại
   */
  async checkSlugStatus(): Promise<{
    total: number;
    withSlug: number;
    withoutSlug: number;
    productsWithoutSlug: Array<{ id: string; name: string }>;
  }> {
    try {
      const totalProducts = await this.productModel.countDocuments();
      const productsWithSlug = await this.productModel.countDocuments({
        $and: [
          { slug: { $exists: true } },
          { slug: { $ne: null } },
          { slug: { $ne: '' } }
        ]
      });
      const productsWithoutSlug = await this.productModel.find({
        $or: [
          { slug: { $exists: false } },
          { slug: null },
          { slug: '' }
        ]
      }).select('_id name').lean();

      return {
        total: totalProducts,
        withSlug: productsWithSlug,
        withoutSlug: productsWithoutSlug.length,
        productsWithoutSlug: productsWithoutSlug.map(p => ({
          id: p._id.toString(),
          name: p.name
        }))
      };
    } catch (error) {
      throw new BadRequestException('Không thể kiểm tra trạng thái slug: ' + error.message);
    }
  }

  /**
   * Tạo slug cho tất cả sản phẩm cũ chưa có slug
   * Method này chỉ nên chạy một lần để migrate dữ liệu cũ
   */
  async generateSlugsForExistingProducts(): Promise<{ updated: number; errors: string[] }> {
    try {
      const products = await this.productModel.find({ 
        $or: [
          { slug: { $exists: false } },
          { slug: null },
          { slug: '' }
        ]
      });

      let updated = 0;
      const errors: string[] = [];

      for (const product of products) {
        try {
          if (product.name) {
            const baseSlug = this.generateSlug(product.name);
            const uniqueSlug = await this.generateUniqueSlug(baseSlug);
            
            await this.productModel.findByIdAndUpdate(
              product._id,
              { slug: uniqueSlug }
            );
            
            updated++;
            console.log(`Updated product ${product._id}: ${product.name} -> ${uniqueSlug}`);
          }
        } catch (error) {
          errors.push(`Product ${product._id}: ${error.message}`);
        }
      }

      return { updated, errors };
    } catch (error) {
      throw new BadRequestException('Không thể tạo slug cho sản phẩm cũ: ' + error.message);
    }
  }
}
