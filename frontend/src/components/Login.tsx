import React, { useRef, useState } from 'react'
import { Button, Container, Form } from 'react-bootstrap'
import { useAppDispatch } from '../store'
import { login } from '../redux/auth/thunk'
import SignUpModal from './SignUpModal'

export default function Login() {
    const dispatch = useAppDispatch()
    const [toggle, setToggle] = useState(false)
    const passwordRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)

    function handleSubmit (e: React.SyntheticEvent) {
        e.preventDefault()
        dispatch(login(nameRef.current?.value!, passwordRef.current?.value!))
    }

    return (
        <Container className='align-items-center d-flex' style={{height: '100vh'}}>
            <Form className='w-100' onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>
                        Enter Your Username
                    </Form.Label>
                    <Form.Control type='text' ref={nameRef} required>
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label>
                        Enter Your Password
                    </Form.Label>
                    <Form.Control type='text' ref={passwordRef} required>
                    </Form.Control>
                </Form.Group>
                <Button type='submit' className='m-2'>
                    Login
                </Button>
                <Button onClick={()=>setToggle(true)} variant='secondary'>Create Account</Button>
            </Form>
            <SignUpModal opened={toggle} onClose={()=>setToggle(false)}/>
        </Container>
    )
}
