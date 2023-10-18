import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Textarea } from "../../../components/ui/textarea"
import { DialogClose } from "@radix-ui/react-dialog"


type JoinMeetingPanelProps = {
    onJoinMeeting:(roomName:string,sdp:String,peerName:String)=>void
    videoStream?:MediaStream
    audioStream?:MediaStream
    onError:(error:String)=>void
}

export default function JoinMeetingModal(props:JoinMeetingPanelProps){
    
    const [name, setName] = useState<string|undefined>("Peer")
    const [sdp, setSdp] = useState<string|undefined>(undefined)
    const [roomName, setRoomName] = useState<string|undefined>(undefined)

    const getMeetingInfo = ()=>{
      if(roomName === undefined){
        props.onError("Enter a room name")
        return
      }
      if(props.videoStream === undefined && props.audioStream === undefined){
        props.onError("Enable at least one of the audio or video streams.")
        return
      }
      //get meeting info using room name
      const url = process.env.NEXT_PUBLIC_API_URL + "/room/"+roomName
      fetch(url).then((response)=>{
        if(response.ok){
          return response.json()
        }else{
          props.onError("Error getting meeting info")
        }
      }).then((data)=>{
        console.log(data)
        //send room name details to parent
        props.onJoinMeeting(roomName,data.host_sdp_text,name as String)
        
      }).catch((error)=>{
        props.onError(error.message)
      })

    }


    return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className=" h-12 text-lg font-bold border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white
             dark:border-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 dark:hover:text-white
            ">Join Peer to Peer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join Peer to Peer</DialogTitle>
              <DialogDescription>
                Enter your name and the SDP information from your peer
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue="Peer"
                  value={name}
                  onChange={(e)=>{setName(e.target.value)}}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sdp" className="text-right">
                  Room ID
                </Label>
                <Input
                  id="sdp"
                  value={roomName}
                  onChange={(e)=>{setRoomName(e.target.value)}}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={getMeetingInfo}>Join</Button>
                </DialogClose>
              
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}