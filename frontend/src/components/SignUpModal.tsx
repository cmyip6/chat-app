import { Button, Input, Modal } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useRef } from 'react'
import { Form } from 'react-bootstrap'
import { signUp } from '../redux/auth/thunk'
import { useAppDispatch } from '../store'

type SignUpModalProps = {
    opened: boolean,
    onClose: ()=>void
}

export default function SignUpModal(props: SignUpModalProps) {
    const dispatch = useAppDispatch()
    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const confirmPasswordRef = useRef<HTMLInputElement>(null)

    function handleSubmit (e: React.SyntheticEvent) {
        e.preventDefault()
        if (usernameRef.current?.value.length! >= 5 && passwordRef.current?.value.length && passwordRef.current.value === confirmPasswordRef.current?.value){
            dispatch(signUp(usernameRef.current?.value!, passwordRef.current.value))
            props.onClose()
        } else {
            showNotification({
                title: 'Registration notification',
                message: 'Incorrect Format'
            });
        }
    }

    return (
        <Modal opened={props.opened} onClose={props.onClose} title="Registration">
            <Form onSubmit={handleSubmit}>
                <Input.Wrapper label="Username">
                    <Input
                    type="text"
                    ref={usernameRef}
                    />
                </Input.Wrapper>
                <Input.Description>five or more characters</Input.Description>
                <Input.Wrapper label="Password">
                    <Input
                    type="text"
                    ref={passwordRef}
                    />
                </Input.Wrapper>
                <Input.Wrapper label="Confirm Password">
                    <Input
                    type="text"
                    ref={confirmPasswordRef}
                    />
                </Input.Wrapper>
                <Button type='submit'>Register</Button>
            </Form>
        </Modal>
    )
}