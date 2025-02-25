import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body, files, file } = request;

    console.log('=== Request Body Before Validation ===');
    console.log('Body:', body);
    console.log('Files:', files);
    console.log('Single File:', file);

    if (body) {
      console.log('Body Types:', Object.keys(body).map(key => ({
        field: key,
        value: body[key],
        type: typeof body[key]
      })));
    } else {
      console.log('Body is undefined or null');
    }

    console.log('================================');

    return next.handle();
  }
} 