import { Badge, Card, Input, Tooltip, useMantineTheme } from '@mantine/core'
import { IconCheck, IconSearch, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { editChatroomModeAction, setMessageColorAction, setSelectedChatroomAction, toggleParticipantStatusAction } from '../redux/messages/slice'
import { editChatroomName, exitChatroom, getChatroomList, getMessages } from '../redux/messages/thunk'
import { PREFIX, socket, useAppDispatch, useAppSelector } from '../store'
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
  const theme = useMantineTheme()
  const filteredChatroomList = chatroomList && chatroomList
    .filter(chatroom => (chatroom.chatroomName && chatroom.chatroomName.toLowerCase().includes(search.toLowerCase()))
      || (chatroom.participants.find(participant => (participant.participantName !== username && participant.participantName.toLowerCase().includes(search.toLowerCase()))
        || participant.participantNickname?.toLowerCase().includes(search.toLowerCase()))))

  //get saved message color from local storage
  useEffect(() => {
    if (!chatroomList) return
    for (let chatroom of chatroomList){
      const savedColor = window.localStorage.getItem(`${PREFIX}chatroom-${chatroom.chatroomId}-messageBackground`)
      if (savedColor){
        dispatch(setMessageColorAction({ chatroomId: chatroom.chatroomId, color: savedColor }))
      } 
    }
  }, [chatroomList])

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
    return ()=>{
      socket.off('createChatroomResponse')
    }
  }, [chatroomList])

  useEffect(() => {
    socket.on('sendMessageResponse', (chatroomId) => {
      dispatch(getMessages(chatroomId))
    });
    return ()=>{
      socket.off('sendMessageResponse')
    }
  }, [chatroomList])

  useEffect(() => {
    socket.on('toggleParticipantStatusResponse', (data) => {
      dispatch(toggleParticipantStatusAction({ chatroomId: data.chatroomId, participantId: data.participantId, isDeleted: data.isDeleted }))
    });
    return ()=>{
      socket.off('toggleParticipantStatusResponse')
    }
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
      <Input.Wrapper label="Search" style={{ margin: '2px' }}>
        <Input
          value={search}
          icon={<IconSearch size={20} />}
          placeholder='Username / Group Name'
          onChange={(e) => setSearch(e.currentTarget.value)}
          rightSection={search.length ? <IconX size={16} onClick={() => setSearch('')} /> : undefined}
        />
      </Input.Wrapper>
      <div>
        {filteredChatroomList && filteredChatroomList.map(chatroom => (
          <Tooltip
            key={chatroom.chatroomId}
            disabled={!chatroom.isGroup || !!(chatroom.chatroomName && chatroom.chatroomName.length <= 24)}
            label={chatroom.chatroomName || "Double Click to Edit Name"}
          >
            <div style={{ position: 'relative', overflowY: 'hidden', overflowX: 'visible' }}>
              <Card
                shadow="sm"
                radius="md"
                withBorder
                className='text-center d-flex flex-column justify-content-center'
                style={{ minHeight: '70px', cursor: 'pointer', backgroundColor: selected === chatroom.chatroomId ? theme.primaryColor : undefined }}
                onClick={() => dispatch(setSelectedChatroomAction(chatroom.chatroomId))}
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

                <Tooltip
                  onMouseEnter={e => e.stopPropagation()}
                  label={chatroom.isGroup ? "Quit group" : "Archive chat"}
                >
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

              </Card>
            </div>
          </Tooltip>
        ))}
      </div>
      <ConfirmationHub isShow={opened} onClose={onClose} onDelete={onDelete} />
    </div>
  )
}
