import { Button, Modal, Tabs } from '@mantine/core'
import {
	IconCaretRight,
	IconMenuOrder,
	IconMessageCircle,
	IconPhoto
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { logout } from '../redux/auth/thunk'
import { PREFIX, useAppDispatch, useAppSelector } from '../store'
import Contacts from './Contacts'
import Messages from './Messages'
import NewContactModal from './NewContactModal'
import NewMessageModal from './NewMessageModal'

const MESSAGES_KEY = 'messages'
const CONTACTS_KEY = 'contacts'

export default function SidePanel() {
	const dispatch = useAppDispatch()
	const [activeTab, setActiveTab] = useState<string | null>(CONTACTS_KEY)
	const [opened, setOpened] = useState<boolean>(false)

	const messageOpened = MESSAGES_KEY === activeTab
	const username = useAppSelector((state) => state.auth.username)
	const savedSize = window.localStorage.getItem(`${PREFIX}contactWidth`)
	const [size, setSize] = useState((savedSize && parseInt(savedSize)) || 250)

	// save value after resizing
	useEffect(() => {
		window.localStorage.setItem(`${PREFIX}contactWidth`, size.toString())
	}, [size])

	// Side Panel resize
	const mouseDownHandler = (
		mouseDownEvent: React.MouseEvent<HTMLButtonElement>
	) => {
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
	}

	const closeModal = () => {
		setOpened(false)
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
					<Contacts />
				</Tabs.Panel>

				<Tabs.Panel
					className='flex-grow-1'
					value={MESSAGES_KEY}
					pt='xs'
				>
					<Messages />
				</Tabs.Panel>
			</Tabs>
			<div className='text-muted small'>Username: {username}</div>
			<Button className='rounded-0' onClick={() => setOpened(true)}>
				NEW{' '}
				{messageOpened
					? MESSAGES_KEY.toUpperCase()
					: CONTACTS_KEY.toUpperCase()}
			</Button>
			<Button
				className='rounded-0'
				variant='outline'
				onClick={() => dispatch(logout())}
			>
				LOGOUT
			</Button>

			<Modal
				opened={opened}
				onClose={closeModal}
				size='auto'
				title={'New ' + activeTab}
			>
				{messageOpened ? (
					<NewMessageModal onClose={closeModal} />
				) : (
					<NewContactModal onClose={closeModal} />
				)}
			</Modal>
		</div>
	)
}
