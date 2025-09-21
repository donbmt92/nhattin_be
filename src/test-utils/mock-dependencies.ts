// Mock dependencies để tránh import issues trong tests
export const mockMessengeCode = {
  PRODUCT: {
    NOT_FOUND: new Error('Product not found')
  },
  USER: {
    NOT_FOUND: new Error('User not found'),
    INVALID_ROLE: new Error('Invalid role'),
    PHONE_IS_EXIST: new Error('Phone already exists'),
    PASSWORD_WRONG: new Error('Wrong password'),
    USERNAME_WRONG: new Error('Wrong username'),
    INVALID_STATUS: new Error('Invalid status'),
    EMAIL_IS_EXIST: new Error('Email already exists'),
    UNAUTHORIZED: new Error('Unauthorized')
  },
  ORDER: {
    NOT_FOUND: new Error('Order not found'),
    INVALID_STATUS: new Error('Invalid order status')
  },
  PAYMENT: {
    NOT_FOUND: new Error('Payment not found'),
    INVALID_STATUS: new Error('Invalid payment status')
  },
  CART: {
    EMPTY: new Error('Cart is empty'),
    NOT_FOUND: new Error('Cart not found')
  },
  AFFILIATE: {
    NOT_FOUND: new Error('Affiliate not found'),
    INVALID_CODE: new Error('Invalid affiliate code')
  }
};

export const mockStringUtils = {
  generateObjectId: jest.fn().mockReturnValue('507f1f77bcf86cd799439011'),
  ObjectId: jest.fn().mockImplementation((str: string) => str)
};

export const mockCartsService = {
  getUserCart: jest.fn(),
  clearCart: jest.fn(),
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCartItem: jest.fn()
};

export const mockUsersService = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addJWTUser: jest.fn(),
  removeJWTUser: jest.fn()
};

export const mockOrdersService = {
  findOne: jest.fn(),
  getOrderItems: jest.fn(),
  createFromCart: jest.fn(),
  buyNow: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  findSuccessOrders: jest.fn(),
  updateStatus: jest.fn()
};

export const mockAffiliateService = {
  processCommissionAfterPayment: jest.fn(),
  calculateCommission: jest.fn(),
  getAffiliateStats: jest.fn()
};

export const mockAffiliateLinkService = {
  trackConversion: jest.fn(),
  generateAffiliateLink: jest.fn(),
  validateAffiliateCode: jest.fn()
};

export const mockCloudinaryService = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  updateImage: jest.fn()
};

export const mockConnection = {
  startSession: jest.fn().mockReturnValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  }),
};

// Mock cho các model methods
export const createMockModel = (mockData: any) => {
  const mockInstance = {
    ...mockData,
    save: jest.fn().mockResolvedValue(mockData),
  };
  
  // Tạo constructor function để có thể gọi new Model()
  const ModelConstructor = jest.fn().mockImplementation((data: any) => {
    const instance = { ...mockData, ...data };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  });
  
  // Gán constructor vào chính object để có thể gọi new Model()
  const mockModel = Object.assign(ModelConstructor, {
    new: jest.fn().mockReturnValue(mockInstance),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    lean: jest.fn(),
    populate: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    distinct: jest.fn(),
  });
  
  return mockModel;
};

// Mock cho các ObjectId
export const mockObjectId = (id: string) => ({
  toString: () => id,
  toHexString: () => id,
  equals: (other: any) => other?.toString() === id
});
