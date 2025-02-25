/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';

export class LoggingValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: any) {
    try {
      console.log('=== Before Validation ===');
      console.log('Value:', value || 'No value provided');
      console.log('Metadata:', metadata);
      console.log('=======================');

      const result = await super.transform(value, metadata);

      console.log('=== After Validation ===');
      console.log('Transformed Value:', result || 'No result');
      console.log('=======================');

      return result;
    } catch (error) {
      console.error('Validation Error:', error);
      if (error ) {
        console.log('Validation constraints:', error.constraints);
      }
      throw error;
    }
  }
} 