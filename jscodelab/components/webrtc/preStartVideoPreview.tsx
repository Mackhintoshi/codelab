'use client';
import { useEffect, useState } from "react";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import JoinMeetingModal from "./JoinMeetingPanel";




let iceCandidates:RTCIceCandidate[] = []
let peerConnection:RTCPeerConnection;
let joinerPeerConnection:RTCPeerConnection;

export default function PreStartVideoPreview() {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [videoStream, setVideoStream] = useState<MediaStream|undefined>(undefined)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [audioStream, setAudioStream] = useState<MediaStream|undefined>(undefined)
    const [isStarted, setIsStarted] = useState(false)

    const [sdpText, setSdpText] = useState<string|undefined>(undefined)
    const [peerSDPText, setPeerSDPText] = useState<string|undefined>(undefined)

    const [error, setError] = useState<string|undefined>(undefined)



    const handleConnection = (event:RTCPeerConnectionIceEvent) => {
        if(event.candidate){
            //get the public candidate IP
            console.log("candidate connection created")
            let publicIp = event.candidate.address
            let port = event.candidate.port
            console.log(`public ip: ${publicIp}:${port}`)
            //todo: send candidate to message broker
            //for now, get the candidates in an array to be given to the peer connection
            let iceCandidate = new RTCIceCandidate(event.candidate)
            iceCandidates.push(iceCandidate)
            // get the local description
            setSdpText(JSON.stringify(peerConnection.localDescription))

        }
    }
    
    const handleConnectionChange = (event:any) => {
        console.log("CONNECTION CHANGED. Update SDP")
        console.log(event)
        //get the new SDP
        setSdpText(JSON.stringify(peerConnection.localDescription))
    }

    const onMessageReceived = (message:any) => {
        console.log(message)
    }

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
            navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=>{
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

    const onStartPeerToPeer = () => {
        setError(undefined)
        let iceCandidates:RTCIceCandidate[] = []
        let servers = {
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        }
        peerConnection = new RTCPeerConnection(servers);
        peerConnection.addEventListener("icecandidate", handleConnection)
        peerConnection.addEventListener("iceconnectionstatechange", handleConnectionChange)
        peerConnection.addEventListener("message", onMessageReceived)
        
        if(!isVideoEnabled && !isAudioEnabled){
            setTimeout(()=>{
                setError("Video or Audio should be enabled to continue");
                }, 200)
                return;
        }
        if(isVideoEnabled){
            peerConnection.addTrack(videoStream?.getVideoTracks()[0] as MediaStreamTrack, videoStream as MediaStream)
        }
        else{
            peerConnection.addTrack(audioStream?.getAudioTracks()[0] as MediaStreamTrack, audioStream as MediaStream)
        }

    
        //create offer
        peerConnection.createOffer().then((offer)=>{
            //add the offer to local connection
            peerConnection.setLocalDescription(offer).then(()=>{
                console.log("offer added to local connection")
            })

        })
    }
    const onJoinPeerToPeer = (sdp:String,peerName:String) => {
        //gets the SDP from joinModal and sets it to the peer remote connection
        //when joining a peer, create a new peer connection
        joinerPeerConnection = new RTCPeerConnection();
        joinerPeerConnection.addEventListener("icecandidate", (event)=>{
            if(event.candidate){
                //get the public candidate IP
                console.log("JOINER Connection created")
                setPeerSDPText(JSON.stringify(joinerPeerConnection.localDescription))
        }})
        joinerPeerConnection.addEventListener("iceconnectionstatechange", (event)=>{
            console.log("JOINER CONNECTION CHANGED. Update SDP")
            console.log(event)
            //get the new SDP
            setPeerSDPText(JSON.stringify(joinerPeerConnection.localDescription))
        })
        //add event listener when the host accepts the peer
        joinerPeerConnection.addEventListener("message", (message)=>{
            console.log(message)
        })
        //attach the media
        if(isVideoEnabled){
            joinerPeerConnection.addTrack(videoStream?.getVideoTracks()[0] as MediaStreamTrack, videoStream as MediaStream)
        }
        if(isAudioEnabled){
            console.log("adding audio track")
            joinerPeerConnection.addTrack(audioStream?.getAudioTracks()[0] as MediaStreamTrack, audioStream as MediaStream)
        }

        //add the ice candidates to the peer connection
        iceCandidates.forEach((candidate)=>{
            joinerPeerConnection.addIceCandidate(candidate)
        })
        //set this SDP as the remote description
        joinerPeerConnection.setRemoteDescription(JSON.parse(sdp as string)).then(()=>{
            console.log("remote description set")
            //create answer
            joinerPeerConnection.createAnswer().then((answer)=>{
                //add the answer to the local connection
                joinerPeerConnection.setLocalDescription(answer).then(()=>{

                    console.log("answer added to local connection")
                    //get the local description
                    setPeerSDPText(JSON.stringify(joinerPeerConnection.localDescription))
                    //get the peer video element
                    const video = document.getElementById("peerVideo") as HTMLVideoElement
                    //get the tracks from the peer connection
                    let tracks = joinerPeerConnection.getTransceivers()
                    console.log(tracks[0].receiver.track)
                    //add the tracks to the video element
                    video.srcObject = new MediaStream([tracks[0].receiver.track])
                    video.play()
                    setIsStarted(true)
                    //get the audio track
                    console.log(tracks)
                    let audioTrack = tracks[1].receiver.track
                    //play the audio track
                    const audio = document.getElementById("peerAudio") as HTMLAudioElement
                    audio.srcObject = new MediaStream([audioTrack])
                    audio.play()
                })
            })
        })
        

       

    }

    const onSaveJoiningPeerSDP = () => {
        //gets the peer sdp from the text area and sets it to the peer remote connection

        const peerSDP = JSON.parse(peerSDPText as string)
        console.log("Accepting peer SDP")
        peerConnection.setRemoteDescription(peerSDP).then(()=>{
            console.log("remote description set")
            //get the peer video element
            const video = document.getElementById("peerVideo") as HTMLVideoElement
            //get the tracks from the peer connection
            let tracks = peerConnection.getTransceivers()
            console.log(tracks[0].receiver.track)
            //add the tracks to the video element
            video.srcObject = new MediaStream([tracks[0].receiver.track])
            video.play()
            setIsStarted(true)
            //get the audio track
            console.log(tracks)
            let audioTrack = tracks[1].receiver.track
            //play the audio track
            const audio = document.getElementById("peerAudio") as HTMLAudioElement
            audio.srcObject = new MediaStream([audioTrack])

        })
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
                    
                </div>
                
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
                            <Button onClick={()=>{onStartPeerToPeer()}}
                            className="w-1/2 border-2 border-green-400 bg-white text-green-500 hover:bg-green-600 hover:text-white"
                            >Start Peer to Peer</Button>
                        </div>
                        <div className="flex flex-col justify-center gap-6 text-center ">
                            <JoinMeetingModal onJoinMeeting={onJoinPeerToPeer} videoStream={videoStream} audioStream={audioStream} onError={(e)=>{setError(e as string)}}/>
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
                    {peerSDPText !== undefined ||sdpText !==undefined ?
                        <>
                        <p className="text-center text-gray-500">Paste the SDP Information from/to your peer</p>
                            <Textarea className="min-h-30vh w-full" value={peerSDPText} onChange={(e)=>{setPeerSDPText(e.target.value)}}/>
                            {
                                //hide this button if user is the peer that joins
                                sdpText !== undefined?
                                <Button
                                className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white"
                                onClick={()=>{onSaveJoiningPeerSDP()}}>Save Peer SDP</Button>
                                :<></>
                            }
                        
                        </>:<></>
                        }
                </div>
            </div>
        </div>
    )
}