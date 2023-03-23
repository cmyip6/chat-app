import { useEffect } from 'react'
import { getContactsListAction } from '../../redux/contacts/slice'
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

	useEffect(() => {
		if (login && userId) {
			dispatch(getContactList(userId))
			dispatch(getChatroomList(userId))
		}
	}, [login, userId])

	useEffect(() => {
		if (contactList === null) return
		socket.on('getOnlineUserListResponse', (contactList) => {
			dispatch(getContactsListAction(contactList))
		})

		return () => {
			socket.off('getOnlineUserListResponse')
		}
	}, [contactList])

	return (
		<div className='d-flex' style={{ height: '100vh' }}>
			<SidePanel />
			<Conversations />
		</div>
	)
}
