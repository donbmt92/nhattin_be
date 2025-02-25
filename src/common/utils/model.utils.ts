/* eslint-disable prettier/prettier */

export class ModelUtils {
  /**
   * Chuyển đổi một mảng document sang mảng model
   * @param documents Mảng document
   * @param modelClass Class model
   * @returns Mảng model
   */
  static toModels<T, U>(documents: T[], modelClass: { fromEntity: (entity: T) => U }): U[] {
    if (!documents || documents.length === 0) {
      return [];
    }
    
    return documents.map(doc => modelClass.fromEntity(doc));
  }

  /**
   * Chuyển đổi một document sang model
   * @param document Document
   * @param modelClass Class model
   * @returns Model
   */
  static toModel<T, U>(document: T, modelClass: { fromEntity: (entity: T) => U }): U {
    if (!document) {
      return null;
    }
    
    return modelClass.fromEntity(document);
  }
} 