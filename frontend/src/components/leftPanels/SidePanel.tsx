import { Button, Modal, Tabs } from '@mantine/core'
import {
	IconAlertCircle,
	IconCaretRight,
	IconMenuOrder,
	IconMessageCircle,
	IconPhoto
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { logout } from '../../redux/auth/thunk'
import { PREFIX, useAppDispatch, useAppSelector } from '../../store'
import ContactsPanel from './ContactsPanel'
import ChatroomPanel from './ChatroomPanel'
import NewContactModal from '../modals/NewContactModal'
import NewChatroomModal from '../modals/NewChatroomModal'
import { hideNotification, showNotification } from '@mantine/notifications'
import { setNotificationPositionAction } from '../../redux/option/slice'

const MESSAGES_KEY = 'messages'
const CONTACTS_KEY = 'contacts'

export default function SidePanel() {
	const dispatch = useAppDispatch()
	const [activeTab, setActiveTab] = useState<string | null>(CONTACTS_KEY)
	const [opened, setOpened] = useState<boolean>(false)

	const messageOpened = MESSAGES_KEY === activeTab
	const isStreaming = useAppSelector(state => state.option.isStreaming)
	const username = useAppSelector((state) => state.auth.username)
	const savedSize = window.localStorage.getItem(`${PREFIX}contactWidth`)
	const [size, setSize] = useState((savedSize && parseInt(savedSize)) || 250)

	// save value after resizing
	useEffect(() => {
		window.localStorage.setItem(`${PREFIX}contactWidth`, size.toString())
	}, [size])

	// Side Panel resize
	const mouseDownHandler = useCallback((mouseDownEvent: React.MouseEvent<HTMLButtonElement>) => {
		const startSize = size
		const startPosition = mouseDownEvent.pageX

		function onMouseMove(e: MouseEvent): void {
			const width = startSize - startPosition + e.pageX
			if (width < 200) {
				setSize(20)
			} else {
				setSize(width)
			}
		}

		function onMouseUp() {
			document.body.removeEventListener('mousemove', onMouseMove)
		}

		document.body.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp, { once: true })

	}, [size])

	const logoutHandler = () => {
		if (isStreaming) {
			dispatch(setNotificationPositionAction('bottom-left'))
			showNotification({
				id: 'logout',
				title: 'Logout Warning',
				message: 'Continue logout will stop your streaming, click ! to proceed or close this box to cancel',
				icon: <IconAlertCircle onClick={() => {
					dispatch(logout())
					hideNotification('logout')
				}} />,
				color: 'red',
				autoClose: 5000,
				onClose: () => dispatch(setNotificationPositionAction('bottom-right'))
			})
		} else {
			dispatch(logout())
		}
	}

	return (
		<div
			style={{
				width: `${size}px`,
				boxShadow: '1px 0px 0px #E6E6E6',
				position: 'relative',
				visibility: `${size <= 50 ? 'hidden' : 'visible'}`
			}}
			className='d-flex flex-column'
		>
			<Button
				size='xs'
				variant='subtle'
				id={`drag-button${size === 20 ? '-closed' : ''}`}
				onMouseDown={mouseDownHandler}
				onClick={() =>
					size === 20
						? setSize(250)
						: size === 250
							? setSize(20)
							: null
				}
			>
				{size === 20 ? (
					<IconCaretRight size={30} />
				) : (
					<IconMenuOrder size={25} />
				)}
			</Button>

			<Tabs
				value={activeTab}
				onTabChange={setActiveTab}
				className='d-flex flex-column border-right overflow-auto flex-grow-1'
			>
				<Tabs.List position='center' grow>
					<Tabs.Tab
						value={CONTACTS_KEY}
						icon={<IconPhoto size='0.8rem' />}
					>
						Contacts
					</Tabs.Tab>
					<Tabs.Tab
						value={MESSAGES_KEY}
						icon={<IconMessageCircle size='0.8rem' />}
					>
						Messages
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel
					className='flex-grow-1'
					value={CONTACTS_KEY}
					pt='xs'
				>
					<ContactsPanel />
				</Tabs.Panel>

				<Tabs.Panel
					className='flex-grow-1'
					value={MESSAGES_KEY}
					pt='xs'
				>
					<ChatroomPanel />
				</Tabs.Panel>
			</Tabs>
			<div className='text-muted small'>Username: {username}</div>
			<Button className='rounded-0' onClick={() => {
				if (isStreaming) return
				setOpened(true)
			}}>
				NEW{' '}
				{messageOpened
					? MESSAGES_KEY.toUpperCase()
					: CONTACTS_KEY.toUpperCase()}
			</Button>
			<Button
				className='rounded-0'
				variant='outline'
				onClick={logoutHandler}
			>
				LOGOUT
			</Button>

			<Modal
				centered
				opened={opened}
				onClose={()=>setOpened(false)}
				size='md'
				title={'New ' + activeTab}
			>
				{messageOpened ? (
					<NewChatroomModal onClose={()=>setOpened(false)} />
				) : (
					<NewContactModal onClose={()=>setOpened(false)} />
				)}
			</Modal>
		</div>
	)
}
