import { showNotification } from '@mantine/notifications';
import { Dispatch } from '@reduxjs/toolkit';
import { getState } from '../../store';
import { MakeRequest } from '../../utils/requestUtils';
import { ChatroomList, createChatroomAction, editChatroomNameAction, exitChatroomAction, getChatroomListAction, getMessagesAction, MessageList, sendMessageAction, setSelectedChatroomAction } from './slice';

const makeRequest = (token: string) => new MakeRequest(token);


export function createChatroom(nameList: string[], chatroomName?: string) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const owner = getState().auth.userId!;
        const self = getState().auth.username
        const fullNameList = nameList.concat([self!])

        const result = await makeRequest(token!).post<
            {
                fullNameList: string[];
                owner: number;
                chatroomName?: string;
            },
            {
                success?: boolean;
                chatroomId?: number;
                isGroup: boolean;
                participants: {
                    participantName: string
                    participantNickname?: string
                    participantId: number
                    participationId: number
                    isDeleted: boolean
                }[]
                msg: string;
            }
        >(`/messages/chatroom`, {
            fullNameList,
            owner,
            chatroomName,
        });

        if (result.msg==='Chatroom Existed') {
            dispatch(setSelectedChatroomAction(result.chatroomId!))
        } else if (result.success) {
            const payload = {
                chatroomId: result.chatroomId!,
                chatroomName: chatroomName!,
                chatroomOwner: owner,
                ownerName: self!,
                isGroup: result.isGroup,
                participants: result.participants,
            }
            dispatch(createChatroomAction(payload));
        } 
        if (result.msg !=='Chatroom Existed'){
            showNotification({
                title: 'Create Chatroom Notification',
                message: result.msg,
                autoClose: 2000
            });
        }
    };
}

export function sendMessage(userId: number, selectedChatroom: number, text: string) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;

        const result = await makeRequest(token!).post<
            {
                userId: number;
                selectedChatroom: number;
                text: string;
            },
            {
                success: boolean;
                data: {
                    id: number
                    content: string
                    is_deleted: boolean
                    created_at: string
                    sender_username: string
                }
                
                msg: string;
            }
        >(`/messages/`, {
            userId,
            selectedChatroom,
            text
        });

        if (result.success) {

            console.log(result)
            const payload = {
                messageId: result.data.id,
                senderId: userId,
                senderUsername: result.data.sender_username,
                content: text,
                isDeleted: false,
                isSystemMessage: false,
                createdAt: result.data.created_at
            }

            dispatch(sendMessageAction(payload));
        } 
    };
}

export function getMessages(chatroomId: number) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).get<
            {
                success?: boolean;
                messageList: MessageList;
                msg: string;
            }
        >(`/messages/${chatroomId}`);

        if (result.success) {
            dispatch(getMessagesAction(result.messageList))
            console.log(result.msg)
        } else {
            showNotification({
                title: 'Get Message List Notification',
                message: result.msg
            });
        }
    };
}

export function getChatroomList(userId: number) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).get<
            {
                success?: boolean;
                chatroomList: ChatroomList;
                msg: string;
            }
        >(`/messages/chatroom/${userId}`);

        if (result.success) {
            dispatch(getChatroomListAction(result.chatroomList))
            if (result.chatroomList.length){
                dispatch(setSelectedChatroomAction(result.chatroomList[0].chatroomId))
            }
            console.log(result.msg)
        } else {
            showNotification({
                title: 'Get Contact List Notification',
                message: result.msg
            });
        }
    };
}

export function editChatroomName(chatroomId: number, chatroomName: string) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const userId = getState().auth.userId!
        const result = await makeRequest(token!).put<
            {
                chatroomId: number,
                chatroomName: string,
                userId: number
            },
            {
                success?: boolean;
                msg: string;
            }
        >(`/messages/chatroom`, {chatroomId, chatroomName, userId});

        if (result.success) {
            const payload = {
                chatroomId,
                chatroomName
            }
            dispatch(editChatroomNameAction(payload))
            console.log(result.msg)
        } else {
            showNotification({
                title: 'Edit Chatroom Name Notification',
                message: result.msg
            });
        }
    };
}

export function exitChatroom(chatroomId: number, participantId:number) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).delete<
            {
                chatroomId: number,
                participantId: number
            },
            {
                success?: boolean;
                msg: string;
            }
        >(`/messages/chatroom`, {chatroomId, participantId});

        if (result.success) {
            dispatch(exitChatroomAction(chatroomId))
            const chatroomList = getState().messages.chatroomList
            chatroomList && dispatch(setSelectedChatroomAction(chatroomList[0].chatroomId))
        } 
        showNotification({
            title: 'Exit Chatroom Notification',
            message: result.msg
        });
    };
}
