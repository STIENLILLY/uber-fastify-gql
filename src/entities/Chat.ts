import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import Message from './Message';
import User from './User';

@ObjectType()
@Entity()
export default class Chat extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Message, message => message.chat)
    messages: Message[];

    @ManyToMany(() => User, user => user.chats)
    @JoinTable()
    participants: User[];

    @Field(() => Date)
    @CreateDateColumn({ name: 'createAt', type: 'timestamp', precision: 0 })
    createAt: Date;
}
