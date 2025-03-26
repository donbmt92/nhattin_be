import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PostCategory } from '../../post-categories/entities/post-category.entity';
import { User } from '../../users/users.schema';


@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  slug: string;

  @ManyToOne(() => PostCategory, (category) => category.posts)
  category: PostCategory;

  @ManyToOne(() => User)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 