import { Badge, Button, Tooltip } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import React, { useEffect, useRef, useState } from 'react'
import { Form, InputGroup, Button as BootstrapButton } from 'react-bootstrap'
import { setTargetUserAction } from '../redux/contacts/slice'
import { createContact } from '../redux/contacts/thunk'
import { getMessages, sendMessage } from '../redux/messages/thunk'
import { useAppDispatch, useAppSelector } from '../store'

export default function Conversations() {
    const [text, setText] = useState("")
    const dispatch = useAppDispatch()
    const userId = useAppSelector(state => state.auth.userId)!
    const selectedChatroom = useAppSelector(state => state.messages.selectedChatroom)!
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const messageList = useAppSelector(state => state.messages.messageList) || []
    const chatroomList = useAppSelector(state => state.messages.chatroomList)
    const contactList = useAppSelector(state => state.contacts.contactsList)
    const lastMessageRef = useRef<HTMLInputElement>(null)

    useEffect(()=>{
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView()
        }
    },[messageList])

    useEffect(() => {
        if (selectedChatroom) {
            dispatch(getMessages(selectedChatroom))
        }
    }, [dispatch, selectedChatroom])

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        dispatch(sendMessage(userId, selectedChatroom, text))
        setText('')
    }

    function handleAddContact(targetId: number) {
        dispatch(setTargetUserAction(targetId))
        dispatch(createContact())
    }


    return (
        <div className='d-flex flex-column flex-grow-1'>
            <div className='flex-grow-1 overflow-auto'>
                <div id='content-container' className='d-flex flex-column align-items-start justify-content-end px-3'>
                    {messageList?.map((message, index) => {
                        const lastMessage = messageList.length - 1 === index
                        const isQuitted = chatroomList?.find(chatroom => 
                                chatroom.chatroomId === selectedChatroom)?.participants.find(participant=> 
                                    participant.participantId=== message.senderId)?.isDeleted

                        return (
                            <div
                                ref={lastMessage ? lastMessageRef : null}
                                key={message.messageId}
                                className={`my-1 d-flex flex-column  ${message.senderId === userId ? 'align-self-end' : ''}`}
                            >
                                <div className={`rounded px-2 py-1 ${message.isSystemMessage? 'bg-secondary text-white': message.senderId === userId ? 'bg-primary text-white' : 'border'}`}>
                                    {message.isSystemMessage? <><Badge size='lg' color="red" radius="xs" variant="dot" style={{color: "white"}}>SYSTEM MESSAGE</Badge>  {message.content}</> : message.content}
                                </div>
                                <div className='text-muted small' style={{ textAlign: message.senderId === userId ? 'right' : 'left' }}>
                                    {message.senderId === userId ? 'You' : 
                                        contactList?.find(contact => contact.contactUsername === message.senderUsername)?.nickname || message.senderUsername
                                    }
                                    {isQuitted && <span> ( Not In Chat )</span>}
                                    {message.senderId !== userId && !contactList?.find(contact => contact.contactUsername === message.senderUsername) && 
                                        <Tooltip color="blue" label='Add to contacts'>
                                            <Button
                                            variant='subtle'
                                            style={{height: '15px'}}
                                            onClick={() => handleAddContact(message.senderId)}
                                            >
                                                +
                                            </Button> 
                                        </Tooltip>
                                    }
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className='m-2'>
                    <InputGroup>
                        <Form.Control
                            as='textarea'
                            rows={1}
                            autoFocus
                            required
                            value={text}
                            aria-describedby="basic-addon2"
                            onChange={e => setText(e.currentTarget.value)}
                            style={{ resize: 'none' }}
                        />
                        <BootstrapButton type='submit'><IconSend size={14}/></BootstrapButton>

                    </InputGroup>
                </Form.Group>
            </Form>
        </div>
    )
}
