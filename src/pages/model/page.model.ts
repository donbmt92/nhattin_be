import { BaseModel } from '../../common/model/base.model';

export class PageModel extends BaseModel {
  name: string;
  link: string;

  constructor(page: any) {
    super(page);
    this.name = page.name;
    this.link = page.link;
  }

  static fromEntity(entity: any): PageModel {
    return new PageModel({
      id: entity._id,
      name: entity.name,
      link: entity.link,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): PageModel[] {
    return entities.map(entity => PageModel.fromEntity(entity));
  }
} 