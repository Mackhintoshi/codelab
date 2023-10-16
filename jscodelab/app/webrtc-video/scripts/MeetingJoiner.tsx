import MeetingParticipant, { Participant, iMeetingParticipantsConfig } from "./MeetingParticipant";
interface iMeetingJoinerConfig extends iMeetingParticipantsConfig {
    onJoined: (event: RTCPeerConnectionIceEvent, peerConnection: RTCPeerConnection,peerName:string) => void;

}
    

export default class MeetingJoiner extends MeetingParticipant implements iMeetingJoinerConfig{
    onJoined: (answerSDP:any, peerConnection: RTCPeerConnection,peerName:string) => void;
    peerName: string;
   constructor (config: iMeetingJoinerConfig) {
         super(Participant.JOINER,config);
         this.onJoined = config.onJoined;
         this.peerName = "Peer"
   }


   private createAnswer() {
    this.peerConnection?.createAnswer().then((answer) => {
        this.peerConnection?.setLocalDescription(answer).then(() => {
            console.log("answer created", answer)
            this.onJoined(answer,this.peerConnection as RTCPeerConnection,this.peerName)
            this.onBothConnectedEvent()
        });
        
    });
    }

    //public methods
    join(sdp: RTCSessionDescriptionInit,peerName:string) {
        this.peerName = peerName
        console.log(this.peerConnection)
        this.peerConnection?.setRemoteDescription(sdp).then(() => {
            console.log("remote description set")
            this.createAnswer()
        }
        );
    }
}