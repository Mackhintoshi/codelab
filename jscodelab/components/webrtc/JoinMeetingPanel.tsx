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
import { Textarea } from "../ui/textarea"
import { DialogClose } from "@radix-ui/react-dialog"


type JoinMeetingPanelProps = {
    onJoinMeeting:(sdp:String,peerName:String)=>void
}

export default function JoinMeetingModal(props:JoinMeetingPanelProps){
    
    const [name, setName] = useState<string|undefined>(undefined)
    const [sdp, setSdp] = useState<string|undefined>(undefined)


    const onJoinPeerToPeer = () => {
        props.onJoinMeeting(sdp as String,name as String)
    }

    return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white">Join Peer to Peer</Button>
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
                  SDP
                </Label>
                <Textarea
                    id="sdp"
                    className="col-span-3"
                    value={sdp}
                    onChange={(e)=>{setSdp(e.target.value)}}
                />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={onJoinPeerToPeer}>Join</Button>
                </DialogClose>
              
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}