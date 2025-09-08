import { Injectable, Logger } from '@nestjs/common';
import { AffiliateLinkService } from '../affiliate-link.service';

@Injectable()
export class CleanupExpiredLinksTask {
  private readonly logger = new Logger(CleanupExpiredLinksTask.name);

  constructor(private readonly affiliateLinkService: AffiliateLinkService) {}

  async handleCleanupExpiredLinks() {
    try {
      this.logger.log('Starting cleanup of expired affiliate links...');
      
      const cleanedCount = await this.affiliateLinkService.cleanupExpiredLinks();
      
      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} expired affiliate links`);
      } else {
        this.logger.debug('No expired affiliate links found');
      }
      
      return cleanedCount;
    } catch (error) {
      this.logger.error('Error during cleanup of expired affiliate links:', error);
      throw error;
    }
  }
}
