import { Input, Tooltip, Loader, Button, Group } from '@mantine/core';
import { IconAlertCircle, IconChecks} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../store';
import { FormEvent, useRef, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { checkUsername, createContact } from '../redux/contacts/thunk';
import { checkUsernameAction, setTargetUserAction } from '../redux/contacts/slice';

type ModalProps = {
    onClose: ()=>void
}

export default function NewContactModal( props: ModalProps ) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const check = useAppSelector((state)=>state.contacts.checkUsername)
    const usernameRef = useRef<HTMLInputElement>(null)
    const nicknameRef = useRef<HTMLInputElement>(null)

    const waitTime = 3000;
    let timer: ReturnType<typeof setTimeout>;
    // eslint-disable-next-line
    const pattern = /[.,\/#!@$%\^&\*;:{}=\-_`~()\s]/g;

    function keyDownHandler() {
        setLoading(true);
        clearTimeout(timer);
    }
    
    function keyUpHandler() {
        timer = setTimeout(() => {
            if (pattern.test(usernameRef.current?.value!) || usernameRef.current?.value.length! < 5) {
                showNotification({
                    title: 'Username Format Incorrect',
                    message: 'Input field is empty or contains invalid characters, please remove them and try again'
                });
                setLoading(false);
            } else {
                dispatch(checkUsername(usernameRef.current?.value.trim()!));
                setLoading(false);
                clearTimeout(timer)
            }
        }, waitTime);
    }

    const onClose = () => {
        setLoading(false)
        dispatch(checkUsernameAction(false))
        dispatch(setTargetUserAction(0))
        clearTimeout(timer)
        props.onClose()
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(createContact(nicknameRef.current?.value!));
        onClose();
    }

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            <Input.Wrapper label='Search by username' required style={{marginBottom: '10px'}}>
                <Input
                    onKeyDown={keyDownHandler}
                    onKeyUp={keyUpHandler}
                    ref={usernameRef!}
                    placeholder='Input username'
                    rightSection={
                        <Tooltip label='Input Username and Wait 3 Seconds' position='top-end' withArrow>
                            {loading ? (
                                <Loader variant='dots' />
                            ) : check ? (
                                <IconChecks size={18} style={{ color: 'green' }} />
                            ) : (
                                <IconAlertCircle
                                    size={18}
                                    style={{
                                        display: 'block',
                                        opacity: 0.5
                                    }}
                                />
                            )}
                        </Tooltip>
                    }
                />
            </Input.Wrapper>
            {check && <Input.Wrapper label='Name this user' required style={{marginBottom: '10px'}}>
                <Input
                    ref={nicknameRef!}
                    placeholder='Give him/her a nickname'
                />
            </Input.Wrapper>}
            
            {check && <Button variant='light' fullWidth type="submit">Confirm</Button>}
            
        </form>
    );
}


