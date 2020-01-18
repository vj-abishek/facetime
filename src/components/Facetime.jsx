import React, { useRef, useState } from 'react'
import Peer from 'simple-peer'
import io from 'socket.io-client'
import RecievingCall from './RevievingCall'
import Tune from '../tin_tin_tin.mp3'

const socket = io.connect('https://abigo-facetime.herokuapp.com/')
let client = {}

export default function Facetime() {
  const video = useRef(null)
  const video2 = useRef(null)
  const container = useRef(null)
  const RecievingCAllReference = useRef(null)
  const videoREmote = useRef(null)
  const videoYou = useRef(null)
  const [calling, setCalling] = useState(false)
  const [RemoteClick, setRemoteClick] = useState(false)
  const [BackOffer, setBackOffer] = useState()

  const InitPeer = (init, stream) => {
    let peer = new Peer({
      initiator: init === 'init' ? true : false,
      stream: stream,
      trickle: false
    })
    peer.on('stream', data => {
      console.log(data)
      setRemoteStream(data)
    })
    peer.on('destroy', () => {
      peer.close()
    })
    peer.on('connect', function() {
      if (RecievingCAllReference.current !== null) {
        console.log(RecievingCAllReference)
        RecievingCAllReference.current.style.display = 'none'
      }
      console.log('CONNECT')
    })
    return peer
  }

  //front user
  const handeClick = () => {
    client.gotAnswer = false
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        console.log(stream)
        CreateVideo(stream)
        let peer = InitPeer('init', stream)
        peer.on('signal', data => {
          console.log(data)
          if (!client.gotAnswer) {
            socket.emit('offer', data)
          }
        })
        peer.on('stream', data => {
          console.log(data)
        })

        client.peer = peer
      })
      .catch(err => console.error(err))
  }

  //handle back user Click
  const backuserClick = () => {
    client.gotAnswer = false
    setRemoteClick(true)
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        console.log(stream)
        CreateVideo(stream)
        let peer = InitPeer('notInit', stream)
        peer.on('signal', data => {
          console.log(data)
          if (!client.gotAnswer) {
            console.log('emitting offer..')
            socket.emit('offer', data)
          }
        })
        client.peer = peer
      })
      .catch(err => console.error(err))
  }

  //back user

  const FrontAnswer = offer => {
    let peer = InitPeer(false)
    peer.on('signal', data => {
      socket.emit('answer', data)
    })
    peer.signal(offer)
  }

  //home peer
  const signalPeer = answer => {
    console.log('Answer from back', answer)
    client.gotAnswer = true
    let peer = client.peer
    peer.signal(answer)
  }

  socket.on('backAnswer', data => {
    console.log('backAnswer', data)
    signalPeer(data)
  })

  socket.on('backOffer', data => {
    console.log('Calling...', data)
    let sound = new Audio(Tune)

    sound.play()

    setCalling(true)
    setBackOffer(data)
  })
  if (RemoteClick) {
    FrontAnswer(BackOffer)
  }
  //create Video
  const CreateVideo = stream => {
    console.log(video)
    if (video.current !== null) {
      container.current.style.display = 'none'
      video.current.srcObject = stream
      video.current.play()
    } else {
      video2.current.srcObject = stream
      video2.current.play()
    }
  }

  const setRemoteStream = stream => {
    console.log('REMOTE STREAM', stream)
    if (videoREmote.current !== null) {
      videoREmote.current.style.display = 'block'
      videoREmote.current.srcObject = stream
      videoREmote.current.play()
    } else {
      videoYou.current.style.display = 'block'
      videoYou.current.srcObject = stream
      videoYou.current.play()
    }
  }
  return calling ? (
    <>
      <div ref={RecievingCAllReference}>
        <RecievingCall RecievingCallClick={backuserClick} />
      </div>
      <video className='remoteStream_me' ref={videoREmote}></video>
      <video className='local' ref={video2} muted></video>
    </>
  ) : (
    <>
      <div className='App' ref={container}>
        <p>There are 2 users currently in this session</p>
        <h1>Call Now</h1>
        <button className='btn' onClick={handeClick}>
          <svg className='svg-icon' viewBox='0 0 48 48'>
            <path d='M12.054 24.58C12.52 19.102 24.34 19.002 24.54 19c.202 0 12.024-.1 12.408 5.37.284 4.048-1.092 3.74-1.56 3.778-.41.033-4.823-.767-5.452-1.19-.63-.422-.785-2.703-1.293-3.094-.507-.39-3.092-.51-4.134-.502-1.043.01-3.63.174-4.143.572-.513.4-.702 2.683-1.337 3.117-.636.434-5.062 1.31-5.47 1.283-.47-.03-1.85.3-1.506-3.753'></path>
          </svg>
        </button>
      </div>
      <video className='remoteStream_me' ref={videoYou}></video>
      <video className='local' ref={video} muted></video>
    </>
  )
}
