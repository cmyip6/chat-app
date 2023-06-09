import { Badge, Card, Input, Tooltip, useMantineTheme } from '@mantine/core'
import { IconCheck, IconSearch, IconUserPlus, IconX } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import {
	editChatroomModeAction,
	setMessageColorAction,
	setSelectedChatroomAction,
	toggleParticipantStatusAction
} from '../../redux/messages/slice'
import {
	editChatroomName,
	exitChatroom,
	getChatroomList,
	getMessages
} from '../../redux/messages/thunk'
import { PREFIX, socket, useAppDispatch, useAppSelector } from '../../store'
import { ConfirmationModal } from '../modals/ConfirmationModal'
import NewMemberModal from '../modals/NewMemberModal'

export default function ChatroomPanel() {
	const dispatch = useAppDispatch()
	const theme = useMantineTheme()

	const chatroomList = useAppSelector((state) => state.messages.chatroomList)
	const colorList = chatroomList?.map(state=>state.myMessageColor)
	const userId = useAppSelector((state) => state.auth.userId)
	const username = useAppSelector((state) => state.auth.username)
	const selected = useAppSelector((state) => state.messages.selectedChatroom)
	const editMode = useAppSelector((state) => state.messages.editChatroomName)
	const isStreaming = useAppSelector((state) => state.option.isStreaming)
	
	const [editName, setEditName] = useState('')
	const [search, setSearch] = useState('')
	const [opened, setOpened] = useState(false)
	const [memberModalOpened, setMemberModalOpened] = useState(false)
	const [targetChatroomId, setTargetChatroomId] = useState(0)
	const [deleteTarget, setDeleteTarget] = useState(0)

	useEffect(() => {
		socket.on('sendMessageResponse', (chatroomId) => {
			dispatch(getMessages(chatroomId))
		})
		socket.on('toggleParticipantStatusResponse', (data) => {
			dispatch(
				toggleParticipantStatusAction({
					chatroomId: data.chatroomId,
					participantId: data.participantId,
					isDeleted: data.isDeleted
				})
			)
		})

		return () => {
			socket.off('sendMessageResponse')
			socket.off('toggleParticipantStatusResponse')
			dispatch(editChatroomModeAction(0))
			setEditName('')
			setSearch('')
		}
	}, [])

	useEffect(() => {
		if (!userId) return
		socket.on('createChatroomResponse', (chatroom) => {
			dispatch(getChatroomList(userId))
		})
		return () => {
			socket.off('createChatroomResponse')
		}
	}, [userId])

	//manage search function
	const filteredChatroomList = useMemo(()=>{
		return chatroomList &&
		chatroomList.filter(
			(chatroom) =>
				(chatroom.chatroomName &&
					chatroom.chatroomName
						.toLowerCase()
						.includes(search.toLowerCase())) ||
				chatroom.participants.find(
					(participant) =>
						(participant.participantName !== username &&
							participant.participantName
								.toLowerCase()
								.includes(search.toLowerCase())) ||
						participant.participantNickname
							?.toLowerCase()
							.includes(search.toLowerCase())
				)
		)
	}, [JSON.stringify(chatroomList), search])

	//get saved message color from local storage
	useEffect(() => {
		if (!chatroomList) return
		for (let chatroom of chatroomList) {
			const savedColor = window.localStorage.getItem(
				`${PREFIX}chatroom-${chatroom.chatroomId}-messageBackground`
			)
			if (savedColor) {
				dispatch(
					setMessageColorAction({
						chatroomId: chatroom.chatroomId,
						color: savedColor
					})
				)
			}
		}
	}, [JSON.stringify(colorList)])


	function handleBlur(
		chatroomId: number,
		newName: string,
		originalName?: string
	) {
		if (originalName !== newName && newName.length) {
			dispatch(editChatroomName(chatroomId, newName))
		}
		dispatch(editChatroomModeAction(0))
		setEditName('')
	}

	function handleEdit(chatroomId: number, chatroomName?: string) {
		if(isStreaming) return
		dispatch(editChatroomModeAction(chatroomId))
		setEditName(chatroomName || '')
	}

	function handleSubmit(chatroomId: number) {
		dispatch(editChatroomName(chatroomId, editName))
		dispatch(editChatroomModeAction(0))
		setEditName('')
	}

	function handleDelete(chatroomId: number) {
		if(isStreaming) return
		setDeleteTarget(chatroomId)
		setOpened(true)
	}

	const handleEditNameKeyDown = (key: string, chatroomId: number) => {
		if (key === 'Enter') {
			handleSubmit(chatroomId)
		}
	}

	function onClose() {
		setOpened(false)
		setDeleteTarget(0)
		dispatch(setSelectedChatroomAction(0))
	}

	function onDelete() {
		if (!userId || isStreaming) return
		dispatch(exitChatroom(deleteTarget, userId))
		onClose()
	}

	function inviteNewMemberHandler(chatroomId: number) {
		if(isStreaming) return
		setTargetChatroomId(chatroomId)
		setMemberModalOpened(true)
	}

	function onAddNewMemberModalClose() {
		setTargetChatroomId(0)
		setMemberModalOpened(false)
	}

	return (
		<div
			id='content-container'
			style={{ overflow: 'auto', height: '80vh' }}
		>
			<Input.Wrapper label='Search' style={{ margin: '2px' }}>
				<Input
					value={search}
					icon={<IconSearch size={20} />}
					placeholder='Username / Group Name'
					onChange={(e) => setSearch(e.currentTarget.value)}
					rightSection={
						search.length ? (
							<IconX size={16} onClick={() => setSearch('')} />
						) : undefined
					}
				/>
			</Input.Wrapper>
			<div>
				{filteredChatroomList &&
					filteredChatroomList.map((chatroom) => (
						<Tooltip
							key={chatroom.chatroomId}
							disabled={
								!chatroom.isGroup ||
								!!(
									chatroom.chatroomName &&
									chatroom.chatroomName.length <= 24
								)
							}
							label={
								chatroom.chatroomName ||
								'Double Click to Edit Name'
							}
						>
							<div
								style={{
									position: 'relative',
									overflowY: 'hidden',
									overflowX: 'visible'
								}}
							>
								<Card
									shadow='sm'
									radius='md'
									withBorder
									className='text-center d-flex flex-column justify-content-center'
									style={{
										minHeight: '70px',
										cursor: 'pointer',
										backgroundColor:
											selected === chatroom.chatroomId
												? theme.primaryColor
												: undefined
									}}
									onClick={() =>{
										if(isStreaming) return
										dispatch(setSelectedChatroomAction(chatroom.chatroomId))
										}
									}
								>
									{chatroom.isGroup && (
										<Badge
											variant='subtle'
											size='lg'
											radius='xs'
											fullWidth
											onDoubleClick={() =>
												handleEdit(
													chatroom.chatroomId,
													chatroom.chatroomName
												)
											}
											rightSection={
												editMode ===
													chatroom.chatroomId ? (
													<IconCheck
														size={14}
														onClick={() =>
															handleSubmit(
																chatroom.chatroomId
															)
														}
													/>
												) : (
													''
												)
											}
										>
											{editMode ===
												chatroom.chatroomId ? (
												<Input
													autoFocus
													onBlur={() =>
														handleBlur(
															chatroom.chatroomId,
															editName,
															chatroom.chatroomName
														)
													}
													onKeyDown={(e) =>
														handleEditNameKeyDown(
															e.key,
															chatroom.chatroomId
														)
													}
													value={editName}
													onChange={(e) =>
														setEditName(
															e.currentTarget
																.value
														)
													}
												/>
											) : (
												chatroom.chatroomName
											)}
										</Badge>
									)}

									<span>
										{chatroom.isGroup
											? chatroom.participants
												.filter(
													(participant) =>
														participant.isDeleted ===
														false
												)
												.map(
													(participant) =>
														participant.participantNickname ||
														participant.participantName
												)
												.map((name) =>
													name === username
														? 'You'
														: name
												)
												.sort()
												.join(', ')
											: chatroom.participants.map(
												(participant) =>
													participant.participantId !==
													userId &&
													(participant.participantNickname ||
														participant.participantName)
											)}
										{chatroom.isGroup && (
											<Badge
												style={{
													padding: '1px',
													marginLeft: '5px'
												}}
												onClick={() =>
													inviteNewMemberHandler(
														chatroom.chatroomId
													)
												}
											>
												<IconUserPlus size={18} />
											</Badge>
										)}
									</span>

									<Tooltip
										onMouseEnter={(e) =>
											e.stopPropagation()
										}
										label={
											chatroom.isGroup
												? 'Quit group'
												: 'Archive chat'
										}
									>
										<span
											style={{
												position: 'absolute',
												top: '0px',
												right: '5px',
												padding: '0px'
											}}
											onClick={() =>
												handleDelete(
													chatroom.chatroomId
												)
											}
										>
											<IconX
												color={
													selected ===
														chatroom.chatroomId
														? 'white'
														: undefined
												}
												size={15}
											/>
										</span>
									</Tooltip>
									{chatroom.isGroup && (
										<Badge
											size='xs'
											variant='light'
											style={{
												position: 'absolute',
												top: '2px',
												left: '2px',
												padding: '1px'
											}}
										>
											Group
										</Badge>
									)}
								</Card>
							</div>
						</Tooltip>
					))}
			</div>
			<ConfirmationModal
				isShow={opened}
				onClose={onClose}
				onDelete={onDelete}
			/>
			<NewMemberModal
				isShow={memberModalOpened}
				onClose={onAddNewMemberModalClose}
				chatroomId={targetChatroomId}
			/>
		</div>
	)
}
