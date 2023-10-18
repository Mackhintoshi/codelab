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
import io from 'socket.io-client';
import { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const apiURL = process.env.NEXT_PUBLIC_API_URL


let host:MeetingHost|undefined = undefined
let hostSDPText:string|undefined = undefined
let isHost = false
let joiner:MeetingJoiner|undefined = undefined
let joinerSDPText:string|undefined = undefined
let roomName:string|undefined = undefined
let socket:Socket|undefined = undefined

export default function MainPanel() {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [videoStream, setVideoStream] = useState<MediaStream|undefined>(undefined)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [audioStream, setAudioStream] = useState<MediaStream|undefined>(undefined)
    const [isStarted, setIsStarted] = useState(false)
    const [peerSDPText, setPeerSDPText] = useState<string|undefined>(undefined)
    const [currentRoomName, setCurrentRoomName] = useState<string|undefined>(roomName)
    const [isUserHost, setIsUserHost] = useState<boolean|undefined>(undefined)

    const [error, setError] = useState<string|undefined>(undefined)


    const saveRoomDetails = (roomName:string,sdp:string) => {
        const url = apiURL+"/room"
        const data = {
            room_name:roomName,
            host_sdp_text:sdp,
            host:"Meeting Host"
        }
        fetch(url,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            credentials: "include",
            body:JSON.stringify(data)
        }).then((res)=>{
            if(res.ok){
                return res.json()
            }else{
                throw new Error("Unable to save room details")
            }
        }).then((data)=>{
            setCurrentRoomName(roomName)
        }).catch((err)=>{
            console.log(err)
            setError("Unable to save room details")
        })

         
    }



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
        setIsUserHost(true)
        
        
    }

    const onHostConnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        
        setError(undefined)
        playDing();
        hostSDPText = JSON.stringify(peerConnection.localDescription)
        if(roomName === undefined){
            roomName = (Math.floor(Math.random() * 10000000) + 100000).toString();
        }
        saveRoomDetails(roomName,hostSDPText)
        
        
    }

    const onHostDisconnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection|undefined) => {

    }

    const onHostConnectionChange = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        console.log("HOST CONNECTION CHANGED. Update SDP")
        hostSDPText = JSON.stringify(peerConnection.localDescription)
        //update api
        let url = apiURL+"/room/"+roomName
        let data = {
            host_sdp_text:hostSDPText
        }
        fetch(url,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials: "include",
            body:JSON.stringify(data)
        }).then((res)=>{
            if(res.ok){
                return res.json()
            }else{
                throw new Error("Unable to update room details")
            }
        }).catch((err)=>{
            console.log(err)
            setError("Unable to update room details")
        })
       
    }



    //JOINER
     const JoinPeerToPeer = (joinedRoomName:string,sdp:String,peerName:String) => {
        roomName = joinedRoomName
        console.log("Joining peer to peer")
        isHost = false;
        joiner = new MeetingJoiner({
            STUN_SERVERS:[STUN_SERVERS.GOOGLE],
            onConnect:onJoinerConnect,
            onDisconnect:onJoinerDisconnect,
            onConnectionChange:onJoinerConnectionChange,
            audioStream:audioStream as MediaStream,
            videoStream:videoStream as MediaStream,
            onJoined:onJoined,
            onBothConnected:onBothConnected
        })
        joiner.join(JSON.parse(sdp as string),peerName as string)
        
     }

    const onJoinerConnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        setError(undefined)
        playDing();
        joinerSDPText = JSON.stringify(peerConnection.localDescription)
       // setPeerSDPText(joinerSDPText as string)
    }

    const onJoined = (answerSDP:any, peerConnection: RTCPeerConnection,peerName:string) => {
        joinerSDPText = JSON.stringify(peerConnection.localDescription)
       // setPeerSDPText(joinerSDPText as string)
        //update room details with guest_sdp_text and guest name
        let url = apiURL+"/room/join"
        console.log(peerName)
        let data = {
            room_name:roomName,
            guest:peerName,
            guest_sdp_text:JSON.stringify(answerSDP),
            
        }
        fetch(url,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials: "include",
            body:JSON.stringify(data)
        }).then((res)=>{
            if(res.ok){
                return res.json()
            }else{
                throw new Error("Unable to update room details")
            }
        }).catch((err)=>{
            console.log(err)
            setError("Unable to update room details")
        })
        setIsStarted(true);
    }
    const onJoinerDisconnect = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection|undefined) => {

    }
    const onJoinerConnectionChange = (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => {
        console.log("JOINER CONNECTION CHANGED. Update SDP")
        joinerSDPText = JSON.stringify(peerConnection.localDescription)
       // setPeerSDPText(joinerSDPText as string)
    }

    const playDing = () => {
        //play a ding to notify the user that the peer has joined and to let browser allow audio
        const audio = document.getElementById("ding") as HTMLAudioElement
        audio.play()
    }


    //ON BOTH CONNECTED EVENTS
    const onBothConnected = (audioTrack: MediaStreamTrack, videoTrack: MediaStreamTrack) => {
        console.log(videoStream,audioStream)
        console.log("Both connected");
        //add the tracks to the audio and video element
        let peerVideo = document.getElementById("peerVideo") as HTMLVideoElement
        let peerAudio = document.getElementById("peerAudio") as HTMLAudioElement
        peerVideo.srcObject = new MediaStream([videoTrack])
        peerVideo.play()
        peerAudio.srcObject = new MediaStream([audioTrack])
        peerAudio.play()
    }

    //temporay while we do not have websocket - get new sdp manually
    const getJoinerSDP = () => {
        let url = apiURL+"/room/"+roomName
        fetch(url).then((response)=>{
            if(response.ok){
                return response.json()
            }else{
                throw new Error("Unable to get room details")
            }
        }).then((data)=>{
            console.log(data)
            if(data.guest_sdp_text === undefined){
                setError("No peer has joined yet")
            }
            const peerSDP = JSON.parse(data.guest_sdp_text)
            console.log("Accepting peer SDP")
            host?.acceptJoinRequest(peerSDP as RTCSessionDescriptionInit,"Peer")
        }).catch((error)=>{
            setError("No peer has joined yet")
        })
    }
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
                    height: "40vh",
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
                    height: "40vh",
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
            

            <div className="grid w-full grid-cols-1 justify-between gap-2 py-10 align-middle ">
                {
                    !isStarted?
                    <>
                     <div className="flex flex-col items-center gap-6 text-center">
                            <Button onClick={onStartHosting}
                            className=" h-12 text-lg font-bold
                             border-2 border-green-400 bg-white text-green-500 hover:bg-green-600 hover:text-white
                            dark:border-green-500 dark:bg-green-500 dark:text-white dark:hover:bg-green-600 dark:hover:text-white"
                            >Start Peer to Peer</Button>
                        </div>
                        <p className="text-center">OR</p>
                        <div className="flex flex-col items-center gap-6 text-center ">
                            <JoinMeetingModal onJoinMeeting={JoinPeerToPeer}
                               videoStream={videoStream} audioStream={audioStream} onError={(e)=>{setError(e as string)}}/>
                        </div>
                    <Card className="">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold">Note</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-primary">
                                This is a simple demo. It is not a production ready application, thus it is not secure.
                            </p>
                            <p className="text-primary font-bold">
                            Missing Feature:
                            </p>
                            <ul className="text-primary ">
                                <li>Use Websockets to send SDP information. For now, manually click the refresh button to get the SDP information.</li>
                            </ul>
                        </CardContent>
                    </Card>
                       
                    </>:<></>
                }
                
                <div className="flex flex-col justify-center gap-6 text-center ">
                    {
                        //show a code snippet of the SDP information to be sent to the other peer
                        currentRoomName !== undefined?
                        <>
                        <p className="text-center text-red-500">Room Name</p>
                        <p className="text-center text-gray-500">{currentRoomName}</p>
                        </>:<></>
                    }
                    { isUserHost?
                        <>
                         <Button
                            className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white
                            dark:border-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                            onClick={()=>{
                                getJoinerSDP()
                            }}>Refresh</Button>
                       </>:<></>
                        }
                </div>
            </div>
            <audio id="ding" src="ding.mp3"/>
        </div>
    )
}