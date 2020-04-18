import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import Chat from './Chat';
import User from './User';

@ObjectType()
@Entity()
export default class Message extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    chatId: number;

    @ManyToOne(() => Chat, chat => chat.messages)
    chat: Chat;

    @Column({ nullable: true })
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User)
    user: User;

    @Field()
    @Column('text')
    text: string;

    @Field(() => Date)
    @CreateDateColumn({ name: 'createAt', type: 'timestamp', precision: 0 })
    createAt: Date;
}
