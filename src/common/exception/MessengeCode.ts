import { HttpStatus } from '@nestjs/common';
import { ApiException } from './ApiException';

export const MessengeCode = {
  PRODUCT: {
    NOT_FOUND: new ApiException({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Không tìm thấy sản phẩm',
      status: HttpStatus.NOT_FOUND
    })
  },
  USER: {
    NOT_FOUND: new ApiException({
      code: 'USER_NOT_FOUND',
      message: 'không tìm thấy user',
      status: HttpStatus.BAD_REQUEST
    }),
    INVALID_ROLE: new ApiException({
      code: 'INVALID_ROLE',
      message: 'bạn không có quyền',
      status: HttpStatus.BAD_REQUEST
    }),
    PHONE_IS_EXIST: new ApiException({
      code: 'PHONE_IS_EXIST',
      message: 'Số điện thoại đã được sử dụng',
      status: HttpStatus.BAD_REQUEST
    }),
    PASSWORD_WRONG: new ApiException({
      code: 'PASSWORD_WRONG',
      message: 'Sai mật khẩu',
      status: HttpStatus.BAD_REQUEST
    }),
    USERNAME_WRONG: new ApiException({
      code: 'USERNAME_WRONG',
      message: 'Sai tên đăng nhập',
      status: HttpStatus.BAD_REQUEST
    }),
    INVALID_STATUS: new ApiException({
      code: 'INVALID_STATUS',
      message: 'Trạng thái không hợp lệ',
      status: HttpStatus.BAD_REQUEST
    }),
    EMAIL_IS_EXIST: new ApiException({
      code: 'EMAIL_IS_EXIST',
      message: 'Email đã được sử dụng',
      status: HttpStatus.BAD_REQUEST
    }),
    UNAUTHORIZED: new ApiException({
      code: 'UNAUTHORIZED',
      message: 'Bạn không có quyền truy cập',
      status: HttpStatus.UNAUTHORIZED
    })
  },
  ROLE: {
    ROLE_IS_EXIST: new ApiException({
      code: 'ROLE_IS_EXIST',
      message: 'Đã tồn tại Quyền',
      status: HttpStatus.BAD_REQUEST
    }),
    ROLE_IS_NOT_PERMISSION: new ApiException({
      code: 'ROLE_IS_NOT_PERMISSION',
      message: 'Người dùng không có Quyền',
      status: HttpStatus.BAD_REQUEST
    })
  },
  USER_REQUEST: {
    response: {
      statusCode: 403,
      message: 'Forbidden resource',
      error: 'Forbidden'
    }
  },
  CART: {
    ITEM_NOT_FOUND: new ApiException({
      code: 'CART_ITEM_NOT_FOUND',
      message: 'Không tìm thấy sản phẩm trong giỏ hàng',
      status: HttpStatus.NOT_FOUND
    }),
    INVALID_QUANTITY: new ApiException({
      code: 'INVALID_QUANTITY',
      message: 'Số lượng không hợp lệ',
      status: HttpStatus.BAD_REQUEST
    }),
    INSUFFICIENT_STOCK: new ApiException({
      code: 'INSUFFICIENT_STOCK',
      message: 'Số lượng sản phẩm trong kho không đủ',
      status: HttpStatus.BAD_REQUEST
    })
  },
  CATEGORY: {
    NOT_FOUND: new ApiException({
      code: 'CATEGORY_NOT_FOUND',
      message: 'Không tìm thấy danh mục',
      status: HttpStatus.NOT_FOUND
    }),
    ALREADY_EXISTS: new ApiException({
      code: 'CATEGORY_ALREADY_EXISTS',
      message: 'Danh mục đã tồn tại',
      status: HttpStatus.BAD_REQUEST
    })
  },
  DISCOUNT: {
    NOT_FOUND: new ApiException({
      code: 'DISCOUNT_NOT_FOUND',
      message: 'Không tìm thấy khuyến mãi',
      status: HttpStatus.NOT_FOUND
    }),
    ALREADY_EXISTS: new ApiException({
      code: 'DISCOUNT_ALREADY_EXISTS',
      message: 'Khuyến mãi đã tồn tại',
      status: HttpStatus.BAD_REQUEST
    })
  },
  INVENTORY: {
    NOT_FOUND: new ApiException({
      code: 'INVENTORY_NOT_FOUND',
      message: 'Không tìm thấy inventory',
      status: HttpStatus.NOT_FOUND
    }),
    ALREADY_EXISTS: new ApiException({
      code: 'INVENTORY_ALREADY_EXISTS',
      message: 'Inventory đã tồn tại cho warehouse và product này',
      status: HttpStatus.BAD_REQUEST
    }),
    INSUFFICIENT_STOCK: new ApiException({
      code: 'INSUFFICIENT_STOCK',
      message: 'Số lượng tồn kho không đủ',
      status: HttpStatus.BAD_REQUEST
    })
  },
  NAVIGATION: {
    NOT_FOUND: new ApiException({
      code: 'NAVIGATION_NOT_FOUND',
      message: 'Không tìm thấy navigation',
      status: HttpStatus.NOT_FOUND
    }),
    ALREADY_EXISTS: new ApiException({
      code: 'NAVIGATION_ALREADY_EXISTS',
      message: 'Navigation đã tồn tại cho page này',
      status: HttpStatus.BAD_REQUEST
    })
  },
  INVENTORY_LOG: {
    NOT_FOUND: new ApiException({
      code: 'INVENTORY_LOG_NOT_FOUND',
      message: 'Không tìm thấy log',
      status: HttpStatus.NOT_FOUND
    })
  },
  ORDER: {
    NOT_FOUND: new ApiException({
      code: 'ORDER_NOT_FOUND',
      message: 'Không tìm thấy đơn hàng',
      status: HttpStatus.NOT_FOUND
    }),
    INVALID_STATUS: new ApiException({
      code: 'ORDER_INVALID_STATUS',
      message: 'Trạng thái đơn hàng không hợp lệ',
      status: HttpStatus.BAD_REQUEST
    }),
    PAYMENT_REQUIRED: new ApiException({
      code: 'ORDER_PAYMENT_REQUIRED',
      message: 'Đơn hàng cần thanh toán trước',
      status: HttpStatus.BAD_REQUEST
    })
  },
  PAGE: {
    NOT_FOUND: new ApiException({
      code: 'PAGE_NOT_FOUND',
      message: 'Không tìm thấy trang',
      status: HttpStatus.NOT_FOUND
    }),
    ALREADY_EXISTS: new ApiException({
      code: 'PAGE_ALREADY_EXISTS',
      message: 'Trang đã tồn tại',
      status: HttpStatus.BAD_REQUEST
    })
  },
  PAYMENT: {
    NOT_FOUND: new ApiException({
      code: 'PAYMENT_NOT_FOUND',
      message: 'Không tìm thấy thanh toán',
      status: HttpStatus.NOT_FOUND
    }),
    INVALID_STATUS: new ApiException({
      code: 'PAYMENT_INVALID_STATUS',
      message: 'Trạng thái thanh toán không hợp lệ',
      status: HttpStatus.BAD_REQUEST
    })
  },
  WAREHOUSE: {
    NOT_FOUND: new ApiException({
      code: 'WAREHOUSE_NOT_FOUND',
      message: 'Không tìm thấy kho',
      status: HttpStatus.NOT_FOUND
    }),
    ALREADY_EXISTS: new ApiException({
      code: 'WAREHOUSE_ALREADY_EXISTS',
      message: 'Kho đã tồn tại',
      status: HttpStatus.BAD_REQUEST
    })
  }
};
