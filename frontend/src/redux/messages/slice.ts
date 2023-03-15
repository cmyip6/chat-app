import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

type Chatroom = {
    chatroomId: number,
    chatroomName?: string,
    chatroomOwner: number,
    ownerName: string,
    isGroup: boolean,
    participants: {
        participantId: number
        participantNickname?: string
        participantName: string,
        participationId: number,
        isDeleted: boolean
    }[],
    messageList: MessageList
}

type Message = {
    messageId:number,
    senderId: number,
    senderUsername: string,
    content: string,
    isDeleted: boolean,
    isSystemMessage: boolean,
    createdAt: string
}

export type ChatroomList = Chatroom[]
export type MessageList = Message[]


export interface MessagesState {
    chatroomList: ChatroomList | null,
    selectedChatroom: number | null,
    editChatroomName: number | null,
}

const initialState: MessagesState = {
    chatroomList: null,
    selectedChatroom: null,
    editChatroomName: null,
};

const clearChatroomList: CaseReducer<MessagesState> = (state) => {
    state.chatroomList = null
};

const getChatroomList: CaseReducer<MessagesState, PayloadAction<ChatroomList>> = (state, action) => {
    state.chatroomList = action.payload;
};

const createChatroom: CaseReducer<MessagesState, PayloadAction<Chatroom>> = (state, action) => {
    state.chatroomList!.unshift(action.payload);
};

const setSelectedChatroom: CaseReducer<MessagesState, PayloadAction<number>> = (state, action) => {
    state.selectedChatroom = action.payload
};

const editChatroomMode: CaseReducer<MessagesState, PayloadAction<number>> = (state, action) => {
    state.editChatroomName = action.payload
};

const editChatroomName: CaseReducer<MessagesState, PayloadAction<{chatroomId: number, chatroomName: string}>> = (state, action) => {
    for (let chatroom of state.chatroomList!){
        if (chatroom.chatroomId === action.payload.chatroomId) {
            chatroom.chatroomName = action.payload.chatroomName
        }
    }
};

const exitChatroom: CaseReducer<MessagesState, PayloadAction<number>> = (state, action) => {
    state.chatroomList = state.chatroomList!.filter(chatroom=> chatroom.chatroomId !== action.payload)
};

const toggleParticipantStatus: CaseReducer<MessagesState, PayloadAction<{chatroomId: number, participantId: number, isDeleted: boolean}>> = (state, action) => {
    for (let chatroom of state.chatroomList!){
        if (chatroom.chatroomId === action.payload.chatroomId) {
            for (let participant of chatroom.participants){
                if (participant.participantId === action.payload.participantId){
                    participant.isDeleted = false
                    return
                }
            }
        }
    }
};

const sendMessage: CaseReducer<MessagesState, PayloadAction<{message: Message, chatroomId: number}>> = (state, action) => {
    for (let chatroom of state.chatroomList!){
        if(chatroom.chatroomId === action.payload.chatroomId) {
            if (chatroom.messageList === undefined || null){
                chatroom.messageList = [action.payload.message]
            } else {
                chatroom.messageList.push(action.payload.message);
            }
        }
    }
};

const deleteMessage: CaseReducer<MessagesState, PayloadAction<number>> = (state, action) => {
    for (let chatroom of state.chatroomList!){
        for (let message of chatroom.messageList){
            if( message.messageId === action.payload){
                message.isDeleted = true
                return
            }
        }
    }
};

const getMessages: CaseReducer<MessagesState, PayloadAction<{messageList: MessageList, chatroomId: number}>> = (state, action) => {
    for (let chatroom of state.chatroomList!){
        if(chatroom.chatroomId === action.payload.chatroomId) {
            chatroom.messageList = action.payload.messageList
        }
    }
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        getChatroomList,
        createChatroom,
        setSelectedChatroom,
        editChatroomMode,
        editChatroomName,
        sendMessage,
        deleteMessage,
        getMessages,
        exitChatroom,
        toggleParticipantStatus,
        clearChatroomList
    }
});

export const {
    getChatroomList: getChatroomListAction,
    createChatroom: createChatroomAction,
    setSelectedChatroom: setSelectedChatroomAction,
    editChatroomMode: editChatroomModeAction,
    editChatroomName: editChatroomNameAction,
    sendMessage: sendMessageAction,
    deleteMessage: deleteMessageAction,
    getMessages: getMessagesAction,
    exitChatroom: exitChatroomAction,
    toggleParticipantStatus: toggleParticipantStatusAction,
    clearChatroomList: clearChatroomListAction
} = messagesSlice.actions;

export default messagesSlice.reducer;
