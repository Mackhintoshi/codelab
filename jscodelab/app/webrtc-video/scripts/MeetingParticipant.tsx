
export enum STUN_SERVERS {
    GOOGLE = 'stun:stun.l.google.com:19302',
}

export enum Participant {
    HOST = 'host',
    JOINER = 'joiner'
}
export interface iMeetingParticipantsConfig {
    audioStream: MediaStream|undefined;
    videoStream: MediaStream|undefined;
    STUN_SERVERS: STUN_SERVERS[];
    onConnect: (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => void;
    onDisconnect?: (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection|undefined) => void;
    onConnectionChange: (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => void;
    onError?: (event:RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => void;
    onBothConnected?: ((audioTrack: MediaStreamTrack, videoTrack: MediaStreamTrack) => void);

}

export default class MeetingParticipant implements iMeetingParticipantsConfig{
    STUN_SERVERS: STUN_SERVERS[];
    audioStream: MediaStream|undefined;
    videoStream: MediaStream|undefined;
    participant: Participant;
    onDisconnect?: ((event: RTCPeerConnectionIceEvent, peerConnection:RTCPeerConnection | undefined) => void) | undefined;
    onError?: ((event: RTCPeerConnectionIceEvent, peerConnection:RTCPeerConnection) => void) | undefined;
    onConnect: (event: RTCPeerConnectionIceEvent, peerConnection:RTCPeerConnection) => void;
    onConnectionChange: (event: RTCPeerConnectionIceEvent,peerConnection:RTCPeerConnection) => void;
    onBothConnected: ((audioTrack: MediaStreamTrack, videoTrack: MediaStreamTrack) => void) | undefined;
    

    iceCandidates: RTCIceCandidate[] = [];

    public peerConnection: RTCPeerConnection|undefined = undefined;

    constructor(participant:Participant,config: iMeetingParticipantsConfig) {

        this.STUN_SERVERS = config.STUN_SERVERS;
        this.onConnect = config.onConnect;
        this.onDisconnect = config.onDisconnect;
        this.onConnectionChange = config.onConnectionChange;
        this.onError = config.onError;
        this.onBothConnected = config.onBothConnected;
        this.audioStream = config.audioStream;
        this.videoStream = config.videoStream;
        this.participant = participant;

        this.init()
    }

    private createOffer() {
        this.peerConnection?.createOffer().then((offer) => {
            this.peerConnection?.setLocalDescription(offer);
            console.log("offer created", offer)
        });
    }

    private createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: this.STUN_SERVERS
                },
            ],
        });

        this.addSteams();
        //add event listeners
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.peerConnection.addEventListener('connectionstatechange', this.onConnectionStateChange.bind(this));
        this.peerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange.bind(this));

    }

    private addSteams(){
         //add audio and video tracks if they exist
         this.audioStream && this.audioStream.getTracks().forEach((track) => {
            this.audioStream && this.peerConnection?.addTrack(track, this.audioStream);
            }
            );
            this.videoStream && this.videoStream.getTracks().forEach((track) => {
                this.videoStream && this.peerConnection?.addTrack(track, this.videoStream);
            }
            );
    }
    //events
    private onIceCandidate(event: RTCPeerConnectionIceEvent) {
        console.log("on ice candidate", event)
        event.candidate && this.iceCandidates.push(new RTCIceCandidate(event.candidate))
        if(this.participant === Participant.JOINER){
            this.iceCandidates.forEach((candidate) => {
                //add ice candidates when they are received for JOINER
                this.peerConnection?.addIceCandidate(candidate);
            });
        }
        this.onConnect(event,this.peerConnection as RTCPeerConnection)
    }

    private onConnectionStateChange(event: RTCPeerConnectionIceEvent|any) {
        if (this.peerConnection) {
            switch (this.peerConnection.connectionState) {
                case "connected":
                    this.onConnect(event, this.peerConnection);
                    break;
                case "disconnected":
                    this.onDisconnect && this.onDisconnect(event, this.peerConnection);
                    break;
                case "failed":
                    this.onError && this.onError(event, this.peerConnection);
                    break;
                case "closed":
                    this.onDisconnect && this.onDisconnect(event, this.peerConnection);
                    break;
            }
        }
    }

    private onIceConnectionStateChange(event: RTCPeerConnectionIceEvent|any) {
        if (this.peerConnection) {
            switch (this.peerConnection.iceConnectionState) {
                case "connected":
                    this.onConnect(event, this.peerConnection);
                    break;
                case "disconnected":
                    this.onDisconnect && this.onDisconnect(event, this.peerConnection);
                    break;
                case "failed":
                    this.onError && this.onError(event, this.peerConnection);
                    break;
                case "closed":
                    this.onDisconnect && this.onDisconnect(event, this.peerConnection);
                    break;
            }
        }
    }

    private onIceGatheringStateChange(event: RTCPeerConnectionIceEvent) {
        this.onError && this.onError(event,this.peerConnection as RTCPeerConnection)
    }


    //methods
    updateVideoStream(videoStream: MediaStream|undefined) {
        this.videoStream = videoStream;
        this.videoStream!==undefined && this.peerConnection?.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'video') {
                sender.replaceTrack(videoStream!.getVideoTracks()[0]);
            }
        });
    }

    updateAudioStream(audioStream: MediaStream|undefined) {
        this.audioStream = audioStream;
        this.audioStream!==undefined && this.peerConnection?.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'audio') {
                sender.replaceTrack(audioStream!.getAudioTracks()[0]);
            }
        });
    }

    onBothConnectedEvent() {
        //send message to both participants that they are connected
        //get the tracks for both audio and video and send it to the instance
        let tracks = this.peerConnection?.getTransceivers();
        console.log(tracks)
        //tracks attached are different if the participant is a host or joiner
        if(this.participant === Participant.HOST){
            this.onBothConnected && this.onBothConnected(tracks![0].receiver.track as MediaStreamTrack,tracks![1].receiver.track as MediaStreamTrack)
        }else if(this.participant === Participant.JOINER){
            this.onBothConnected && this.onBothConnected(tracks![1].sender.track as MediaStreamTrack,tracks![0].sender.track as MediaStreamTrack)
        }
    }


    private init() {
       if(this.participant === Participant.HOST){
           this.createPeerConnection();
           this.createOffer();
       }else if(this.participant === Participant.JOINER){
           this.createPeerConnection()
       }
    }
}