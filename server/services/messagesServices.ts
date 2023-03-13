import { Knex } from "knex";

export class MessagesService {
    constructor(private knex: Knex) { }

    async sendMessage(userId: number, chatroomId: number, text: string) {
        const txn = await this.knex.transaction();
        try {

            const [user] = await txn
                .select('username')
                .from('users')
                .where('id', userId)

            const [message] = await txn('messages')
                .insert({
                    sender: userId,
                    content: text,
                    chatroom_id: chatroomId
                })
                .returning('*')

            message.sender_username = user.username

            await txn.commit();
            return message

        } catch (e) {
            await txn.rollback();
            throw e;
        }
    }

    async getMessages(chatroomId: number) {
        try {
            const messageList = await this.knex
                .select(
                    'messages.id as messageId',
                    'messages.sender as senderId',
                    'users.username as senderUsername',
                    'messages.content',
                    'messages.is_deleted as isDeleted',
                    'messages.created_at as createdAt',
                    'messages.system_message as isSystemMessage'
                )
                .from('messages')
                .where('chatroom_id', chatroomId)
                .join('users', 'users.id', 'sender')
            return messageList;
        } catch (e) {
            throw e
        }
    }

    async editChatroomName(chatroomId: number, chatroomName: string, userId: number) {
        const txn = await this.knex.transaction();
        try {
            await txn('chatrooms')
                .update({
                    name: chatroomName
                })
                .where('id', chatroomId);

            await txn('messages')
                .insert({
                    sender: userId,
                    chatroom_id: chatroomId,
                    system_message: true,
                    content: `Chatroom name has been changed to '${chatroomName}'`
                })
            
            await txn.commit()
            return true
        } catch (e) {
            await txn.rollback();
            throw e;
        }

    }

    async exitChatroom(chatroomId: number, participantId: number) {
        const txn = await this.knex.transaction();
        try {
            await txn('participation')
                .update({
                    is_deleted: true
                })
                .where('user_id', participantId)
                .where('chatroom_id', chatroomId)


            await txn('messages')
                .insert({
                    sender: participantId,
                    chatroom_id: chatroomId,
                    system_message: true,
                    content: 'This user is no longer in the chat.'
                })

            await txn.commit()
            return true
        } catch (e) {
            await txn.rollback();
            throw e;
        }
    }

    async checkChatroom(nameList: string[]) {
        const txn = await this.knex.transaction();
        try {
            const [personOne] = await txn('users').where('username', nameList[0])
            const [personTwo] = await txn('users').where('username', nameList[1])

            const personOneChatroomList = await txn.select('chatrooms.id', 'participation.id as participationId')
                .from('chatrooms')
                .join('participation', 'chatrooms.id', 'participation.chatroom_id')
                .andWhere('participation.user_id', personOne.id)
                .andWhere('chatrooms.group', false)

            const personTwoChatroomList = await txn.select('chatrooms.id', 'participation.id as participationId')
                .from('chatrooms')
                .join('participation', 'chatrooms.id', 'participation.chatroom_id')
                .andWhere('participation.user_id', personTwo.id)
                .andWhere('chatrooms.group', false)


            if (personOneChatroomList.length && personTwoChatroomList.length) {
                for (let i = 0; i < personOneChatroomList.length; i++) {
                    for (let j = 0; j < personTwoChatroomList.length; j++) {
                        if (personOneChatroomList[i].id === personTwoChatroomList[j].id) {
                            await txn('participation').update({ is_deleted: false }).where('id', personOneChatroomList[i].participationId)
                            await txn('participation').update({ is_deleted: false }).where('id', personOneChatroomList[i].participationId)
                            await txn.commit();
                            return personTwoChatroomList[j].id
                        }
                    }
                }
            } else {
                await txn.rollback();
                return false
            }
        } catch (e) {
            await txn.rollback();
            throw e;
        }
    }

    async getChatroomList(userId: number) {
        const txn = await this.knex.transaction();

        try {

            const contactList = await txn
                .select('*')
                .from('contacts')
                .where('contacts.owner', userId)

            const chatroomList = await txn
                .select('chatrooms.created_at', 'chatrooms.id as chatroomId', 'chatrooms.name as chatroomName', 'chatrooms.owner as chatroomOwner', 'users.username as ownerName', 'chatrooms.group as isGroup')
                .from('chatrooms')
                .join('participation', 'participation.chatroom_id', 'chatrooms.id')
                .join('users', 'participation.user_id', 'users.id')
                .where('participation.user_id', userId)
                .where('participation.is_deleted', false)
                .orderBy('chatrooms.created_at', 'desc')

            for (let chatroom of chatroomList) {
                const participants = await txn
                    .select('participation.id as participationId', 'users.username as participantName', 'participation.user_id as participantId', 'participation.is_deleted as isDeleted')
                    .from('participation')
                    .join('users', 'participation.user_id', 'users.id')
                    .where('participation.chatroom_id', chatroom.chatroomId)

                for (let i = 0; i < participants.length; i++) {
                    for (let j = 0; j < contactList.length; j++) {
                        if (contactList[j].user === participants[i].participantId) {
                            participants[i].participantNickname = contactList[j].nickname
                            break
                        }
                    }
                }

                chatroom.participants = participants
            }

            await txn.commit();
            return chatroomList;
        } catch (e) {
            await txn.rollback();
            throw e;
        }
    }

    async createChatroom(nameList: string[], ownerId: number, chatroomName?: string, isGroup: boolean = true) {
        const txn = await this.knex.transaction();
        try {

            const contactList = await txn
                .select('*')
                .from('contacts')
                .where('contacts.owner', ownerId)

            const [chatroom] = await txn('chatrooms')
                .insert({
                    owner: ownerId,
                    name: chatroomName || null,
                    group: isGroup
                })
                .returning('*')

            const participants = []
            for (let name of nameList) {
                const [user] = await txn('users').where('username', name)
                await txn('participation').insert({
                    user_id: user.id,
                    chatroom_id: chatroom.id
                })

                let participantNickname = null

                for (let j = 0; j < contactList.length; j++) {
                    if (contactList[j].user === user.id) {
                        participantNickname = contactList[j].nickname
                        break
                    }
                }

                const obj = {
                    participantName: name,
                    participantId: user.id,
                    participantNickname: participantNickname
                }

                participants.push(obj)
            }


            await txn.commit();
            return { chatroomId: chatroom.id, participants }

        } catch (e) {
            await txn.rollback();
            throw e;
        }
    }

    async getUser(id: number) {
        const [user] = await this.knex('users').where('id', id);
        if (user) {
            delete user.password;
            return user;
        } else {
            return;
        }
    }
}