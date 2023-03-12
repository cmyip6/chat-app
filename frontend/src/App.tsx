import { useEffect } from "react";
import './App.css'
import Home from "./components/Home";
import Login from "./components/Login";
import { retrieveLogin } from "./redux/auth/thunk";
import { getContactList } from "./redux/contacts/thunk";
import { getChatroomList } from "./redux/messages/thunk";
import { PREFIX, useAppDispatch, useAppSelector } from "./store";

function App() {
  const dispatch= useAppDispatch()
  const login = useAppSelector(state=>state.auth.isLoggedIn)
  const userId = useAppSelector((state) => state.auth.userId);
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
  },[dispatch, login, userId])



  return (
    !login ? <Login /> : <Home/>
  )
}

export default App;
