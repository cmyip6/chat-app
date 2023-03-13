import { Badge, Button, Input, Tooltip } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { ListGroup } from 'react-bootstrap'
import { editChatroomModeAction, setSelectedChatroomAction } from '../redux/messages/slice'
import { editChatroomName, exitChatroom } from '../redux/messages/thunk'
import { useAppDispatch, useAppSelector } from '../store'

export default function Messages() {
  const dispatch = useAppDispatch()
  const chatroomList = useAppSelector(state => state.messages.chatroomList)
  const userId = useAppSelector(state => state.auth.userId)
  const username = useAppSelector(state => state.auth.username)
  const selected = useAppSelector(state => state.messages.selectedChatroom)
  const editMode = useAppSelector(state => state.messages.editChatroomName)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    return () => {
      dispatch(editChatroomModeAction(0))
      setEditName("")
    }
  }, [dispatch, selected])

  useEffect(()=>{
    if ( selected === null && chatroomList) {
      dispatch(setSelectedChatroomAction(chatroomList[0].chatroomId))
    }
  },[])

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

  function handleDelete(chatroomId: number, userId: number) {
    dispatch(exitChatroom(chatroomId, userId))
    dispatch(setSelectedChatroomAction(0))
  }

  const handleEditNameKeyDown = (key: string, chatroomId: number) => {
    if (key === 'Enter') {
      handleSubmit(chatroomId);
    }
  };

  return (
    <div id='content-container' style={{ overflow: 'auto', height: '75vh' }}>
      <ListGroup variant='flush'>
        {chatroomList && chatroomList.map(chatroom => (
          <Tooltip key={chatroom.chatroomId} disabled={!chatroom.isGroup} label={chatroom.chatroomName || "Double Click to Edit Name"}>
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
                  chatroom.participants.filter(participant=> participant.isDeleted === false).map(participant => (participant.participantNickname || participant.participantName))
                    .map(name => name === username ? 'You' : name).join(', ') :
                  chatroom.participants.map(participant =>
                    participant.participantId !== userId && (participant.participantNickname || participant.participantName)
                  )
                }

                <Button
                  variant='subtle'
                  style={{ position: 'absolute', top: '0px', right: '5px', padding: '0px' }}
                  onClick={() => handleDelete(chatroom.chatroomId, userId!)}
                >
                  <IconX
                    color={selected === chatroom.chatroomId ? 'white' : undefined}
                    size={15}
                  />
                </Button>

                {chatroom.isGroup && 
                  <Badge 
                    size='xs' 
                    variant='light'
                    style={{position: 'absolute', top:'2px', left:'2px', padding:'1px'}}
                    >
                      Group
                  </Badge>
                }

              </ListGroup.Item>
            </div>
          </Tooltip>
        ))}
      </ListGroup>
    </div>
  )
}
