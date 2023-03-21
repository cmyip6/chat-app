import { ColorPicker, Container, Input, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import React, { useState } from 'react'
import { setMessageColorAction } from '../redux/messages/slice'
import { PREFIX, useAppDispatch, useAppSelector } from '../store'

export default function MessageColorControl() {
	const dispatch = useAppDispatch()
	const [value, setValue] = useState('#228be6')
	const selectedChatroom = useAppSelector(
		(state) => state.messages.selectedChatroom
	)
	const swatches = [
		'#25262b',
		'#868e96',
		'#fa5252',
		'#e64980',
		'#be4bdb',
		'#7950f2',
		'#4c6ef5',
		'#228be6',
		'#15aabf',
		'#12b886',
		'#40c057',
		'#82c91e',
		'#fab005',
		'#fd7e14'
	]

	const handleChangeEnd = (value: string) => {
		setValue(value)
		if (!selectedChatroom) {
			showNotification({
				message: 'Select a chatroom first',
				autoClose: 3000,
				icon: <IconAlertCircle />,
				color: 'red'
			})
		} else {
			window.localStorage.setItem(
				`${PREFIX}chatroom-${selectedChatroom}-messageBackground`,
				value
			)
			dispatch(
				setMessageColorAction({
					chatroomId: selectedChatroom,
					color: value
				})
			)
		}
	}

	return (
		<Container className='col-6 d-flex flex-column justify-content-center align-items-center gap-2 text-center'>
			<Title className='mb-2' order={5}>
				Message Control
			</Title>
			<Input.Wrapper label='Text Background and Opacity'>
				<ColorPicker
					format='hex'
					value={value}
					swatches={swatches}
					onChange={handleChangeEnd}
				/>
			</Input.Wrapper>
		</Container>
	)
}
