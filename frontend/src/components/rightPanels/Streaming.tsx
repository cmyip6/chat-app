import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { socket, useAppDispatch, useAppSelector } from '../../store'
import Peer, { SignalData } from 'simple-peer'
import { hideNotification, showNotification } from '@mantine/notifications'
import { Container, Grid, Button, Card, Badge, Title, Group, Loader, Tooltip } from '@mantine/core'
import { IconCheck, IconVideoOff, IconVolumeOff } from '@tabler/icons-react'
import { setNotificationPositionAction, toggleIsStreamingAction } from '../../redux/option/slice'
import { setSelectedChatroomAction } from '../../redux/messages/slice'
import { checkNickname } from '../../utils/checkNickname'

export default function Streaming() {
  const dispatch = useAppDispatch()
  const contactList = useAppSelector(state => state.contacts.contactsList)
  const isStreaming = useAppSelector(state => state.option.isStreaming)
  const roomId = useAppSelector(state => state.messages.selectedChatroom)
  const userId = useAppSelector(state => state.auth.userId)
  const username = useAppSelector(state => state.auth.username)

  const myVideo: MutableRefObject<HTMLVideoElement | null> = useRef(null)
  const userVideo: MutableRefObject<HTMLVideoElement | null> = useRef(null)
  const connectionRef: MutableRefObject<Peer.Instance | undefined> = useRef(undefined)

  const [streamData, setStreamData] = useState<MediaStream | null>(null)
  const [call, setCall] = useState<{ isReceiving?: boolean, signal?: SignalData, initiator?: number, name?: string }>({})
  const [callAccepted, setCallAccepted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [calling, setCalling] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (calling) {
      timer = setTimeout(() => {
        cancelCall()
        showNotification({
          message: 'Call Unanswered',
          autoClose: 2000
        })
      }, 60000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [calling])

  useEffect(() => {
    let tracks: MediaStreamTrack[]
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((data) => {
        tracks = data.getTracks()
        if (data == null) {
          showNotification({
            message: 'something went wrong accessing your camera/audio, please refresh your browser and try again.'
          })
          return
        } else {
          setStreamData(data)
          myVideo.current!.srcObject = data
        }
      })

    socket.on('callUserResponse', ({ chatroomId, signal, initiator, name }) => {
      if (call.isReceiving) {
        socket.emit('cancelCall', chatroomId)
        return
      }
      setCall({ isReceiving: true, signal, initiator, name })

      showNotification({
        id: 'calling',
        autoClose: false,
        message: `${name} is calling you. Click Icon to navigate to the answer page`,
        icon: <IconCheck onClick={() => {
          dispatch(setSelectedChatroomAction(chatroomId))
          dispatch(toggleIsStreamingAction(true))
          hideNotification('calling')
        }} />,
        onOpen: () => dispatch(setNotificationPositionAction('top-center')),
        onClose: () => dispatch(setNotificationPositionAction('bottom-right'))
      })
    })

    socket.on('cancelCallResponse', (initiator) => {
      setCall({ isReceiving: false })
      leaveCall()
    })

    return () => {
      if (tracks === undefined) return
      tracks.forEach(track => track.stop())
      socket.off('callUserResponse')
    }
  }, [call.isReceiving, dispatch])

  const callUser = () => {
    setCalling(true)
    const peer = new Peer({ initiator: true, trickle: false, stream: streamData! });

    peer.on('signal', (data) => {
      socket.emit('callUser', { chatroomId: roomId, signal: data, initiator: userId, name: username })
    })

    peer.on('stream', (currentStream: MediaStream) => {
      userVideo.current!.srcObject = currentStream
    })

    socket.on('callAccepted', ({ signal, chatroomId, username }) => {
      setCall({ isReceiving: true, signal, name: username })
      peer.signal(signal)
      setCalling(false)
      setCallAccepted(true)
    })

    connectionRef.current = peer
  }

  const answerCall = () => {
    hideNotification('calling')
    setCallAccepted(true)
    const peer = new Peer({ initiator: false, trickle: false, stream: streamData! });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, chatroomId: roomId, username })
    })

    peer.on('stream', (currentStream: MediaStream) => {
      userVideo.current!.srcObject = currentStream
    })

    peer.signal(call.signal!)

    connectionRef.current = peer
  }

  const cancelCall = () => {
    socket.emit('cancelCall', roomId)
    setCallAccepted(false)
    setCall({ isReceiving: false })
    setCalling(false)
  }

  const leaveCall = () => {
    hideNotification('calling')
    setCallAccepted(false)
    setCall({ isReceiving: false })
    setCalling(false)
    connectionRef.current?.destroy()
  }

  return (
    <Container
      className='d-flex flex-column align-items-center gap-2'
      style={{ height: '100vh', position: 'relative', overflow: 'auto' }}
    >
      <Title order={3} weight={100} align="center">
        Video Chat
      </Title>
      <Grid grow>
        {
          streamData &&
          <Grid.Col span={4}>
            <Card
              className='d-flex flex-column gap-2 justify-content-center align-items-center'
              shadow='lg' radius="md" withBorder
              style={{ paddingBottom: '5px', minWidth: '400px', minHeight: '320px' }}
            >
              <video
                muted

                ref={myVideo}
                playsInline
                autoPlay
              />
              <Group style={{ width: '100%' }} position='apart'>
                <Badge style={{ minWidth: '100px' }} radius='xs' size='lg' variant='gradient'>{username}</Badge>
                <Button size="xs" variant={'subtle'} compact ><IconVideoOff /></Button>
              </Group>
            </Card>
          </Grid.Col>
        }
        {
          callAccepted &&
          <Grid.Col span={4}>
            <Card
              className='d-flex flex-column gap-2 justify-content-center align-items-center'
              shadow='lg' radius="md" withBorder
              style={{ position: 'relative', paddingBottom: '5px', minWidth: '400px', minHeight: '320px' }}
            >
              {
                videoOff &&
                <h1 style={{ position: 'absolute', top: '50%', left: '50%', margin: '0 auto' }}>
                  {checkNickname(call.name!, contactList!)}
                </h1>
              }
              <video
                style={{ visibility: videoOff ? 'hidden' : 'visible' }}
                controls
                muted={muted}
                ref={userVideo}
                playsInline
                autoPlay
              />

              <Group style={{ width: '100%' }} position='apart'>
                <Badge style={{ minWidth: '100px' }} radius='xs' size='lg' variant='gradient'>{checkNickname(call.name!, contactList!)}</Badge>
                <Button.Group>
                  <Button size="xs" variant={videoOff ? 'outline' : 'subtle'} compact onClick={() => setVideoOff(state => !state)}><IconVideoOff /></Button>
                  <Button size="xs" variant={muted ? 'outline' : 'subtle'} compact onClick={() => setMuted(state => !state)}><IconVolumeOff /></Button>
                </Button.Group>
              </Group>
            </Card>
          </Grid.Col>

        }
        <Grid.Col span={12}>
          {
            call.isReceiving && !callAccepted ?
              <Button fullWidth onClick={answerCall}>Accepted</Button> :
              calling ?
                <Tooltip label='Cancel call'>
                  <Button
                    fullWidth
                    onClick={cancelCall}
                    variant='outline'
                    leftIcon={<Loader variant="dots" />}
                    rightIcon={<Loader variant="dots" />}
                  >
                    Calling
                  </Button>
                </Tooltip> : callAccepted ?
                  <Button fullWidth onClick={cancelCall}>Disconnect</Button> :
                  <Button fullWidth onClick={callUser}>Ready</Button>
          }
        </Grid.Col>
      </Grid>
    </Container>
  )
}
