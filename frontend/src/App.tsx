
import { useEffect } from "react";
import './App.css'
import Home from "./components/Home";
import Login from "./components/Login";
import { retrieveLogin } from "./redux/auth/thunk";
import { getContactsListAction } from "./redux/contacts/slice";

import { getContactList } from "./redux/contacts/thunk";
import { getChatroomList, getMessages } from "./redux/messages/thunk";
import { PREFIX, socket, useAppDispatch, useAppSelector } from "./store";

function App() {
  const dispatch= useAppDispatch()
  const login = useAppSelector(state=>state.auth.isLoggedIn)
  const userId = useAppSelector((state) => state.auth.userId);
  const contactList = useAppSelector((state) => state.contacts.contactsList);
  const chatroomList = useAppSelector((state) => state.messages.chatroomList);
  const token = localStorage.getItem(`${PREFIX}token`)

  useEffect(() => {
    document.title = `Chat-APP`;
  });

  useEffect(()=>{
    if (token){
      dispatch(retrieveLogin(token))
    }
  },[])

  useEffect(()=>{
    if (login && userId) {
      dispatch(getContactList(userId))
      dispatch(getChatroomList(userId))   
    }
  },[login])

  useEffect(()=>{
    if (contactList === null) return
    socket.on('getOnlineUserListResponse', (contactList) => {
      dispatch(getContactsListAction(contactList))
    });
  },[contactList])

  useEffect(()=>{
    // if (chatroomList === null || !userId) return
    socket.on('sendMessageResponse', (chatroomId) => {
      dispatch(getMessages(chatroomId))
  });
  },[chatroomList])


  return (
    !login ? <Login /> : <Home/>
  )
}

export default App;
