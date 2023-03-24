import {
    Badge,
    Button,
    HoverCard,
    Tooltip,
    useMantineTheme
} from '@mantine/core'
import React, { useEffect, useRef, useState } from 'react'
import { Container } from 'react-bootstrap'
import { setTargetUserAction } from '../../redux/contacts/slice'
import { createContact } from '../../redux/contacts/thunk'
import { deleteMessageAction } from '../../redux/messages/slice'
import { deleteMessage, getChatroomList } from '../../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../../store'
import { ConfirmationModal } from '../modals/ConfirmationModal'

export default function Messages(props: { scroll: boolean, scrollEnd: () => void }) {
    const dispatch = useAppDispatch()
    const theme = useMantineTheme()
    const [opened, setOpened] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(0)
    const userId = useAppSelector((state) => state.auth.userId)!
    const selectedChatroom = useAppSelector(
        (state) => state.messages.selectedChatroom
    )!
    const messageColor = useAppSelector(
        (state) =>
            state.messages.chatroomList?.find(
                (chatroom) => chatroom.chatroomId === selectedChatroom
            )?.myMessageColor
    )
    const chatroomList = useAppSelector((state) => state.messages.chatroomList)
    const contactList = useAppSelector((state) => state.contacts.contactsList)
    const [messageList] =
        chatroomList?.filter(
            (chatroom) => chatroom.chatroomId === selectedChatroom
        ) || []
    const lastMessageRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
        props.scrollEnd()
    }, [props.scroll])
    
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView()
        }
    }, [messageList])

    useEffect(() => {
        socket.on('deleteMessageResponse', (messageId) => {
            dispatch(deleteMessageAction(messageId))
        })
        return () => {
            socket.off('deleteMessageResponse')
        }
    }, [messageList])

    useEffect(() => {
        if (selectedChatroom) {
            dispatch(getChatroomList(userId))
        }
    }, [selectedChatroom])

    function handleAddContact(targetId: number) {
        dispatch(setTargetUserAction(targetId))
        dispatch(createContact())
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
        <div
            id='message-container'
            className='overflow-auto'
            style={{ height: '100vh', position: 'relative' }}
        >
            <div
                id='content-container'
                className='d-flex flex-column align-items-start justify-content-end px-3'
            >
                {messageList &&
                    messageList.messageList.map((message, index) => {
                        const lastMessage =
                            messageList.messageList.length - 1 === index
                        const isQuitted = chatroomList
                            ?.find(
                                (chatroom) =>
                                    chatroom.chatroomId === selectedChatroom
                            )
                            ?.participants.find(
                                (participant) =>
                                    participant.participantId ===
                                    message.senderId
                            )?.isDeleted

                        return (
                            <div
                                ref={lastMessage ? lastMessageRef : null}
                                key={message.messageId}
                                className={`my-1 d-flex flex-column  ${message.senderId === userId
                                    ? 'align-self-end'
                                    : ''
                                    }`}
                            >
                                {/* Message */}
                                <HoverCard shadow='xs' openDelay={500}>
                                    <HoverCard.Target>
                                        <Container
                                            style={{
                                                maxWidth: '400px',
                                                height: 'fit-content',
                                                backgroundColor:
                                                    message.senderId !==
                                                        userId
                                                        ? 'white'
                                                        : messageColor
                                                            ? messageColor
                                                            : theme.primaryColor
                                            }}
                                            className={`rounded px-2 py-1 ${message.isSystemMessage ||
                                                message.isDeleted
                                                ? 'bg-secondary text-white'
                                                : message.senderId ===
                                                    userId
                                                    ? 'text-white'
                                                    : 'border'
                                                }`}
                                        >
                                            {message.isSystemMessage ? (
                                                <>
                                                    <Badge
                                                        size='lg'
                                                        color='red'
                                                        radius='xs'
                                                        variant='dot'
                                                        style={{
                                                            color: 'white'
                                                        }}
                                                    >
                                                        SYSTEM MESSAGE
                                                    </Badge>{' '}
                                                    {message.content}
                                                </>
                                            ) : message.isDeleted ? (
                                                <Badge
                                                    size='lg'
                                                    radius='xs'
                                                    variant='subtle'
                                                    style={{
                                                        color: 'white'
                                                    }}
                                                >
                                                    Message Deleted
                                                </Badge>
                                            ) : (
                                                message.content
                                            )}
                                        </Container>
                                    </HoverCard.Target>
                                    {message.senderId === userId && (
                                        <HoverCard.Dropdown>
                                            <Button
                                                value={message.messageId}
                                                style={{ padding: '0px' }}
                                                variant='subtle'
                                                onClick={(e) =>
                                                    handleDeleteMessage(e)
                                                }
                                            >
                                                Delete Message
                                            </Button>
                                        </HoverCard.Dropdown>
                                    )}
                                </HoverCard>

                                {/* Sender's Name */}
                                <div
                                    className='text-muted small'
                                    style={{
                                        textAlign:
                                            message.senderId === userId
                                                ? 'right'
                                                : 'left'
                                    }}
                                >
                                    <Badge
                                        size='xs'
                                        color='teal'
                                        radius='xs'
                                    >
                                        {new Date(
                                            message.createdAt
                                        ).toLocaleTimeString()}
                                    </Badge>
                                    {message.senderId === userId
                                        ? 'You'
                                        : contactList?.find(
                                            (contact) =>
                                                contact.contactUsername ===
                                                message.senderUsername
                                        )?.nickname ||
                                        message.senderUsername}
                                    {isQuitted && (
                                        <span> ( Not In Chat )</span>
                                    )}
                                    {message.senderId !== userId &&
                                        !contactList?.find(
                                            (contact) =>
                                                contact.contactUsername ===
                                                message.senderUsername
                                        ) && (
                                            <Tooltip
                                                color='blue'
                                                label='Add to contacts'
                                            >
                                                <Button
                                                    variant='subtle'
                                                    style={{
                                                        height: '15px'
                                                    }}
                                                    onClick={() =>
                                                        handleAddContact(
                                                            message.senderId
                                                        )
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </Tooltip>
                                        )}
                                </div>
                            </div>
                        )
                    })}
            </div>
            <ConfirmationModal
                isShow={opened}
                onClose={onClose}
                onDelete={onDelete}
            />
        </div>
    )
}
