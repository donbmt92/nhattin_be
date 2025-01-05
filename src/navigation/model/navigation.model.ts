import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';

export class NavigationModel extends BaseModel {
  id_page: Types.ObjectId;
  name: string;
  sub_page: string;
  position: number;
  link: string;

  constructor(navigation: any) {
    super(navigation);
    this.id_page = navigation.id_page;
    this.name = navigation.name;
    this.sub_page = navigation.sub_page;
    this.position = navigation.position;
    this.link = navigation.link;
  }

  static fromEntity(entity: any): NavigationModel {
    return new NavigationModel({
      id: entity._id,
      id_page: entity.id_page,
      name: entity.name,
      sub_page: entity.sub_page,
      position: entity.position,
      link: entity.link,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): NavigationModel[] {
    return entities.map(entity => NavigationModel.fromEntity(entity));
  }
} 