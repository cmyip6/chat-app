import { LegacyRef, MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { socket, useAppSelector } from '../../store'
import Peer, { SignalData } from 'simple-peer'
import { showNotification } from '@mantine/notifications'
import { Card, Container, Grid } from '@mantine/core'

export default function Streaming() {
  const roomId = useAppSelector(state=>state.messages.selectedChatroom)
  const userId = useAppSelector(state=>state.auth.userId)
  const username = useAppSelector(state=>state.auth.username)

  const myVideo: MutableRefObject<HTMLVideoElement | null>= useRef(null)
  const userVideo: MutableRefObject<HTMLVideoElement | null>= useRef(null)
  const connectionRef: MutableRefObject<Peer.Instance | undefined> = useRef(undefined)
  
  const [streamData, setStreamData] = useState<MediaStream | null> (null)
  const [call, setCall] = useState<{isReceiving: boolean, signal?: SignalData, initiator?: number, name?: string}>({isReceiving: false})
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)

  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((data)=>{
      if (data==null){
        showNotification({
          message: 'something went wrong accessing your camera/audio, please refresh your browser and try again.' 
        })
        return
      } else {
        setStreamData(data)
        myVideo.current!.srcObject = streamData!
      }
    })
    
    socket.on('callUserResponse', ({signal, initiator, name})=>{
      setCall({isReceiving: true, signal, initiator, name})
    })  
  },[])
  
  const callUser = ()=>{
    const peer = new Peer({ initiator: true, trickle: false, stream: streamData!});

    peer.on('signal', (data)=>{
      socket.emit('callUser', {chatroomId: roomId, signal: data, initiator: userId, name: username})
    })

    peer.on('stream', (currentStream: MediaStream)=>{
      userVideo.current!.srcObject = currentStream
    })

    socket.on('callAccepted', (signal)=>{
      setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const answerCall = ()=>{
    if (!call.signal) return
    setCallAccepted(true)
    const peer = new Peer({ initiator: false, trickle: false, stream: streamData!});
  
    peer.on('signal', (data)=>{
      socket.emit('answerCall', {signal: data, to: call.initiator})
    })

    peer.on('stream', (currentStream: MediaStream)=>{
      userVideo.current!.srcObject = currentStream
    })

    peer.signal(call.signal)

    connectionRef.current = peer
  }

  const leaveCall = ()=>{
    setCallEnded(true)
    connectionRef.current?.destroy()

  }

  return (
    <div 
        style={{ height: '100vh', position: 'relative' }}
        >
          StreamingPanel
          <Grid>
            <Container>
              {myVideo && <video
                muted
                ref={myVideo}
                playsInline
                autoPlay
                />}
            </Container>
          </Grid>
    </div>
  )
}
