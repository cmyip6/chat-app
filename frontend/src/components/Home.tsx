
import { useAppSelector } from '../store'
import Conversations from './Conversations'
import OptionPanel from './OptionPanel'
// import SideBar from './SideBar'
import SidePanel from './SidePanel'

export default function Home() {

  return (
    <div className='d-flex' style={{height:'100vh'}}>
      {/* <SideBar/> */}
      <SidePanel/>
      <Conversations/>
    </div>
  )
}
