import { Button, Card, Divider, Group, Input, Tooltip } from '@mantine/core'
import { IconPointFilled, IconSearch, IconX } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { setEditModeAction, toggleOnlineAction } from '../../redux/contacts/slice'
import { deleteContact, editContactName } from '../../redux/contacts/thunk'
import { createChatroom } from '../../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../../store'
import { ConfirmationModal } from '../modals/ConfirmationModal'

export default function ContactsPanel() {
	const dispatch = useAppDispatch()

	const contactList = useAppSelector((state) => state.contacts.contactsList)
	const editTarget = useAppSelector((state) => state.contacts.editTarget)
	const isStreaming = useAppSelector((state) => state.option.isStreaming)

	const [editName, setEditName] = useState('')
	const [search, setSearch] = useState('')
	const [opened, setOpened] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState(0)

	const filteredContactList = useMemo(() => {
		return contactList &&
			contactList.filter(
				(contact) =>
					contact.contactUsername.includes(search) ||
					contact.nickname?.toLowerCase().includes(search)
			)
	}, [JSON.stringify(contactList), search])

	useEffect(() => {
		socket.on('loginResponse', (user) => {
			console.log('loginResponse')
			if (
				contactList?.find(
					(contact) => contact.contactUsername === user.username
				)
			) {
				dispatch(
					toggleOnlineAction({
						username: user.username,
						isOnline: true
					})
				)
			}
		})
		socket.on('logoutResponse', (user) => {
			console.log('logoutResponse')
			if (
				contactList?.find(
					(contact) => contact.contactUsername === user.username
				)
			) {
				dispatch(
					toggleOnlineAction({
						username: user.username,
						isOnline: false
					})
				)
			}
		})
		return () => {
			socket.off('loginResponse')
			socket.off('logoutResponse')
		}
	}, [])

	function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		if (isStreaming) return
		e.preventDefault()
		setOpened(true)
		setDeleteTarget(parseInt(e.currentTarget.value))
	}

	function handleBlur(contactId: number) {
		if (isStreaming) return
		if (editName && editName.length) {
			dispatch(editContactName(contactId, editName))
		}
		dispatch(setEditModeAction(0))
	}

	function handleDoubleClick(contactId: number, currentName: string) {
		if (isStreaming) return
		dispatch(setEditModeAction(contactId))
		setEditName(currentName)
	}

	function handleKeydown(key: string, contactId: number) {
		if (key === 'Enter') {
			handleBlur(contactId)
		}
	}

	function onClose() {
		setOpened(false)
		setDeleteTarget(0)
	}

	function onDelete() {
		if (isStreaming) return
		dispatch(deleteContact(deleteTarget))
		onClose()
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
					placeholder='Username'
					onChange={(e) => setSearch(e.currentTarget.value)}
					rightSection={
						search.length ? (
							<IconX size={16} onClick={() => setSearch('')} />
						) : undefined
					}
				/>
			</Input.Wrapper>
			<Divider
				labelPosition='center'
				my='md'
				label='Online'
				color={'dark'}
			/>
			{(filteredContactList !== null || undefined) &&
				filteredContactList!
					.filter((contact) => contact.isOnline)
					.map((contact) => {
						return (
							<div
								key={contact.contactId}
								style={{ position: 'relative' }}
							>
								<Card
									shadow='sm'
									radius='md'
									onClick={() => {
										if (isStreaming) return
										dispatch(
											createChatroom([
												contact.contactUsername
											])
										)
									}}
									onDoubleClick={() => {
										handleDoubleClick(
											contact.contactId,
											contact.nickname ||
											contact.contactUsername
										)
									}}
									withBorder
								>
									<Group position='left' mt='md' mb='xs'>
										{editTarget !== contact.contactId && <IconPointFilled
											style={{
												color: contact.isOnline
													? 'green'
													: 'darkred'
											}}
										/>}
										{editTarget === contact.contactId ? (
											<Input.Wrapper label='Change Name'>
												<Input
													value={editName}
													autoFocus
													onKeyDown={(e) =>
														handleKeydown(
															e.key,
															contact.contactId
														)
													}
													onChange={(e) =>
														setEditName(
															e.currentTarget
																.value
														)
													}
													onBlur={() =>
														handleBlur(
															contact.contactId
														)
													}
												/>
											</Input.Wrapper>
										) : (
											<Tooltip label={'Double click to edit'}>
												<div>
													{contact.nickname ||
														contact.contactUsername}
												</div>
											</Tooltip>
										)}
									</Group>

									<div
										style={{
											position: 'absolute',
											right: '10px',
											top: '20px'
										}}
									>
										<Button
											value={contact.contactId}
											variant='subtle'
											onClick={(e) => handleDelete(e)}
											style={{
												width: '20px',
												height: '20px',
												padding: '0px'
											}}
										>
											<IconX />
										</Button>
									</div>
								</Card>
							</div>
						)
					})}
			<Divider
				labelPosition='center'
				my='md'
				label='Offline'
				color={'dark'}
			/>
			{filteredContactList !== null &&
				filteredContactList!
					.filter((contact) => contact.isOnline !== true)
					.map((contact) => {
						return (
							<div
								key={contact.contactId}
								style={{ position: 'relative' }}
							>
								<Card
									shadow='sm'
									radius='md'
									onClick={() => {
										if (isStreaming) return
										dispatch(
											createChatroom([
												contact.contactUsername
											])
										)
									}}
									onDoubleClick={() => {
										handleDoubleClick(
											contact.contactId,
											contact.nickname ||
											contact.contactUsername
										)
									}}
									withBorder
								>
									<Group position='left' mt='md' mb='xs'>
										{editTarget !== contact.contactId && <IconPointFilled
											style={{
												color: contact.isOnline
													? 'green'
													: 'darkred'
											}}
										/>}
										{editTarget === contact.contactId ? (
											<Input.Wrapper label='Change Name'>
												<Input
													value={editName}
													autoFocus
													onKeyDown={(e) =>
														handleKeydown(
															e.key,
															contact.contactId
														)
													}
													onChange={(e) =>
														setEditName(
															e.currentTarget
																.value
														)
													}
													onBlur={() =>
														handleBlur(
															contact.contactId
														)
													}
												/>
											</Input.Wrapper>
										) : (
											<Tooltip label={'Double click to edit'}>
												<div>
													{contact.nickname ||
														contact.contactUsername}
												</div>
											</Tooltip>
										)}
									</Group>

									<div
										style={{
											position: 'absolute',
											right: '10px',
											top: '20px'
										}}
									>
										<Button
											value={contact.contactId}
											variant='subtle'
											onClick={(e) => handleDelete(e)}
											style={{
												width: '20px',
												height: '20px',
												padding: '0px'
											}}
										>
											<IconX />
										</Button>
									</div>
								</Card>
							</div>
						)
					})}
			<ConfirmationModal
				isShow={opened}
				onClose={onClose}
				onDelete={onDelete}
			/>
		</div>
	)
}
