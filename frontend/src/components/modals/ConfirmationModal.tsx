import { Alert, Button, Group, Modal } from '@mantine/core'
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react'

interface ConfirmationHubProps {
	isShow: boolean
	onDelete: () => void
	onClose: () => void
	message?: string 
}

export function ConfirmationModal(props: ConfirmationHubProps) {
	const defaultMessage = 'This Action cannot be reversed. Are you sure to proceed?'
	return (
		<Modal
			centered
			opened={props.isShow}
			title='Confirmation Required'
			onClose={props.onClose}
		>
			<Alert
				icon={<IconAlertCircle />}
				title='Attention!'
				color='red'
				radius='md'
			>
				{props.message ?? defaultMessage}
			</Alert>

			<Group position='center' style={{ paddingTop: '10px' }}>
				<Button
					leftIcon={<IconCheck size={16} />}
					variant='white'
					onClick={props.onDelete}
				>
					Confirm
				</Button>
				<Button
					leftIcon={<IconX />}
					variant='white'
					onClick={props.onClose}
				>
					Cancel
				</Button>
			</Group>
		</Modal>
	)
}
