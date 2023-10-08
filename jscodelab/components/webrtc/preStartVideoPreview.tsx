'use client';
import { useState } from "react";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";




let iceCandidates:RTCIceCandidate[] = []

export default function PreStartVideoPreview() {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [videoStream, setVideoStream] = useState<MediaStream|undefined>(undefined)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [audioStream, setAudioStream] = useState<MediaStream|undefined>(undefined)

    const [sdpText, setSdpText] = useState<string|undefined>(undefined)

    const [error, setError] = useState<string|undefined>(undefined)

    let peerConnection:RTCPeerConnection;

    const handleConnection = (event:RTCPeerConnectionIceEvent) => {
        console.log(event)
        if(event.candidate){
            //get the public candidate IP
            console.log("candidate connection created")
            let publicIp = event.candidate.address
            console.log(publicIp)
            //todo: send candidate to message broker
            //for now, get the candidates in an array to be given to the peer connection
            let iceCandidate = new RTCIceCandidate(event.candidate)
            iceCandidates.push(iceCandidate)
            // get the local description
            setSdpText(JSON.stringify(peerConnection.localDescription))

        }
    }
    
    const handleConnectionChange = (event:any) => {
        console.log("CONNECTION CHANGED")
        console.log(event)
        //get the remote connection
        const remoteConnection = peerConnection.remoteDescription
        console.log(remoteConnection)
        //todo : send remote connection to message broker
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
                console.log(err);
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
    const onJoinPeerToPeer = () => {}

    return (
        <div className="align-center grid grid-cols-2 items-start
        justify-center gap-2 px-5
        ">
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
                <div className="flex flex-col justify-center gap-6 text-center">
                    <Button onClick={()=>{onStartPeerToPeer()}}
                    className="w-1/2 border-2 border-green-400 bg-white text-green-500 hover:bg-green-600 hover:text-white"
                    >Start Peer to Peer</Button>
                </div>
                <div className="flex flex-col justify-center gap-6 text-center ">
                    <Button 
                    className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white"
                    onClick={()=>{onJoinPeerToPeer()}}>Join Peer to Peer</Button>
                </div>
                <div className="flex flex-col justify-center gap-6 text-center ">
                    {
                        //show a code snippet of the SDP information to be sent to the other peer
                        sdpText !== undefined?
                        <Textarea className="w-full min-h-30vh" value={sdpText} onChange={(e)=>{setSdpText(e.target.value)}}
                        />:<></>
                    }
                   
                </div>
            </div>
        </div>
    )
}