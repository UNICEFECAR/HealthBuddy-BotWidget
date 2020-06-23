#HealthBuddy chatbot

##Overview

Can be used in 3 modes:
- chat
- poll
- report rumors


##Launch

1. run 'npm run-script build'
2. run 'npm start'
3. open index.html from 'dist' folder


##Development

**Webview – JS code interaction** 

- `dispatchNative(string message)` is described on backend side. Calls native code from JS. 
- `dispatchWeb(string message)` calls JS code from native.

**Events which are used as parameters in functions mentioned above:**
 
#####`Loaded:` 
 `{"eventName": "loaded"} `

##### `Show input:` 
`{"eventName": "showInput"} `

##### `Hide input:` 
`{"eventName": "hideInput"}` 

##### `Init:` 
````
// chat
{"eventName": "init", "payload": "base64 string"}  
Payload: {"initPhrase": "chat", "language": "en"} 
Example: {"eventName":"init", "payload": "eyJpbml0UGhyYXNlIjoiaGVsbG8gZW4ifQ=="}

// poll 
{"eventName": "init", "payload": "base64 string"}  
Payload: {"initPhrase": "polls", "language": "en"} 

// rumours 
{"eventName": "init", "payload": "base64 string"}  
Payload: {"initPhrase": "reportrumors", "language": "en"} 
````

##### `Send input text:` 

````
Message: {"eventName": "sendText", "payload": "base64 string"} 
Payload: {"text": "string"}
````


##### `Operation result:` 
````
Message: {"eventName": "operationResult", "payload": "base64 string"} 
Payload: {"status": "success"} 
Payload: {"status": "error", "errorCode": "1", "description": "Connection lost."}
```` 
