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
    messageList: MessageList | null,
    chatroomList: ChatroomList | null,
    selectedChatroom: number | null,
    editChatroomName: number | null,
}

const initialState: MessagesState = {
    messageList: null,
    chatroomList: null,
    selectedChatroom: null,
    editChatroomName: null,
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
    state.messageList = []
};

const sendMessage: CaseReducer<MessagesState, PayloadAction<Message>> = (state, action) => {
    state.messageList!.push(action.payload);
};

const getMessages: CaseReducer<MessagesState, PayloadAction<MessageList>> = (state, action) => {
    state.messageList = action.payload;
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
        getMessages,
        exitChatroom
    }
});

export const {
    getChatroomList: getChatroomListAction,
    createChatroom: createChatroomAction,
    setSelectedChatroom: setSelectedChatroomAction,
    editChatroomMode: editChatroomModeAction,
    editChatroomName: editChatroomNameAction,
    sendMessage: sendMessageAction,
    getMessages: getMessagesAction,
    exitChatroom: exitChatroomAction,
} = messagesSlice.actions;

export default messagesSlice.reducer;
