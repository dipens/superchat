import React from 'react';
import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth';
import firebasejson from './firebase.json'

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'

firebase.initializeApp(
  firebasejson
)

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        {user ? <ChatRoom /> : <SignIn />}
      </header>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser & (
    <button onClick={() => auth.SignOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});
  return (
    <>
    <div><SignOut/></div>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
      </div>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid} = props.message;
  return (
    <>
      <p>{text}</p>
      <div>{uid}</div>
    </>
  )
}

export default App;
