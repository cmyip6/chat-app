import { Button, Checkbox, Input, Modal } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useState } from 'react'
import { addMember } from '../redux/messages/thunk'
import { useAppDispatch, useAppSelector } from '../store'

export default function NewMemberModal(props: {
	isShow: boolean
	onClose: () => void
	chatroomId: number
}) {
	const dispatch = useAppDispatch()
	const contactList = useAppSelector((state) => state.contacts.contactsList)
	const [value, setValue] = useState<string[]>([])
	const [searchName, setSearchName] = useState('')

	const filteredContactList = contactList?.filter(
		(contact) =>
			contact.nickname?.includes(searchName) ||
			contact.contactUsername?.includes(searchName)
	)

	function onClick() {
		if (value.length) {
			dispatch(addMember(value, props.chatroomId))
			props.onClose()
			setSearchName('')
		} else {
			showNotification({
				title: 'Add Member Notification',
				message: 'Select at least One contact'
			})
		}
	}

	return (
		<Modal
			centered
			opened={props.isShow}
			onClose={props.onClose}
			size='auto'
			title='Add New Member'
		>
			<Input.Wrapper label='Search' style={{ marginBottom: '10px' }}>
				<Input
					value={searchName}
					onChange={(e) => setSearchName(e.currentTarget.value)}
				/>
			</Input.Wrapper>
			<Input.Wrapper
				label='Select Users'
				required
				style={{ marginBottom: '10px' }}
			>
				<Checkbox.Group value={value} onChange={setValue}>
					{filteredContactList?.map((contact) => (
						<Checkbox
							key={contact.contactUsername}
							value={contact.contactUsername}
							label={contact.nickname || contact.contactUsername}
						/>
					))}
				</Checkbox.Group>
			</Input.Wrapper>

			{value.length > 0 && (
				<Button variant='light' fullWidth onClick={onClick}>
					Add
				</Button>
			)}
		</Modal>
	)
}
