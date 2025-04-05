import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from './ApiException';

@Catch(Error, HttpException, ApiException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    console.log('Exception caught by filter:', exception);
    
    if (exception instanceof ApiException) {
      console.log('ApiException detected:', {
        status: exception.getStatus(),
        message: exception.getResponse(),
        code: exception.code,
      });
      
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.getResponse(),
        code: exception.code,
      });
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      console.log('HttpException:', { status, response: exceptionResponse });
      
      response.status(status).json({
        statusCode: status,
        message: typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : exceptionResponse['message'] || 'Lỗi hệ thống',
        error: typeof exceptionResponse === 'object' ? exceptionResponse['error'] : undefined,
      });
    } else {
      // Handle generic errors
      this.logger.error(exception.message);
      console.log('Generic error:', exception);
      
      response.status(500).json({
        statusCode: 500,
        message: exception.message || 'Lỗi hệ thống không xác định',
        error: 'Internal Server Error',
      });
    }
  }
}
