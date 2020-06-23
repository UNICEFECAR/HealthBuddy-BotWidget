import './styles/styles.scss';
import BotAvatarSVG from './images/botAvatar.svg';

const CHAT = "chat";
const POLLS = "polls";
const REPORT_RUMORS = "reportrumors";

const INIT = "init";
const LANGUAGE = "language";
const SEND_TEXT = "sendText";
const INIT_PHRASE = "initPhrase";
const TEXT = "text";

const loaded = {
    "eventName": "loaded"
}
const showInput = {
    "eventName": "showInput"
};
const hideInput = {
    "eventName": "hideInput"
}

const chatContainer = document.getElementById("webchat");

const initWebchat = (initPayload) => {
    sessionStorage.clear();
    WebChat.default.init({
        initPayload: initPayload,
        socketUrl: "https://socket.push.al",
        title: "HealthBuddy chatbot",
        selector: "#webchat",
        channelUuid: 'b46efd0e-849d-45c9-b056-370a71be6d60',
        host: 'https://rapidpro.ilhasoft.mobi',
        profileAvatar: BotAvatarSVG,
        onSocketEvent: {
            'message': (event) => {
                try {
                    onMessageEvent(event);
                } catch (error) {
                    return false;
                }
            },
            'connect': (event) => {
                dispatchNative('{"eventName": "operationResult", "payload: "eyJzdGF0dXMiOiAic3VjY2VzcyJ9"}'); //success
            },
            'disconnect': (event) => {
                dispatchNative('{"eventName": "operationResult", "payload: "eyJzdGF0dXMiOiAiZXJyb3IifQ==}');  //error
            },
        },
        params: {
            storage: "session"
        }
    });

    WebChat.open();
    WebChat.send(initPayload); // start conversation
}

// define css-class for webchat (chat, poll, rumour)
const getWidgetType = (element, initPhrase) => {
    let widgetType;
    switch (initPhrase) {
        case CHAT:
            widgetType = CHAT;
            break;
        case POLLS:
            widgetType = POLLS;
            break;
        case REPORT_RUMORS:
            widgetType = REPORT_RUMORS;
            break;
        default:
            break;
    }
    element.classList.add(widgetType);
}

// detect show or hide input
const outputParams = (initPhrase, condition) => {
    let outputString;

    //on initialization
    if (initPhrase === CHAT || initPhrase === REPORT_RUMORS) {
        outputString = showInput;
    } else if (initPhrase === POLLS) {
        outputString = hideInput;
    }

    //on receiving messages
    if (condition) {
        outputString = showInput;
    }

    return outputString;
}

// detect type of messages (text question or quick replies)
const getMessageType = () => {
    const lastMessage = $("#webchat").find(".group-message").last();
    const qr = $(lastMessage).find(".quickReplies-container");
    return qr.length;
}

let message;

// triggers on each received message
let onMessageEvent = (event) => {
    let stringParsed = JSON.parse(event);
    if (stringParsed.event === "receivedMessageFromChannel") {
        dispatchNative(JSON.stringify(outputParams(null, getMessageType())));
    }
}

const dispatchWeb = (params) => {
    const paramsObject = JSON.parse(params);
    const decodedPayloadString = window.atob(paramsObject.payload);
    const decodedPayloadObject = JSON.parse(decodedPayloadString);

    switch (paramsObject.eventName) {
        case INIT:
            const initPhrase = decodedPayloadObject[INIT_PHRASE];
            const initPayload = initPhrase + " " + decodedPayloadObject[LANGUAGE];
            initWebchat(initPayload);
            getWidgetType(chatContainer, initPhrase);
            dispatchNative(JSON.stringify(outputParams(initPhrase)));
            break;
        case SEND_TEXT:
            message = decodedPayloadObject[TEXT];
            if (message) {
                WebChat.send("message", message);
                message = "";
            }
            break;
        default:
            break;
    }
}

const isPageLoaded = () => {
    dispatchNative(JSON.stringify(loaded));
    dispatchWeb('{"eventName":"init","payload":"eyJpbml0UGhyYXNlIjogImNoYXQiLCAibGFuZ3VhZ2UiOiAiZW4ifQ=="}');
}

document.addEventListener("DOMContentLoaded", isPageLoaded);
