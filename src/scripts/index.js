import "core-js";
import 'regenerator-runtime/runtime';

import '../styles/styles.scss';
import BotAvatarSVG from '../images/botAvatar.svg';

const WebChat = require('../scripts/bot.js');

const CHAT = "chat";
const POLLS = "polls";
const REPORT_RUMORS = "reportrumors";

const INIT = "init";
const LANGUAGE = "language";
const SEND_TEXT = "sendText";
const INIT_PHRASE = "initPhrase";
const CLEAR = "clear";
const TEXT = "text";
const USER_ID = "userId";

const chatContainer = document.getElementById("webchat");

const isMobile = () => {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}

const dispatchNative = function(s){
    window["dispatchNative"](s);
}

const initWebchat = (initPayload, sessionId) => {
    sessionStorage.clear();
    WebChat.default.init({
        initPayload: initPayload,
        socketUrl: "https://socket.push.al",
        title: "HealthBuddy chatbot",
        selector: "#webchat",
        channelUuid: 'b46efd0e-849d-45c9-b056-370a71be6d60',
        host: 'https://rapidpro.ilhasoft.mobi',
        profileAvatar: BotAvatarSVG,
        sessionId: sessionId,
        customMessageDelay: (message) => {
            let delay = message.length * 30;
            if (delay > 2 * 1000) delay = 3 * 1000;
            if (delay < 400) delay = 1000;
            const messages = document.getElementById("push-messages");
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 1500);

            return delay;
        },
        onSocketEvent: {
            'connect': () => {
                if (isMobile()) {
                    console.debug("--------> Connected to webchat");
                    dispatchNative('{"eventName": "operationResult", "payload": "eyJzdGF0dXMiOiAic3VjY2VzcyJ9"}'); //success
                }
            },
            'disconnect': () => {
                if (isMobile()) {
                    console.debug("--------> Disconnected from webchat");
                    dispatchNative('{"eventName": "operationResult", "payload": "eyJzdGF0dXMiOiAiZXJyb3IifQ=="}');  //error
                }
            },
        },
        params: {
            storage: "session"
        }
    });
    WebChat.clear();
    console.debug("--------> History was cleared");
    WebChat.open();
    WebChat.send(initPayload); // start conversation
    console.debug("--------> Init payload was sent: ", initPayload);
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

const fromBinary = function(binary) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

let message;

// calls only on backend side
window["dispatchWeb"] = (params) => {
    const paramsObject = JSON.parse(params);
    const formattedPayload = paramsObject.payload == null ? null : window.atob(paramsObject.payload);
    const decodedPayloadString = formattedPayload == null ? null : fromBinary(formattedPayload);
    const decodedPayloadObject = decodedPayloadString == null ? null : JSON.parse(decodedPayloadString);

    switch (paramsObject.eventName) {
        case INIT:
            const initPhrase = decodedPayloadObject[INIT_PHRASE];
            const initPayload = initPhrase + " " + decodedPayloadObject[LANGUAGE];
            const sessionId = decodedPayloadObject[USER_ID];
            initWebchat(initPayload, sessionId);
            getWidgetType(chatContainer, initPhrase);
            console.debug("--------> Webchat is initialized");
            break;
        case SEND_TEXT:
            message = decodedPayloadObject[TEXT];
            if (message) {
                WebChat.send(message, message);
                message = "";
                console.debug("--------> Message is sent");
            }
            break;
        case CLEAR:
            WebChat.clear();
            break;
        default:
            break;
    }
}

const dispatchWeb = window["dispatchWeb"];
