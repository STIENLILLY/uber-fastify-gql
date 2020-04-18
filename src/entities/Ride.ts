import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ObjectType, Field, ID, Float } from 'type-graphql';
import { RideStatus } from '../constants/ride';
import User from './User';

const { ACCEPTED, FINISHED, CANCELED, REQUESTING, ONROUTE } = RideStatus;
@ObjectType()
@Entity()
export default class Ride extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('enum', { enum: [ACCEPTED, FINISHED, CANCELED, REQUESTING, ONROUTE], default: REQUESTING })
    status: RideStatus;

    @Field()
    @Column('text')
    duration: string;

    @Field()
    @Column('text')
    distance: string;

    @Field()
    @Column('text')
    pickUpAddress: string;

    @Column('geometry', { nullable: true, spatialFeatureType: 'Point', srid: 4326 })
    @Index({ spatial: true })
    pickUpgeom: { type: string; coordinates: [number, number] };

    @Field(() => Float, { nullable: true })
    get pickUpLong(): number | null {
        return this.pickUpgeom.coordinates[0];
    }

    @Field(() => Float, { nullable: true })
    get pickUpLat(): number | null {
        return this.pickUpgeom.coordinates[1];
    }

    @Field()
    @Column('text')
    dropOffAddress: string;

    @Column('geometry', { nullable: true, spatialFeatureType: 'Point', srid: 4326 })
    @Index({ spatial: true })
    dropOffgeom: { type: string; coordinates: [number, number] };

    @Field(() => Float, { nullable: true })
    get dropOffLong(): number | null {
        return this.dropOffgeom.coordinates[0];
    }

    @Field(() => Float, { nullable: true })
    get dropOffLat(): number | null {
        return this.dropOffgeom.coordinates[1];
    }

    @Field(() => Float)
    @Column('double precision', { default: 0 })
    price: number;

    @Column({ nullable: true })
    passengerId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.ridesAsPassenger)
    passenger: User;

    @Column({ nullable: true })
    driverId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.ridesAsDriver)
    driver: User;

    @Field(() => Date)
    @CreateDateColumn({ name: 'createAt', type: 'timestamp', precision: 0 })
    createAt: Date;

    @Field(() => Date)
    @UpdateDateColumn({ name: 'updateAt', type: 'timestamp', precision: 0 })
    updateAt: Date;
}
