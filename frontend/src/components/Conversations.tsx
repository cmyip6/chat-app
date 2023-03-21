import { Badge, Button, HoverCard, Loader, Tooltip, useMantineTheme } from '@mantine/core'
import { IconArrowBigDownLines, IconSend } from '@tabler/icons-react'
import React, { useEffect, useRef, useState } from 'react'
import { Form, InputGroup, Container } from 'react-bootstrap'
import { setTargetUserAction } from '../redux/contacts/slice'
import { createContact } from '../redux/contacts/thunk'
import { deleteMessageAction } from '../redux/messages/slice'
import { getChatroomList, sendMessage, deleteMessage } from '../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../store'
import { ConfirmationHub } from './ConfirmationHub'
import OptionPanel from './OptionPanel'

export default function Conversations() {
    const [text, setText] = useState("")
    const dispatch = useAppDispatch()
    const theme = useMantineTheme()
    const userId = useAppSelector(state => state.auth.userId)!
    const username = useAppSelector(state => state.auth.username)!
    const selectedChatroom = useAppSelector(state => state.messages.selectedChatroom)!
    const messageColor = useAppSelector(state => state.messages.chatroomList?.find(chatroom => chatroom.chatroomId === selectedChatroom)?.myMessageColor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const chatroomList = useAppSelector(state => state.messages.chatroomList)
    const [messageList] = chatroomList?.filter(chatroom => chatroom.chatroomId === selectedChatroom) || []
    const contactList = useAppSelector(state => state.contacts.contactsList)
    const lastMessageRef = useRef<HTMLInputElement>(null)
    const [typing, setTyping] = useState('')
    const [roomId, setRoomId] = useState(0)
    const [opened, setOpened] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(0)

    useEffect(() => {
        if (contactList === null) return
        socket.on('typingResponse', (data) => {
            console.log(data.selectedChatroom, selectedChatroom)
            if (parseInt(data.selectedChatroom) !== selectedChatroom) {
                return
            } else if (data.username === username) {
                return
            } else {
                const nickname = contactList.find(contact => contact.contactUsername === data.username)?.nickname
                const message = nickname || data.username
                setRoomId(data.selectedChatroom)
                setTyping(message)
                const timer = setTimeout(() => { setTyping('') }, 1000)

                return () => clearTimeout(timer)
            }
        })
        return () => {
            socket.off('typingResponse')
        }
    }, [selectedChatroom])

    useEffect(() => {
        socket.on('deleteMessageResponse', (messageId) => {
            dispatch(deleteMessageAction(messageId))
        })
        return () => {
            socket.off('deleteMessageResponse')
        }
    }, [messageList])

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView()
        }
    }, [messageList])

    useEffect(() => {
        if (selectedChatroom) {
            dispatch(getChatroomList(userId))
        }
    }, [selectedChatroom])

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        dispatch(sendMessage(userId, selectedChatroom, text))
        setText('')
    }

    function handleAddContact(targetId: number) {
        dispatch(setTargetUserAction(targetId))
        dispatch(createContact())
    }

    function handleTyping(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            dispatch(sendMessage(userId, selectedChatroom, text))
            setText('')
        } else {
            socket.emit('typing', { username, selectedChatroom })
        }
    }

    function handleDeleteMessage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        setOpened(true)
        setDeleteTarget(parseInt(e.currentTarget.value))
    }

    function onClose() {
        setOpened(false)
        setDeleteTarget(0)
    }

    function onDelete() {
        dispatch(deleteMessage(deleteTarget, userId))
        onClose()
    }

    return (
        <div className='d-flex flex-column flex-grow-1 overflow-hidden' >
            <div id='message-container' className='overflow-auto' style={{ height: '100vh', position: 'relative' }}>
                <div id='content-container' className='d-flex flex-column align-items-start justify-content-end px-3'>
                    {messageList && messageList.messageList.map((message, index) => {
                        const lastMessage = messageList.messageList.length - 1 === index
                        const isQuitted = chatroomList?.find(chatroom =>
                            chatroom.chatroomId === selectedChatroom)?.participants.find(participant =>
                                participant.participantId === message.senderId)?.isDeleted

                        return (
                            <div
                                ref={lastMessage ? lastMessageRef : null}
                                key={message.messageId}
                                className={`my-1 d-flex flex-column  ${message.senderId === userId ? 'align-self-end' : ''}`}
                            >

                                {/* Message */}
                                <HoverCard shadow='xs' openDelay={500}>
                                    <HoverCard.Target>
                                        <Container
                                            style={{
                                                maxWidth: '400px',
                                                height: 'fit-content',
                                                backgroundColor: message.senderId !== userId ? 'white' : messageColor ? messageColor : theme.primaryColor
                                            }}
                                            className={`rounded px-2 py-1 ${message.isSystemMessage || message.isDeleted
                                                ? 'bg-secondary text-white' : message.senderId === userId
                                                    ? 'text-white' : 'border'}`}>
                                            {
                                                message.isSystemMessage ?
                                                    <><Badge size='lg' color="red" radius="xs" variant="dot" style={{ color: "white" }}>SYSTEM MESSAGE</Badge>  {message.content}</>
                                                    : message.isDeleted ? <Badge size='lg' radius="xs" variant='subtle' style={{ color: "white" }}>Message Deleted</Badge>
                                                        : message.content
                                            }
                                        </Container>
                                    </HoverCard.Target>
                                    {message.senderId === userId &&
                                        <HoverCard.Dropdown>
                                            <Button
                                                value={message.messageId}
                                                style={{ padding: '0px' }}
                                                variant='subtle'
                                                onClick={(e) => handleDeleteMessage(e)}
                                            >
                                                Delete Message
                                            </Button>
                                        </HoverCard.Dropdown>
                                    }
                                </HoverCard>

                                {/* Sender's Name */}
                                <div className='text-muted small' style={{ textAlign: message.senderId === userId ? 'right' : 'left' }}>
                                    <Badge size='xs' color="teal" radius="xs">{new Date(message.createdAt).toLocaleTimeString()}</Badge>
                                    {message.senderId === userId ? 'You' :
                                        contactList?.find(contact => contact.contactUsername === message.senderUsername)?.nickname || message.senderUsername
                                    }
                                    {isQuitted && <span> ( Not In Chat )</span>}
                                    {message.senderId !== userId && !contactList?.find(contact => contact.contactUsername === message.senderUsername) &&
                                        <Tooltip color="blue" label='Add to contacts'>
                                            <Button
                                                variant='subtle'
                                                style={{ height: '15px' }}
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
            <p
                className='m-2 text-muted small d-flex'
                style={{ width: '100%', minHeight: '19px', justifyContent: 'space-between' }}
            >
                <div>
                    {roomId === selectedChatroom && typing && <>{typing} < Loader variant="dots" /></>}
                </div>
                <Tooltip label='Scroll to bottom'>
                    <Button
                        variant='subtle'
                        style={{ height: 'fit-content', padding: '0px', marginRight: '20px' }}
                        onClick={() => lastMessageRef.current && lastMessageRef.current.scrollIntoView()}>
                        <IconArrowBigDownLines size={20} />
                    </Button>
                </Tooltip>
            </p>
            <Form onSubmit={handleSubmit}>
                <Form.Group className='m-2' style={{ position: 'relative' }}>
                    <InputGroup>
                        <Form.Control
                            as='textarea'
                            rows={1}
                            autoFocus
                            required
                            value={text}
                            aria-describedby="basic-addon2"
                            onKeyDown={handleTyping}
                            onChange={e => setText(e.currentTarget.value)}
                            style={{ resize: 'none' }}
                        />
                        <Button radius='sm' type='submit'><IconSend size={14} /></Button>

                    </InputGroup>
                </Form.Group>
            </Form>
            <ConfirmationHub isShow={opened} onClose={onClose} onDelete={onDelete} />
            <OptionPanel />
        </div>
    )
}
