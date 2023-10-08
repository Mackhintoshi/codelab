import { Button } from "../ui/button"
import adapter from 'webrtc-adapter'

type JoinMeetingPanelProps = {
    onStartPeerToPeer:(candidates:RTCIceCandidate[])=>void
}

export default function JoinMeetingPanel(props:JoinMeetingPanelProps){
    let iceCandidates:RTCIceCandidate[] = []

    const handeConnection = (event:RTCPeerConnectionIceEvent) => {
        console.log(event)
        if(event.candidate){
            console.log("candidate connection created")
            console.log(event.candidate)
        }
    }

    const handleConnectionChange = (event:any) => {
        console.log("connection changed")
        console.log(event)
    }
    const onStartPeerToPeer = () => {
        //get local connection
        const servers = {
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        }
        let peerConnection = new RTCPeerConnection(servers)
        peerConnection.addEventListener("icecandidate", handeConnection)
        peerConnection.addEventListener("iceconnectionstatechange", handleConnectionChange)
        //create offer
        peerConnection.createOffer().then((offer)=>{
            //add the offer to local connection
            peerConnection.setLocalDescription(offer).then(()=>{
                console.log("offer added to local connection")
                console.log(peerConnection)
                
            })
        })
        
    }

    const onJoinPeerToPeer = () => {}

    return (
        <div className="grid w-full grid-cols-1 gap-6 px-11">
            <div className="flex flex-col gap-6 px-11">
                <Button onClick={()=>{onStartPeerToPeer()}}
                className="w-1/2 border-2 border-green-400 bg-white text-green-500 hover:bg-green-600 hover:text-white"
                >Start Peer to Peer</Button>
            </div>
            <div className="flex flex-col gap-6 px-11">
                <Button 
                className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white"
                onClick={()=>{onJoinPeerToPeer()}}>Join Peer to Peer</Button>
            </div>
        </div>
    )
}