'use client';
import { useState } from "react";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";

export default function PreStartVideoPreview() {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [videotream, setVideoStream] = useState<MediaStream|undefined>(undefined)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [audioStream, setAudioStream] = useState<MediaStream|undefined>(undefined)



    const startVideo = () => {
        const video = document.getElementById("webCamVideo") as HTMLVideoElement
        //@ ts-ignore
        if(navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video:true}).then((stream)=>{
                setVideoStream(stream)
                video.srcObject = stream
                video.play()
                setIsVideoEnabled(true)
            }).catch((err)=>{
                console.log(err)
            })
        }
    }

    const stopVideo = () => {
        const video = document.getElementById("webCamVideo") as HTMLVideoElement
        //@ ts-ignore
        videotream?.getVideoTracks().forEach((track)=>{
            track.stop()
        })
        video.srcObject = null
        setIsVideoEnabled(false)
    }

    const startAudio = () => {
        //@ ts-ignore
        if(navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=>{
                setAudioStream(stream)
                setIsAudioEnabled(true)
            }).catch((err)=>{
                console.log(err)
            })
        }
    }

    const stopAudio = () => {
        //@ ts-ignore
        audioStream?.getAudioTracks().forEach((track)=>{
            track.stop()
        })
        setIsAudioEnabled(false)
    }

    return (
        <div className="grid
        min-h-full w-full grid-cols-1 items-center justify-center"

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
        <div className="grid w-full grid-cols-2 items-center justify-center bg-black py-5">
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
            
        </div>
    )
}