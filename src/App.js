import React from 'react';
import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'
require('dotenv').config()

const firebasejson = {
  "apiKey": process.env.REACT_APP_FIREBASE_API_KEY,
  "authDomain": process.env.REACT_APP_AUTH_DOMAIN,
  "projectId": process.env.REACT_APP_PROJECT_ID,
  "storageBucket": process.env.REACT_APP_STORAGE_BUCKET,
  "messagingSenderId": process.env.REACT_APP_SENDER_ID,
  "appId": process.env.REACT_APP_APP_ID,
}

firebase.initializeApp(
  firebasejson
)

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
  const [user] = useAuthState(auth);
  document.title = 'Super Chat'
  return (
    <div className="App">
      <header>
        {user ? <SignOut /> : <></>}
      </header>
      <section className="App-header">
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <Button variant="contained" color="primary" onClick={signInWithGoogle}>Sign in with Google</Button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <Button variant="contained" color="primary" type="button" onClick={() => auth.signOut()}>Sign Out</Button>
  )
}

function ChatRoom() {
  const dummy = React.useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(1000);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = React.useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL, displayName} = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });
    setFormValue('');
    dummy.current.scrollIntoView({behaviour: 'smooth'})
  };
  return (
    <>
      <div>
        <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        <div ref={dummy}></div>
        </main>
        <form onSubmit={sendMessage}>
          <input value={formValue} placeholder='Begin a conversation' onChange={(e) => setFormValue(e.target.value)}/>
          <Button variant="contained" color="primary" type="submit">Send</Button>
        </form>
      </div>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL, displayName, createdAt} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  console.log()
  return (
    <div className={`message ${messageClass}`}>
      
      <div className="profileClass">
        <Tooltip title={
          new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'})
        .format(createdAt ? new Date(createdAt.seconds*1000) : '')}>
          <div>
            <img src = {photoURL || 'https://api.adorable.io/avatars/285/10@adorable.io.png'} alt={displayName}></img>
            <span className='displayNameClass'>{displayName}</span>
          </div>
        </Tooltip>
      </div>
      <div><p>{text}</p></div>
      
    </div>
  )
}

export default App;
