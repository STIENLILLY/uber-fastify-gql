import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Index, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Float } from 'type-graphql';
import User from './User';

@ObjectType()
@Entity()
export default class Location extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.location)
    @JoinColumn()
    user: User;

    @Column('geometry', { nullable: true, spatialFeatureType: 'Point', srid: 4326 })
    @Index({ spatial: true })
    geom: { type: string; coordinates: [number, number] };

    @Field(() => Float, { nullable: true })
    @Column('double precision', { nullable: true, default: 0 })
    orientation?: number;

    @Field(() => Date)
    @CreateDateColumn({ name: 'createAt', type: 'timestamp', precision: 0 })
    createAt: Date;
}
