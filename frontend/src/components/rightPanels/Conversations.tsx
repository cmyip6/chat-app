import {
	Button,
	Loader,
	Tooltip,
} from '@mantine/core'
import { IconArrowBigDownLines, IconDots, IconSend, IconVideo } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { deleteMessageAction } from '../../redux/messages/slice'
import { sendMessage } from '../../redux/messages/thunk'
import { setNotificationPositionAction, toggleIsStreamingAction } from '../../redux/option/slice'
import { socket, useAppDispatch, useAppSelector } from '../../store'
import Messages from './Messages'
import OptionPanel from '../bottomPanels/OptionPanel'
import Streaming from './Streaming'
import { showNotification } from '@mantine/notifications'
import { ConfirmationModal } from '../modals/ConfirmationModal'

export default function Conversations() {
	const [text, setText] = useState('')
	const dispatch = useAppDispatch()
	const userId = useAppSelector((state) => state.auth.userId)!
	const username = useAppSelector((state) => state.auth.username)!
	const isStreaming = useAppSelector((state) => state.option.isStreaming)
	const selectedChatroom = useAppSelector(
		(state) => state.messages.selectedChatroom
	)!
	const chatroomList = useAppSelector((state) => state.messages.chatroomList)
	const contactList = useAppSelector((state) => state.contacts.contactsList)
	const [messageList] =
		chatroomList?.filter(
			(chatroom) => chatroom.chatroomId === selectedChatroom
		) || []
	const [typing, setTyping] = useState('')
	const [roomId, setRoomId] = useState(0)
	const [scroll, setScroll] = useState(false)
	const [opened, setOpened] = useState(false)


	useEffect(() => {
		return () => {
			dispatch(toggleIsStreamingAction(false))
		}
	}, [])

	useEffect(() => {
		if (contactList === null) return
		socket.on('typingResponse', (data) => {
			if (parseInt(data.selectedChatroom) !== selectedChatroom) {
				return
			} else if (data.username === username) {
				return
			} else {
				const nickname = contactList.find(
					(contact) => contact.contactUsername === data.username
				)?.nickname
				const message = nickname || data.username
				setRoomId(data.selectedChatroom)
				setTyping(message)
				const timer = setTimeout(() => {
					setTyping('')
				}, 1000)

				return () => clearTimeout(timer)
			}
		})
		return () => {
			socket.off('typingResponse')
		}
	}, [JSON.stringify(contactList), selectedChatroom, username])

	useEffect(() => {
		socket.on('deleteMessageResponse', (messageId) => {
			dispatch(deleteMessageAction(messageId))
		})
		return () => {
			socket.off('deleteMessageResponse')
		}
	}, [JSON.stringify(messageList)])

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		dispatch(sendMessage(userId, selectedChatroom, text))
		setText('')
	}

	function handleTyping(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') {
			e.preventDefault()
			dispatch(sendMessage(userId, selectedChatroom, text))
			setText('')
		} else {
			socket.emit('typing', { username, selectedChatroom })
		}
	}

	function toggleStreaming() {
		if (!selectedChatroom) {
			dispatch(setNotificationPositionAction('top-center'))
			showNotification({
				title: 'We notify you that',
				message: 'You should select a chat before starting a video call',
				color: 'red',
				icon: <IconDots />,
				variant: 'outline',
				onClose: () => dispatch(setNotificationPositionAction('bottom-right'))
			})
		} else if(isStreaming) {
			setOpened(true)
		} else {
			dispatch(toggleIsStreamingAction(!isStreaming))
		}
	}

	function onConfirmDelete(){
		dispatch(toggleIsStreamingAction(false))
		setOpened(false)
	}

	return (
		<div className='d-flex flex-column flex-grow-1 overflow-hidden'>
			{isStreaming ? <Streaming /> : <Messages scroll={scroll} scrollEnd={()=>setScroll(false)}/>}
			<div
				className='m-2 text-muted small d-flex'
				style={{
					width: '100%',
					minHeight: '19px',
					justifyContent: 'space-between'
				}}
			>
				<p>
					{roomId === selectedChatroom && typing && (
						<>
							{typing} <Loader variant='dots' />
						</>
					)}
				</p>
				<div className='d-flex justify-content-center align-items-center' style={{ gap: '20px' }}>
					<Tooltip label={isStreaming? 'End Video Call':'Start Video Call'} >
						<Button
							variant={isStreaming ? 'filled' : 'outline'}
							style={{ padding: '0px', width: '40px', height: '40px', margin: isStreaming ? '30px' : '0px' }}
							radius={50}
							onClick={toggleStreaming}
						>
							<IconVideo />
						</Button>
					</Tooltip>

					{
						!isStreaming &&
						<Tooltip label='Scroll to bottom'>
							<Button
								variant='subtle'
								style={{
									height: 'fit-content',
									padding: '0px',
									marginRight: '30px'
								}}
								onClick={() => setScroll(true)}
							>
								<IconArrowBigDownLines size={20} />
							</Button>
						</Tooltip>
					}
				</div>
			</div>
			{
				!isStreaming &&
				<>
					<Form onSubmit={handleSubmit}>
						<Form.Group className='m-2' style={{ position: 'relative' }}>
							<InputGroup>
								<Form.Control
									as='textarea'
									rows={1}
									autoFocus
									required
									value={text}
									aria-describedby='basic-addon2'
									onKeyDown={handleTyping}
									onChange={(e) => setText(e.currentTarget.value)}
									style={{ resize: 'none' }}
								/>
								<Button radius='sm' type='submit'>
									<IconSend size={14} />
								</Button>
							</InputGroup>
						</Form.Group>
					</Form>
					<OptionPanel />
				</>
			}
			<ConfirmationModal 
				onClose={()=>setOpened(false)} 
				onDelete={onConfirmDelete} 
				isShow={opened}
				message='Action will disconnect streaming, are you sure?'
				/>
		</div>
	)
}
