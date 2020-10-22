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
const RESET = "reset";
const TEXT = "text";
const USER_ID = "userId";

const operationSuccessful = {
    "eventName": "operationResult",
    "payload": {
        "status": "success",
        "description": "Connected to webchat"
    }
}
const operationFailed = {
    "eventName": "operationResult",
    "payload": {
        "status": "error",
        "description": "Disconnected from webchat"
    }
}

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

const messages = []

const initWebchat = (initPayload, sessionId) => {
    sessionStorage.clear();
    WebChat.default.init({
        initPayload: initPayload,
        socketUrl: process.env.socketUrl,
        channelUuid: process.env.channelUuid,
        host: process.env.host,
        title: "HealthBuddy chatbot",
        selector: "#webchat",
        profileAvatar: BotAvatarSVG,
        sessionId: sessionId,
        customMessageDelay: (message) => {
            messages.push(message);
            if (messages.length == 1) {
                return 0;
            }
            return calcDelay(messages[messages.length - 2] || message);
        },
        onSocketEvent: {
            'connect': () => {
                if (isMobile()) {
                    console.debug("--------> Connected to webchat");
                    dispatchNative(fromObject(operationSuccessful));
                }
            },
            'disconnect': () => {
                if (isMobile()) {
                    console.debug("--------> Disconnected from webchat");
                    dispatchNative(fromObject(operationFailed));
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

const calcDelay = function(message) {
    let delay = message.length * 50;
    if (delay < 400) delay = 1000;
    return delay;
  }

const fromBinary = function(binary) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

const fromObject = function(obj) {
    let resultObject = {...obj};
    let objJsonStr = JSON.stringify(resultObject.payload);
    resultObject.payload = Buffer.from(objJsonStr).toString("base64");
    return JSON.stringify(resultObject);
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
        case RESET:
            WebChat.reload();
            WebChat.clear();
            break;
        default:
            break;
    }
}

const dispatchWeb = window["dispatchWeb"];
