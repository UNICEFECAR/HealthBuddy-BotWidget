import '../styles/styles.scss';
import BotAvatarSVG from '../images/botAvatar.svg';

const WebChat = require('../scripts/bot.js');
const $ = require('jquery');

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

const isMobile = () => {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}

const dispatchNative = window.dispatchNative;

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
    const stringParsed = JSON.parse(event);
    const toggleInput = getMessageType();
    const senderElement = $(".sender");
    if (stringParsed.event === "receivedMessageFromChannel") {
        if (isMobile()) {
            console.debug("--------> Sent params for input: ", outputParams(null, toggleInput));
            dispatchNative(JSON.stringify(outputParams(null, toggleInput)));
        } else {
            toggleInput <= 0 ? senderElement.hide() : senderElement.show();
        }
    }
}

// calls only on backend side
window.dispatchWeb = (params) => {
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
        default:
            break;
    }
}

const dispatchWeb = window.dispatchWeb;

const isPageLoaded = () => {
    if (isMobile()) {
        console.debug("--------> Page is loaded");
        dispatchNative(JSON.stringify(loaded));
    }

    // listen DOM changes and add 'selected' class for chosen reply
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const replyElement = mutation.addedNodes[0];
            if (replyElement && replyElement.tagName === 'DIV' && replyElement.classList.contains("group-message")) {
                const reply = $(replyElement).find(".reply");
                Array.prototype.forEach.call(reply, (elem) => {
                    elem.addEventListener("mousedown", () => {
                        $(elem).addClass("selected");
                    });
                    elem.addEventListener("touchstart", () => {
                        $(elem).addClass("selected");
                    })
                });
            }
        });
    });

    // Starts listening for changes in the root HTML element of the page.
    mutationObserver.observe(document.documentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
}

document.addEventListener("DOMContentLoaded", isPageLoaded);
