import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'

type Participant = {
	participantId: number
	participantNickname?: string
	participantName: string
	participationId: number
	isDeleted: boolean
}

type Chatroom = {
	chatroomId: number
	chatroomName?: string
	chatroomOwner: number
	ownerName: string
	isGroup: boolean
	myMessageColor?: string
	participants: Participant[]
	messageList: MessageList
}

type Message = {
	messageId: number
	senderId: number
	senderUsername: string
	content: string
	isDeleted: boolean
	isSystemMessage: boolean
	createdAt: string
}

export type ChatroomList = Chatroom[]
export type MessageList = Message[]

export interface MessagesState {
	chatroomList: ChatroomList | null
	selectedChatroom: number | null
	editChatroomName: number | null
}

const initialState: MessagesState = {
	chatroomList: null,
	selectedChatroom: null,
	editChatroomName: null
}

const clearChatroomList: CaseReducer<MessagesState> = (state) => {
	state.chatroomList = null
}

const getChatroomList: CaseReducer<
	MessagesState,
	PayloadAction<ChatroomList>
> = (state, action) => {
	state.chatroomList = action.payload
}

const createChatroom: CaseReducer<MessagesState, PayloadAction<Chatroom>> = (
	state,
	action
) => {
	state.chatroomList!.unshift(action.payload)
}

const addMember: CaseReducer<
	MessagesState,
	PayloadAction<{ chatroomId: number; participantList: Participant[] }>
> = (state, action) => {
	for (let chatroom of state.chatroomList!) {
		if (chatroom.chatroomId === action.payload.chatroomId) {
			chatroom.participants.concat(action.payload.participantList)
			return
		}
	}
}

const setSelectedChatroom: CaseReducer<MessagesState, PayloadAction<number>> = (
	state,
	action
) => {
	state.selectedChatroom = action.payload
}

const editChatroomMode: CaseReducer<MessagesState, PayloadAction<number>> = (
	state,
	action
) => {
	state.editChatroomName = action.payload
}

const editChatroomName: CaseReducer<
	MessagesState,
	PayloadAction<{ chatroomId: number; chatroomName: string }>
> = (state, action) => {
	for (let chatroom of state.chatroomList!) {
		if (chatroom.chatroomId === action.payload.chatroomId) {
			chatroom.chatroomName = action.payload.chatroomName
		}
	}
}

const exitChatroom: CaseReducer<MessagesState, PayloadAction<number>> = (
	state,
	action
) => {
	state.chatroomList = state.chatroomList!.filter(
		(chatroom) => chatroom.chatroomId !== action.payload
	)
}

const toggleParticipantStatus: CaseReducer<
	MessagesState,
	PayloadAction<{
		chatroomId: number
		participantId: number
		isDeleted: boolean
	}>
> = (state, action) => {
	for (let chatroom of state.chatroomList!) {
		if (chatroom.chatroomId === action.payload.chatroomId) {
			for (let participant of chatroom.participants) {
				if (
					participant.participantId === action.payload.participantId
				) {
					participant.isDeleted = false
					return
				}
			}
		}
	}
}

const sendMessage: CaseReducer<
	MessagesState,
	PayloadAction<{ message: Message; chatroomId: number }>
> = (state, action) => {
	for (let chatroom of state.chatroomList!) {
		if (chatroom.chatroomId === action.payload.chatroomId) {
			if (chatroom.messageList === undefined || null) {
				chatroom.messageList = [action.payload.message]
			} else {
				chatroom.messageList.push(action.payload.message)
			}
		}
	}
}

const deleteMessage: CaseReducer<MessagesState, PayloadAction<number>> = (
	state,
	action
) => {
	for (let chatroom of state.chatroomList!) {
		for (let message of chatroom.messageList) {
			if (message.messageId === action.payload) {
				message.isDeleted = true
				return
			}
		}
	}
}

const getMessages: CaseReducer<
	MessagesState,
	PayloadAction<{ messageList: MessageList; chatroomId: number }>
> = (state, action) => {
	for (let chatroom of state.chatroomList!) {
		if (chatroom.chatroomId === action.payload.chatroomId) {
			chatroom.messageList = action.payload.messageList
		}
	}
}

const setMessageColor: CaseReducer<
	MessagesState,
	PayloadAction<{ chatroomId: number; color: string }>
> = (state, action) => {
	for (let chatroom of state.chatroomList!) {
		if (chatroom.chatroomId === action.payload.chatroomId) {
			chatroom.myMessageColor = action.payload.color
			return
		}
	}
}

const messagesSlice = createSlice({
	name: 'messages',
	initialState,
	reducers: {
		getChatroomList,
		createChatroom,
		addMember,
		setSelectedChatroom,
		editChatroomMode,
		editChatroomName,
		sendMessage,
		deleteMessage,
		getMessages,
		exitChatroom,
		toggleParticipantStatus,
		clearChatroomList,
		setMessageColor
	}
})

export const {
	getChatroomList: getChatroomListAction,
	createChatroom: createChatroomAction,
	addMember: addMemberAction,
	setSelectedChatroom: setSelectedChatroomAction,
	editChatroomMode: editChatroomModeAction,
	editChatroomName: editChatroomNameAction,
	sendMessage: sendMessageAction,
	deleteMessage: deleteMessageAction,
	getMessages: getMessagesAction,
	exitChatroom: exitChatroomAction,
	toggleParticipantStatus: toggleParticipantStatusAction,
	clearChatroomList: clearChatroomListAction,
	setMessageColor: setMessageColorAction
} = messagesSlice.actions

export default messagesSlice.reducer
