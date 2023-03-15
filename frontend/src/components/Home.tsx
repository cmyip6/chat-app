
import { useAppSelector } from '../store'
import Conversations from './Conversations'
import SideBar from './SideBar'
import SidePanel from './SidePanel'

export default function Home() {
  const userId = useAppSelector(state=>state.auth.userId)
  const selectedChatroom = useAppSelector(state => state.messages.selectedChatroom)

  return (
    <div className='d-flex' style={{height:'100vh'}}>
      <SideBar/>
      <SidePanel/>
      {selectedChatroom && userId && <Conversations/>}
    </div>
  )
}
