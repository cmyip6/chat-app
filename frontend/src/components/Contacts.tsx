import { Button, Card, Divider, Group, Input, Tooltip } from '@mantine/core'
import { IconPointFilled, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { setEditModeAction, toggleOnlineAction } from '../redux/contacts/slice'
import { deleteContact, editContactName } from '../redux/contacts/thunk'
import { createChatroom } from '../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../store'
import { ConfirmationHub } from './ConfirmationHub'

export default function Contacts() {
  const dispatch = useAppDispatch()
  const contactList = useAppSelector(state => state.contacts.contactsList)
  const editTarget = useAppSelector(state => state.contacts.editTarget)
  const [editName, setEditName] = useState('')
  const [search, setSearch] = useState('')
  const [opened, setOpened] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(0)

  const filteredContactList = contactList && contactList.filter(contact => contact.contactUsername.includes(search) 
    || contact.nickname?.toLowerCase().includes(search))
       
  useEffect(() => {
    if (contactList === null) return
    socket.on('loginResponse', (user) => {
      console.log('loginResponse')
      if (contactList.find(contact => contact.contactUsername === user.username)) {
        dispatch(toggleOnlineAction({ username: user.username, isOnline: true }))
      }
    });

  }, [socket, contactList])

  useEffect(() => {
    if (!contactList) return
    socket.on('logoutResponse', (user) => {
      console.log('logoutResponse')
      if (contactList.find(contact => contact.contactUsername === user.username)) {
        dispatch(toggleOnlineAction({ username: user.username, isOnline: false }))
      }
    });

  }, [socket, contactList])

  function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault()
    setOpened(true)
    setDeleteTarget(parseInt(e.currentTarget.value))
  }

  function handleBlur(contactId: number) {
    if (editName && editName.length) {
      dispatch(editContactName(contactId, editName))
    }
    dispatch(setEditModeAction(0))
  }

  function handleDoubleClick(contactId: number, currentName: string) {
    dispatch(setEditModeAction(contactId))
    setEditName(currentName)
  }

  function handleKeydown(key: string, contactId: number) {
    if (key === 'Enter') {
      handleBlur(contactId)
    }
  }

  function onClose(){
    setOpened(false)
    setDeleteTarget(0)
  }

  function onDelete(){
    dispatch(deleteContact(deleteTarget))
    onClose()
  }

  return (
    <div id='content-container' style={{ overflow: 'auto', height: '75vh' }}>
      <Input.Wrapper label="Search">
        <Input
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          rightSection={search.length ? <IconX size={16} onClick={()=>setSearch('')}/> : undefined}
        />
      </Input.Wrapper>
      <Divider labelPosition='center' my='md' label='Online' color={'dark'} />
      {(filteredContactList !== null || undefined ) && filteredContactList!
        .filter(contact => contact.isOnline)
        .map(contact => {
        return <div key={contact.contactId} style={{ position: 'relative' }}>
          <Card
            shadow="sm"
            radius="md"
            onClick={() => { dispatch(createChatroom([contact.contactUsername])) }}
            onDoubleClick={() => handleDoubleClick(contact.contactId, contact.nickname || contact.contactUsername)}
            withBorder
          >
            <Group position="left" mt="md" mb="xs">
              <IconPointFilled style={{ color: contact.isOnline ? 'green' : 'darkred' }} />
              {editTarget === contact.contactId ?
                <Input.Wrapper label="Change Name">
                  <Input
                    value={editName}
                    autoFocus
                    onKeyDown={(e) => handleKeydown(e.key, contact.contactId)}
                    onChange={(e) => setEditName(e.currentTarget.value)}
                    onBlur={() => handleBlur(contact.contactId)}
                  />
                </Input.Wrapper> :
                contact.nickname || contact.contactUsername
              }
            </Group>

            <div style={{ position: 'absolute', right: '10px', top: '20px' }}>
              <Button
                value={contact.contactId}
                variant='subtle'
                onClick={(e) => handleDelete(e)}
                style={{ width: '20px', height: '20px', padding: '0px' }}
              >
                <IconX />
              </Button>
            </div>
          </Card>
        </div>
      })}
      <Divider labelPosition='center' my='md' label='Offline' color={'dark'} />
      {filteredContactList !== null && filteredContactList!.filter(contact => contact.isOnline !== true).map(contact => {
        return <div key={contact.contactId} style={{ position: 'relative' }}>
          <Card
            shadow="sm"
            radius="md"
            onClick={() => dispatch(createChatroom([contact.contactUsername]))}
            onDoubleClick={() => handleDoubleClick(contact.contactId, contact.nickname || contact.contactUsername)}
            withBorder
          >
            <Group position="left" mt="md" mb="xs">
              <IconPointFilled style={{ color: contact.isOnline ? 'green' : 'darkred' }} />
              {editTarget === contact.contactId ?
                <Input.Wrapper label="Change Name">
                  <Input
                    value={editName}
                    autoFocus
                    onKeyDown={(e) => handleKeydown(e.key, contact.contactId)}
                    onChange={(e) => setEditName(e.currentTarget.value)}
                    onBlur={() => handleBlur(contact.contactId)}
                  />
                </Input.Wrapper> :
                contact.nickname || contact.contactUsername
              }
            </Group>

            <div style={{ position: 'absolute', right: '10px', top: '20px' }}>
              <Button
                value={contact.contactId}
                variant='subtle'
                onClick={(e) => handleDelete(e)}
                style={{ width: '20px', height: '20px', padding: '0px' }}
              >
                <IconX />
              </Button>
            </div>
          </Card>
        </div>
      })}
    <ConfirmationHub isShow={opened} onClose={onClose} onDelete={onDelete}/>
    </div>
  )

}
