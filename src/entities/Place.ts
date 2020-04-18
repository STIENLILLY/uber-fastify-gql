import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, Float } from 'type-graphql';
import User from './User';

@ObjectType()
@Entity()
export default class Place extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('text')
    name: string;

    @Field()
    @Column('text')
    address: string;

    @Field(() => Boolean)
    @Column('boolean', { default: false })
    isFavorite: boolean;

    @Field(() => Float)
    @Column('double precision', { default: 0 })
    longitude: number;

    @Field(() => Float)
    @Column('double precision', { default: 0 })
    latitude: number;

    @Column({ nullable: true })
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.places)
    user: User;

    @Field(() => Date)
    @CreateDateColumn({ name: 'createAt', type: 'timestamp', precision: 0 })
    createAt: Date;
}
