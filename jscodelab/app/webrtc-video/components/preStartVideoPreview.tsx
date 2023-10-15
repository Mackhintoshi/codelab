'use client';
import { useEffect, useState } from "react";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import JoinMeetingModal from "./JoinMeetingPanel";
import { STUN_SERVERS } from "../scripts/MeetingParticipant";
import MeetingHost from "../scripts/meetingHost";
import MeetingJoiner from "../scripts/MeetingJoiner";
import { kv } from "@vercel/kv";



let host:MeetingHost|undefined = undefined
let hostSDPText:string|undefined = undefined
let isHost = false
let joiner:MeetingJoiner|undefined = undefined
let joinerSDPText:string|undefined = undefined
let roomName:string|undefined = undefined

export default function PreStartVideoPreview() {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [videoStream, setVideoStream] = useState<MediaStream|undefined>(undefined)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [audioStream, setAudioStream] = useState<MediaStream|undefined>(undefined)
    const [isStarted, setIsStarted] = useState(false)

    const [sdpText, setSdpText] = useState<string|undefined>(undefined)
    const [peerSDPText, setPeerSDPText] = useState<string|undefined>(undefined)
    const [currentRoomName, setCurrentRoomName] = useState<string|undefined>(undefined)

    const [error, setError] = useState<string|undefined>(undefined)


    //HOST
    const onStartHosting = () => {
        isHost = true;
        host = new MeetingHost({
            STUN_SERVERS:[STUN_SERVERS.GOOGLE],
            onConnect:onHostConnect,
            onDisconnect:onHostDisconnect,
            onConnectionChange:onHostConnectionChange,
            audioStream:audioStream as MediaStream,
            videoStream:videoStream as MediaStream,
            onBothConnected:onBothConnected
        })
        setIsStarted(true)
        
    }

    const onHostConnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        setError(undefined)
        playDing();
        hostSDPText = JSON.stringify(peerConnection.localDescription)
        //TODO: replace this with a websocket
        setSdpText(hostSDPText as string)
        roomName = (Math.floor(Math.random() * 10000000) + 100000).toString();
        //store to vercel kv
        let sdp = hostSDPText
        kv.hset(roomName,{sdp:sdp,peerName:"host"})
        //expire in 2 hours
        kv.setex(roomName.toString(),7200,{sdp:sdp,peerName:"host"})
        setCurrentRoomName(roomName)
        
    }

    const onHostDisconnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection|undefined) => {

    }

    const onHostConnectionChange = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        console.log("HOST CONNECTION CHANGED. Update SDP")
        hostSDPText = JSON.stringify(peerConnection.localDescription)
        //TODO: replace this with a websocket
        setSdpText(hostSDPText as string)
    }

    const onSaveJoiningPeerSDP = () => {
        //gets the peer sdp from the text area and sets it to the peer remote connection
        const peerSDP = JSON.parse(peerSDPText as string)
        console.log("Accepting peer SDP")
        host?.acceptJoinRequest(peerSDP as RTCSessionDescriptionInit,"Peer")
    }



    //JOINER
     const JoinPeerToPeer = (sdp:String,peerName:String) => {
        console.log("Joining peer to peer")
        isHost = false;
        joiner = new MeetingJoiner({
            STUN_SERVERS:[STUN_SERVERS.GOOGLE],
            onConnect:onJoinerConnect,
            onDisconnect:onJoinerDisconnect,
            onConnectionChange:onJoinerConnectionChange,
            audioStream:audioStream as MediaStream,
            videoStream:videoStream as MediaStream,
            onAnswer:onAnswer,
            onBothConnected:onBothConnected
        })
        joiner.join(JSON.parse(sdp as string),peerName as string)
        setIsStarted(true);
     }

    const onJoinerConnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        setError(undefined)
        playDing();
        joinerSDPText = JSON.stringify(peerConnection.localDescription)
        setPeerSDPText(joinerSDPText as string)
    }

    const onJoinerDisconnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection|undefined) => {

    }
    const onJoinerConnectionChange = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        console.log("JOINER CONNECTION CHANGED. Update SDP")
        joinerSDPText = JSON.stringify(peerConnection.localDescription)
        setPeerSDPText(joinerSDPText as string)
    }

    const onAnswer = (answerSDP:any, peerConnection: RTCPeerConnection) => {
        joinerSDPText = JSON.stringify(peerConnection.localDescription)
        setPeerSDPText(joinerSDPText as string)
    }

    const playDing = () => {
        //play a ding to notify the user that the peer has joined and to let browser allow audio
        const audio = document.getElementById("ding") as HTMLAudioElement
        audio.play()
    }


    //ON BOTH CONNECTED EVENTS
    const onBothConnected = (audioTrack: MediaStreamTrack, videoTrack: MediaStreamTrack) => {
        console.log("Both connected");
        //add the tracks to the audio and video element
        let peerVideo = document.getElementById("peerVideo") as HTMLVideoElement
        let peerAudio = document.getElementById("peerAudio") as HTMLAudioElement
        peerVideo.srcObject = new MediaStream([videoTrack])
        peerVideo.play()
        peerAudio.srcObject = new MediaStream([audioTrack])
        peerAudio.play()
    }
    //OLD
    //TODO when starting video, replace the streams in the peer connection

    const startVideo = () => {
        setError(undefined)
        const video = document.getElementById("webCamVideo") as HTMLVideoElement
        //@ ts-ignore
        if(navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video:true}).then((stream)=>{
                setVideoStream(stream)
                video.srcObject = stream
                video.play()
                setIsVideoEnabled(true)
            }).catch((err)=>{
                console.log(err);
                setError("Unable to start Video. Make sure to allow camera access")
            })
        }
    }

    const stopVideo = () => {
        const video = document.getElementById("webCamVideo") as HTMLVideoElement
        //@ ts-ignore
        videoStream?.getVideoTracks().forEach((track)=>{
            track.stop()
        })
        video.srcObject = null
        setIsVideoEnabled(false)
        //if audio is also disabled, set stream to null
        if(!isAudioEnabled){
            setVideoStream(undefined)
        }
    }

    const startAudio = () => {
        setError(undefined)
        //@ ts-ignore
        if(navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({
                audio:{
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    sampleRate: 8000,
                    sampleSize: 16
                }
                
            }).then((stream)=>{
                setAudioStream(stream)
                setIsAudioEnabled(true)
            }).catch((err)=>{
                console.log(err)
                setError("Unable to record Audio. Make sure to allow Microphone access")
            })
        }
    }

    const stopAudio = () => {
        //@ ts-ignore
        audioStream?.getAudioTracks().forEach((track)=>{
            track.stop()
        })
        setIsAudioEnabled(false)
        //if video is also disabled, set stream to null
        if(!isVideoEnabled){
            setAudioStream(undefined)
        }
    }

    useEffect(()=>{
        startVideo()
        startAudio()
    },[])
    return (
        <div className="align-center grid items-start justify-center
        gap-2 px-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2
        ">
            <div className="grid
                min-h-full w-full grid-cols-1 items-center justify-center  bg-black"
                style={{
                    display: isStarted?"block":"none"
                }}
                >
                <div className="flex w-full items-center justify-center bg-black"
                style={{
                    height: "50vh",
                }}
                >
                    <video autoPlay
                    id="peerVideo"
                    />
                    <audio autoPlay id="peerAudio"/>
                </div>
            </div>
                <div className="grid
                min-h-full w-full grid-cols-1 items-center justify-center  bg-black"
                >
                <div className="flex w-full items-center justify-center bg-black"
                style={{
                    height: "50vh",
                }}
                >
                    <video autoPlay
                    id="webCamVideo"
                    />
                </div>

                {
                    !isStarted?
                        <div className="position-absolute bottom-0 grid w-full grid-cols-2 items-center
                        bg-black py-5
                        ">
                            <div className="flex w-full items-center justify-center bg-black">
                                {
                                    isVideoEnabled?
                                    <BsFillCameraVideoFill 
                                    onClick={stopVideo}
                                    className="text-2xl text-red-500"
                                    />:
                                    <BsFillCameraVideoOffFill
                                    onClick={startVideo}
                                    className="text-2xl text-white"
                                    />
                                }
                            </div>
                            <div className="flex w-full items-center justify-center bg-black">
                                {
                                    isAudioEnabled?
                                    <AiFillAudio 
                                    onClick={stopAudio}
                                    className="text-2xl text-red-500"
                                    />:
                                    <AiOutlineAudioMuted
                                    onClick={startAudio}
                                    className="text-2xl text-white"
                                    />
                                }
                            </div>
                            
                        </div>:<></>
                }
                
                {
                error !== undefined?
                <div className="animate-shake flex w-full items-center justify-center bg-gray-800
                py-5"
                >
                        <p className="text-white">{error}</p>
                </div>:<></>
                }
                    
            </div>
            

            <div className="grid w-full grid-cols-1 justify-between gap-6 bg-white py-10 align-middle ">
                {
                    !isStarted?
                    <>
                        <div className="flex flex-col justify-center gap-6 text-center">
                            <Button onClick={onStartHosting}
                            className="w-1/2 border-2 border-green-400 bg-white text-green-500 hover:bg-green-600 hover:text-white"
                            >Start Peer to Peer</Button>
                        </div>
                        <div className="flex flex-col justify-center gap-6 text-center ">
                            <JoinMeetingModal onJoinMeeting={JoinPeerToPeer}
                               videoStream={videoStream} audioStream={audioStream} onError={(e)=>{setError(e as string)}}/>
                        </div>
                    </>:<></>
                }
                
                <div className="flex flex-col justify-center gap-6 text-center ">
                    {
                        //show a code snippet of the SDP information to be sent to the other peer
                        sdpText !== undefined?
                        <>
                        <p className="text-center text-gray-500">Give this SDP Information to your peer</p>
                        <Textarea className="min-h-30vh w-full" value={sdpText} onChange={(e)=>{setSdpText(e.target.value)}}
                        />
                        </>:<></>
                    }
                    {
                        //show a code snippet of the SDP information to be sent to the other peer
                        currentRoomName !== undefined?
                        <>
                        <p className="text-center text-gray-500">Room Name</p>
                        <p className="text-center text-gray-500">{currentRoomName}</p>
                        </>:<></>
                    }
                    {peerSDPText !== undefined ||sdpText !==undefined ?
                        <>
                        <p className="text-center text-gray-500">Paste the SDP Information from/to your peer</p>
                            <Textarea className="min-h-30vh w-full" value={peerSDPText} onChange={(e)=>{setPeerSDPText(e.target.value)}}/>
                            {
                                //hide this button if user is the peer that joins
                                sdpText !== undefined?
                                <Button
                                className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white"
                                onClick={()=>{
                                    onSaveJoiningPeerSDP()
                                }}>Save Peer SDP</Button>
                                :<></>
                            }
                        
                        </>:<></>
                        }
                </div>
            </div>
            <audio id="ding" src="ding.mp3"/>
        </div>
    )
}