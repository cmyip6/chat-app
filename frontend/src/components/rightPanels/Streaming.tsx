import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { socket, useAppSelector } from '../../store'
import Peer, { SignalData } from 'simple-peer'
import { showNotification } from '@mantine/notifications'
import { Container, Grid, Button, Card, Text, Badge, Title, Group } from '@mantine/core'
import { IconVideoOff, IconVolumeOff } from '@tabler/icons-react'

export default function Streaming() {
  const isStreaming = useAppSelector(state => state.option.isStreaming)
  const roomId = useAppSelector(state => state.messages.selectedChatroom)
  const userId = useAppSelector(state => state.auth.userId)
  const username = useAppSelector(state => state.auth.username)

  const myVideo: MutableRefObject<HTMLVideoElement | null> = useRef(null)
  const userVideo: MutableRefObject<HTMLVideoElement | null> = useRef(null)
  const connectionRef: MutableRefObject<Peer.Instance | undefined> = useRef(undefined)

  const [streamData, setStreamData] = useState<MediaStream | null>(null)
  const [call, setCall] = useState<{ isReceiving: boolean, signal?: SignalData, initiator?: number, name?: string }>({ isReceiving: false })
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)

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

    socket.on('callUserResponse', ({ signal, initiator, name }) => {
      setCall({ isReceiving: true, signal, initiator, name })
    })

    return () => {
      if (tracks === undefined) return
      tracks.forEach(track => track.stop())
      socket.off('callUserResponse')
    }
  }, [isStreaming])

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream: streamData! });

    peer.on('signal', (data) => {
      socket.emit('callUser', { chatroomId: roomId, signal: data, initiator: userId, name: username })
    })

    peer.on('stream', (currentStream: MediaStream) => {
      userVideo.current!.srcObject = currentStream
    })

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const answerCall = () => {
    if (!call.signal) return
    setCallAccepted(true)
    const peer = new Peer({ initiator: false, trickle: false, stream: streamData! });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.initiator })
    })

    peer.on('stream', (currentStream: MediaStream) => {
      userVideo.current!.srcObject = currentStream
    })

    peer.signal(call.signal)

    connectionRef.current = peer
  }

  const leaveCall = () => {
    setCallEnded(true)
    connectionRef.current?.destroy()

  }

  return (
    <Container
      className='d-flex flex-column align-items-center gap-2'
      style={{ height: '100vh', position: 'relative'}}
    >
      <Title order={3} weight={100} align="center">
        Video Chat
      </Title>
      <Grid grow>
        {
          streamData &&
          <Grid.Col span={6}>
            <Card 
              className='d-flex flex-column gap-2 justify-content-center align-items-center'
              shadow='lg' padding="lg" radius="md" withBorder>
              <video
                muted
                ref={myVideo}
                playsInline
                autoPlay
              />
              <Group style={{width: '100%'}} position='apart'>
                <Badge style={{width:'100px'}} size='lg' variant='gradient'>{username}</Badge>
                <Group>
                  <IconVideoOff/>
                  <IconVolumeOff/>
                </Group>
              </Group>
            </Card>
          </Grid.Col>
        }
        {
          callAccepted && !callEnded && (
            <Grid.Col span={6}>
              <Container>
                <video
                  ref={userVideo}
                  playsInline
                  autoPlay
                />
              </Container>
            </Grid.Col>
          )
        }
      </Grid>
      {call.isReceiving ? <Button>Disconnect</Button> : <Button>Ready</Button>}

    </Container>
  )
}
