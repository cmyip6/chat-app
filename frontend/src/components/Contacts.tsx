import { Button, Card, Divider, Group, Input, Tooltip } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconPointFilled, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { setEditModeAction, toggleOnlineAction } from '../redux/contacts/slice'
import { deleteContact, editContactName } from '../redux/contacts/thunk'
import { createChatroom, getChatroomList } from '../redux/messages/thunk'
import { socket, useAppDispatch, useAppSelector } from '../store'

export default function Contacts() {
  const dispatch = useAppDispatch()
  const contactList = useAppSelector(state => state.contacts.contactsList)
  const userId = useAppSelector(state => state.auth.userId)
  const editTarget = useAppSelector(state => state.contacts.editTarget)
  const [editName, setEditName] = useState('')

  useEffect(() => {

    if (!contactList || !userId) return
    socket.on('loginResponse', (user) => {
      if (contactList.find(contact=>contact.contactUsername === user.username)?.contactUsername) {
        dispatch(toggleOnlineAction({ username: user.username, isOnline: true }))
      }
      // if (contactList.filter(contact => contact.contactUsername === user.username).length) {
      //   const contact = contactList.find(contact => contact.contactUsername === user.username)

      //   showNotification({
      //     message: (contact?.nickname || contact?.contactUsername) + ' is Online',
      //     icon: <IconPointFilled />,
      //     color: 'green'
      //   })
      // }
    });

    socket.on('logoutResponse', (user) => {
      if (contactList.find(contact=>contact.contactUsername === user.username)) {
        dispatch(toggleOnlineAction({ username: user.username, isOnline: false }))
      }
      // if (contactList.filter(contact => contact.contactUsername === user.username).length) {
      //   const contact = contactList.find(contact => contact.contactUsername === user.username)

      //   showNotification({
      //     message: (contact?.nickname || contact?.contactUsername) + ' is Offline',
      //     icon: <IconPointFilled />,
      //     color: 'red'
      //   })
      // }
    });

  }, [contactList])

  function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault()
    dispatch(deleteContact(parseInt(e.currentTarget.value)))
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

  return (
    <div id='content-container' style={{ overflow: 'auto', height: '75vh' }}>
      <Divider labelPosition='center' my='md' label='Online' color={'dark'} />
      {contactList !== null && contactList.filter(contact=>contact.isOnline).map(contact => {
        return <div key={contact.contactId} style={{ position: 'relative' }}>
          <Tooltip color="blue" label='Single-click to open conversation'>
            <Tooltip color="blue" position="bottom" label='Double-click to edit name'>
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
            </ Tooltip>
          </Tooltip>
        </div>
      })}
      <Divider labelPosition='center' my='md' label='Offline' color={'dark'} />
      {contactList !== null && contactList.filter(contact=> contact.isOnline !== true).map(contact => {
        return <div key={contact.contactId} style={{ position: 'relative' }}>
          <Tooltip color="blue" label='Single-click to open conversation'>
            <Tooltip color="blue" position="bottom" label='Double-click to edit name'>
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
            </ Tooltip>
          </Tooltip>
        </div>
      })}

    </div>
  )

}
