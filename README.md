#HealthBuddy chatbot

##Overview

Can be used in 3 modes:
- chat
- poll
- report rumors


##Launch

1. run 'npm install'
2. run 'npm run build' for production mode
3. run 'npm start' for development mode
4. open index.html from 'dist' folder


##Development

**Webview – JS code interaction** 

- `dispatchNative(string message)` is described on backend side. Calls native code from JS. 
- `dispatchWeb(string message)` calls JS code from native.

**Events which are used as parameters in functions mentioned above:**
 
##### `Init:` 
````
// chat
{"eventName": "init", "payload": "base64 string"}  
Payload: {"initPhrase": "chat", "language": "en", "userId": "user123"} 
Example: {"eventName":"init", "payload": "eyJpbml0UGhyYXNlIjoiaGVsbG8gZW4ifQ=="}

// poll 
{"eventName": "init", "payload": "base64 string"}  
Payload: {"initPhrase": "polls", "language": "en", "userId": "user123"} 

// rumours 
{"eventName": "init", "payload": "base64 string"}  
Payload: {"initPhrase": "reportrumors", "language": "en", "userId": "user123"} 
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
Payload: {"status": "error", "description": "Connection lost"}
```` 
