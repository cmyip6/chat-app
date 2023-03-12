import { Button, Modal, Tabs } from '@mantine/core'
import { IconMessageCircle, IconPhoto } from '@tabler/icons-react'
import { useState } from 'react'
import { logout } from '../redux/auth/thunk'
import { useAppDispatch, useAppSelector } from '../store'
import Contacts from './Contacts'
import Messages from './Messages'
import NewContactModal from './NewContactModal'
import NewMessageModal from './NewMessageModal'

const MESSAGES_KEY = 'messages'
const CONTACTS_KEY = 'contacts'

export default function SidePanel() {
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState<string | null>(MESSAGES_KEY)
    const [opened, setOpened] = useState<boolean>(false)

    const messageOpened = MESSAGES_KEY === activeTab
    const username = useAppSelector(state => state.auth.username)

    const closeModal = () =>{
        setOpened(false)
    }

    return (
        <div style={{ width: '250px', boxShadow: '1px 0px 0px #E6E6E6' }} className='d-flex flex-column'>

            <Tabs value={activeTab} onTabChange={setActiveTab} className='border-right overflow-auto flex-grow-1'>
                <Tabs.List position="center" >
                    <Tabs.Tab value={CONTACTS_KEY} icon={<IconPhoto size="0.8rem" />}>Contacts</Tabs.Tab>
                    <Tabs.Tab value={MESSAGES_KEY} icon={<IconMessageCircle size="0.8rem" />}>Messages</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={CONTACTS_KEY} pt="xs">
                    <Contacts />
                </Tabs.Panel>

                <Tabs.Panel value={MESSAGES_KEY} pt="xs">
                    <Messages />
                </Tabs.Panel>

            </Tabs>
            
            <div className='p-1 text-muted small'>Username: {username}</div>
            <Button className='rounded-0' onClick={()=>setOpened(true)}>NEW {messageOpened ? MESSAGES_KEY.toUpperCase() : CONTACTS_KEY.toUpperCase()}</Button>
            <Button className='rounded-0' variant='outline' onClick={() => dispatch(logout())}>LOGOUT</Button>
            
            <Modal opened={opened} onClose={closeModal} size="auto" title={'New '+activeTab}>
                {
                    messageOpened ? <NewMessageModal onClose={closeModal} /> : <NewContactModal onClose={closeModal}/>
                }
            </Modal>

        </div>
    )
}
