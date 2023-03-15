import { Badge, Input, Tooltip } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { ListGroup } from 'react-bootstrap'
import { editChatroomModeAction, setSelectedChatroomAction, toggleParticipantStatusAction } from '../redux/messages/slice'
import { editChatroomName, exitChatroom, getChatroomList, getMessages } from '../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../store'
import { ConfirmationHub } from './ConfirmationHub'

export default function Messages() {
  const dispatch = useAppDispatch()
  const chatroomList = useAppSelector(state => state.messages.chatroomList)
  const userId = useAppSelector(state => state.auth.userId)
  const username = useAppSelector(state => state.auth.username)
  const selected = useAppSelector(state => state.messages.selectedChatroom)
  const editMode = useAppSelector(state => state.messages.editChatroomName)
  const [editName, setEditName] = useState('')
  const [search, setSearch] = useState('')
  const [opened, setOpened] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(0)
  const filteredChatroomList = chatroomList && chatroomList
    .filter(chatroom => (chatroom.chatroomName && chatroom.chatroomName.toLowerCase().includes(search.toLowerCase()))
      || (chatroom.participants.find(participant => (participant.participantName !== username && participant.participantName.toLowerCase().includes(search.toLowerCase()))
        || participant.participantNickname?.toLowerCase().includes(search.toLowerCase()))))


  useEffect(() => {
    return () => {
      dispatch(editChatroomModeAction(0))
      setEditName("")
    }
  }, [dispatch, selected])

  useEffect(() => {
    if (!userId) return
    socket.on('createChatroomResponse', (chatroom) => {
      dispatch(getChatroomList(userId))
    })
  }, [chatroomList])

  useEffect(()=>{
    socket.on('sendMessageResponse', (chatroomId) => {
      dispatch(getMessages(chatroomId))
  });
  }, [chatroomList])

  useEffect(()=>{
    socket.on('toggleParticipantStatusResponse', (data) => {
      dispatch(toggleParticipantStatusAction({chatroomId: data.chatroomId, participantId: data.participantId, isDeleted: data.isDeleted}))
      dispatch(getMessages(data.chatroomId))
    });
  }, [chatroomList])


  function handleBlur(chatroomId: number, newName: string, originalName?: string) {
    if (originalName !== newName && newName.length) {
      dispatch(editChatroomName(chatroomId, newName))
    }
    dispatch(editChatroomModeAction(0))
    setEditName("")
  }

  function handleEdit(chatroomId: number, chatroomName?: string) {
    dispatch(editChatroomModeAction(chatroomId))
    setEditName(chatroomName || "")
  }

  function handleSubmit(chatroomId: number) {
    dispatch(editChatroomName(chatroomId, editName))
    dispatch(editChatroomModeAction(0))
    setEditName("")
  }

  function handleDelete(chatroomId: number) {
    setDeleteTarget(chatroomId)
    setOpened(true)
  }

  const handleEditNameKeyDown = (key: string, chatroomId: number) => {
    if (key === 'Enter') {
      handleSubmit(chatroomId);
    }
  };

  function onClose() {
    setOpened(false)
    setDeleteTarget(0)
    dispatch(setSelectedChatroomAction(0))
  }

  function onDelete() {
    if (!userId) return
    dispatch(exitChatroom(deleteTarget, userId))
    onClose()
  }

  return (
    <div id='content-container' style={{ overflow: 'auto', height: '75vh' }}>
      <Input.Wrapper label="Search" className='mb-2'>
        <Input
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          rightSection={search.length ? <IconX size={16} onClick={() => setSearch('')} /> : undefined}
        />
      </Input.Wrapper>
      <ListGroup variant='flush'>
        {filteredChatroomList && filteredChatroomList.map(chatroom => (
          <Tooltip key={chatroom.chatroomId} disabled={!chatroom.isGroup || !!(chatroom.chatroomName && chatroom.chatroomName.length <= 24)} label={chatroom.chatroomName || "Double Click to Edit Name"}>
            <div style={{ position: 'relative', overflowY: 'hidden', overflowX: 'visible' }}>
              <ListGroup.Item
                className='text-center'
                style={{ minHeight: '70px' }}
                action
                onClick={() => dispatch(setSelectedChatroomAction(chatroom.chatroomId))}
                active={selected === chatroom.chatroomId}
              >
                {chatroom.isGroup && <Badge
                  variant="subtle"
                  size='lg'
                  radius='xs'
                  fullWidth
                  onDoubleClick={() => handleEdit(chatroom.chatroomId, chatroom.chatroomName)}
                  rightSection={
                    editMode === chatroom.chatroomId ? <IconCheck size={14} onClick={() => handleSubmit(chatroom.chatroomId)} /> : ""
                  }
                >
                  {editMode === chatroom.chatroomId ?
                    <Input
                      autoFocus
                      onBlur={() => handleBlur(chatroom.chatroomId, editName, chatroom.chatroomName)}
                      onKeyDown={(e) => handleEditNameKeyDown(e.key, chatroom.chatroomId)}
                      value={editName} onChange={(e) => setEditName(e.currentTarget.value)}
                    /> :
                    chatroom.chatroomName}
                </Badge>}
                {chatroom.isGroup ?
                  chatroom.participants.filter(participant => participant.isDeleted === false).map(participant => (participant.participantNickname || participant.participantName))
                    .map(name => name === username ? 'You' : name).sort().join(', ') :
                  chatroom.participants.map(participant =>
                    participant.participantId !== userId && (participant.participantNickname || participant.participantName)
                  )
                }
                <Tooltip label={chatroom.isGroup ? "Quit group" : "Archive chat"}>
                  <span
                    style={{ position: 'absolute', top: '0px', right: '5px', padding: '0px' }}
                    onClick={() => handleDelete(chatroom.chatroomId)}
                  >
                    <IconX
                      color={selected === chatroom.chatroomId ? 'white' : undefined}
                      size={15}
                    />
                  </span>
                </Tooltip>
                {chatroom.isGroup &&
                  <Badge
                    size='xs'
                    variant='light'
                    style={{ position: 'absolute', top: '2px', left: '2px', padding: '1px' }}
                  >
                    Group
                  </Badge>
                }

              </ListGroup.Item>
            </div>
          </Tooltip>
        ))}
      </ListGroup>
      <ConfirmationHub isShow={opened} onClose={onClose} onDelete={onDelete} />
    </div>
  )
}
function participantLeaveChatroom(arg0: { chatroomId: any; participantId: any }): any {
  throw new Error('Function not implemented.')
}

