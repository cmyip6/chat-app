import { useEffect } from 'react'
import { getContactsListAction, toggleOnlineAction } from '../../redux/contacts/slice'
import { getContactList } from '../../redux/contacts/thunk'
import { getChatroomList } from '../../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../../store'
import Conversations from '../rightPanels/Conversations'
// import SideBar from './SideBar'
import SidePanel from '../leftPanels/SidePanel'

export default function Home() {
	const dispatch = useAppDispatch()
	const login = useAppSelector((state) => state.auth.isLoggedIn)
	const userId = useAppSelector((state) => state.auth.userId)
	const contactList = useAppSelector((state) => state.contacts.contactsList)
	const chatroomList = useAppSelector((state) => state.messages.chatroomList)

	useEffect(() => {
		if (login && userId) {
			dispatch(getContactList(userId))
			dispatch(getChatroomList(userId))
		}
	}, [login, userId])

	useEffect(() => {
		if (contactList === null || contactList?.length === 0) return
		socket.on('getOnlineUserListResponse', (contactList) => {
			dispatch(getContactsListAction(contactList))
		})

		return () => {
			socket.off('getOnlineUserListResponse')
		}
	}, [JSON.stringify(contactList)])

	return (
		<div className='d-flex' style={{ height: '100vh' }}>
			{
				contactList !== null && chatroomList !== null &&
				<>
					<SidePanel />
					<Conversations />
				</>
			}
		</div>
	)
}
