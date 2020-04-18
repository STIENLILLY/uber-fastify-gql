import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToMany, AfterLoad, ManyToMany } from 'typeorm';
import { ObjectType, Field, Int, ID } from 'type-graphql';
import { IsEmail } from 'class-validator';
import bcrypt from 'bcrypt';
import Chat from './Chat';
import Ride from './Ride';
import Place from './Place';
import Location from './Location';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String, { nullable: true })
    @Column('text', { nullable: true })
    facebookId?: string;

    @Field(() => String, { nullable: true })
    @Column('text', { nullable: true })
    @IsEmail()
    email?: string;

    @Column('boolean', { default: false })
    verifiedEmail: boolean;

    @Column('text', { select: false })
    password: string = 'default';

    @Field(() => String, { nullable: true })
    @Column('text', { nullable: true })
    firstName?: string;

    @Field(() => String, { nullable: true })
    @Column('text', { nullable: true })
    lastName?: string;

    @Field(() => Int, { nullable: true })
    @Column('int', { nullable: true })
    age?: number;

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    phoneNumber?: string;

    @Column('boolean', { default: false })
    verifiedPhoneNumber: boolean;

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    profilePhoto?: string;

    @Field(() => Boolean)
    @Column('boolean', { default: false })
    isDriving: boolean;

    @ManyToMany(() => Chat, chat => chat.participants)
    chats: Chat[];

    @OneToMany(() => Location, location => location.user)
    location: Location[];

    @OneToMany(() => Place, place => place.user)
    places: Place[];

    @OneToMany(() => Ride, ride => ride.passenger)
    ridesAsPassenger: Ride[];

    @OneToMany(() => Ride, ride => ride.driver)
    ridesAsDriver: Ride[];

    @CreateDateColumn({ name: 'createAt', type: 'timestamp', precision: 0 })
    createAt: Date;

    @UpdateDateColumn({ name: 'updateAt', type: 'timestamp', precision: 0 })
    updateAt: Date;

    @Field(() => String, { nullable: true })
    get fullName(): string | null {
        return `${this.firstName} ${this.lastName}`;
    }

    private hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    private tempPassword: string;

    @AfterLoad()
    loadTempPassword(): void {
        this.tempPassword = this.password;
    }
    @BeforeInsert()
    @BeforeUpdate()
    async savePassword(): Promise<void> {
        //ToDo: Before User Update it, should be check password
        if (this.password !== this.tempPassword) {
            this.password = await this.hashPassword(this.password);
        }
    }
}
