import { Button, Checkbox, Input } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useEffect, useRef, useState } from 'react'
import { createChatroom } from '../redux/messages/thunk'
import { useAppDispatch, useAppSelector } from '../store'

type ModalProps = {
  onClose: () => void
}

export default function NewMessageModal(props: ModalProps) {
  const dispatch = useAppDispatch()
  const contactList = useAppSelector(state => state.contacts.contactsList)
  const [value, setValue] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const [searchName, setSearchName] = useState('')
  const [checked, setChecked] = useState(false)

  const filteredContactList = contactList!.filter(contact => contact.nickname?.includes(searchName) || contact.contactUsername?.includes(searchName))

  useEffect(() => {
    if (!contactList?.length) {
      showNotification({
        title: 'Create Message Notification',
        message: 'No Contacts Available, Please Add New Contacts First'
      });
      props.onClose()
    }
  }, [])

  function onClick() {
    if (!checked) {
      if (value.length) {
        setChecked(true)
      } else {
        showNotification({
          title: 'Create Message Notification',
          message: 'Select at least One contact'
        });
      }
    } else {
      dispatch(createChatroom(value, nameRef.current!.value))
      props.onClose()
      setSearchName('')
      setChecked(false)
    }
  }

  return (
    <>
      {!checked && <Input.Wrapper label='Search' style={{ marginBottom: '10px' }}>
        <Input
          value={searchName}
          onChange={e => setSearchName(e.currentTarget.value)}
        />
      </Input.Wrapper>
      }
      {!checked ? <Input.Wrapper label='Select Users' required style={{ marginBottom: '10px' }}>
        <Checkbox.Group value={value} onChange={setValue}>
          {filteredContactList?.map((contact) => (
            <Checkbox key={contact.contactUsername} value={contact.contactUsername} label={contact.nickname || contact.contactUsername} />
          ))}
        </Checkbox.Group>
      </Input.Wrapper>
        :
        <Input.Wrapper label='Chatroom Name' style={{ marginBottom: '10px' }}>
          <Input ref={nameRef} placeholder='or press Create to skip' />
        </Input.Wrapper>
      }
      <Button variant='light' fullWidth onClick={onClick}>{checked ? 'Create' : 'Next'}</Button>
    </>
  )
}
