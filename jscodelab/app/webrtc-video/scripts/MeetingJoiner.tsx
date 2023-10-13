import MeetingParticipant, { Participant, iMeetingParticipantsConfig } from "./MeetingParticipant";
interface iMeetingJoinerConfig extends iMeetingParticipantsConfig {
    onAnswer: (event: RTCPeerConnectionIceEvent, peerConnection: RTCPeerConnection) => void;

}
    

export default class MeetingJoiner extends MeetingParticipant implements iMeetingJoinerConfig{
    onAnswer: (answerSDP:any, peerConnection: RTCPeerConnection) => void;

   constructor (config: iMeetingJoinerConfig) {
         super(Participant.JOINER,config);
         this.onAnswer = config.onAnswer;
   }


   private createAnswer() {
    this.peerConnection?.createAnswer().then((answer) => {
        this.peerConnection?.setLocalDescription(answer);
        console.log("answer created", answer)
        this.onAnswer(answer,this.peerConnection as RTCPeerConnection)
        this.onBothConnectedEvent()
    });
    }

    //public methods
    join(sdp: RTCSessionDescriptionInit,peerName:string) {
        console.log(this.peerConnection)
        this.peerConnection?.setRemoteDescription(sdp).then(() => {
            console.log("remote description set")
            this.createAnswer()
        }
        );
    }
}