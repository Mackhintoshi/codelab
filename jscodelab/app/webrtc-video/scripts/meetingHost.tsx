import MeetingParticipant, { Participant, iMeetingParticipantsConfig } from "./MeetingParticipant"


interface iMeetingHostConfig extends iMeetingParticipantsConfig{
    
    
    
}

export default class MeetingHost extends MeetingParticipant implements iMeetingHostConfig {
    constructor(config: iMeetingHostConfig) {
        super(Participant.HOST,config)
    }

    //public methods
    acceptJoinRequest(sdp: RTCSessionDescriptionInit,peerName:string) {
        console.log(this.peerConnection)
        this.peerConnection?.setRemoteDescription(sdp).then(() => {
            console.log("Accepted Join Request")
            super.onBothConnectedEvent()
        }
        );
    }

}