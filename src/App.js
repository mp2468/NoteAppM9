import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
 Button,
 Flex,
 Heading,
 Text,
 TextField,
 View,
 withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
 createNote as createNoteMutation,
 deleteNote as deleteNoteMutation,
 updateNote as updateNoteMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
 const [notes, setNotes] = useState([]);

 useEffect(() => {
   fetchNotes();
 }, []);

 async function fetchNotes() {
   const apiData = await API.graphql({ query: listNotes });
   const notesFromAPI = apiData.data.listNotes.items;
   setNotes(notesFromAPI);
 }

 async function createNote(event) {
   event.preventDefault();
   const form = new FormData(event.target);
   const data = {
     name: form.get("name"),
     description: form.get("description"),
   };
   await API.graphql({
     query: createNoteMutation,
     variables: { input: data },
   });
   fetchNotes();
   event.target.reset();
 }

 async function editNote(id, name, description) {
   const noteData = {
     id,
     name: name || notes.find((note) => note.id === id).name,
     description: description || notes.find((note) => note.id === id).description,
   };
   await API.graphql({
     query: updateNoteMutation,
     variables: { input: noteData },
   });
   fetchNotes();
 }

 async function deleteNote({ id }) {
   const newNotes = notes.filter((note) => note.id !== id);
   setNotes(newNotes);
   await API.graphql({
     query: deleteNoteMutation,
     variables: { input: { id } },
   });
 }

 return (
   <>
   <h1 className="notes-app"> Test App</h1>
   <View className="App">
     <View as="form" margin="3rem 0" onSubmit={createNote}>
       <div className="form-div">
         <div className="input-div">
         <p className="title">Title: </p>
         <input
           name="name"
           label="Note Name"
           labelHidden
           variation="quiet"
           required
         />
         </div>
         <div className="input-div">
         <p className="description">Description: </p>
         <textarea
           name="description"
           label="Note Description"
           labelHidden
           variation="quiet"
           className="input-description"
           required
         />
         </div>
         <Button type="submit" variation="primary">
           Create Note
         </Button>
       </div>
     </View>
     <>
       <div class="notes-div">
       <h1>Current Notes</h1>
         <View className="note-container">
           {notes.map((note) => (
             <div className="note" key={note.id || note.name}>
               <p fontWeight={700} className="note-title">
                 Title: {note.name}
               </p>
               <p className="note-description">
                 {note.description}
               </p>
               <p className="note-timestamp">
                 {new Date(note.createdAt).toLocaleString()}
               </p>
               <Button
                 id="edit-button"
                 className="edit-button"
                 variation="link"
                 onClick={() => {
                   const newName = prompt("Edit note name:", note.name);
                   const newDescription = prompt("Edit note description:", note.description);
                   if (newName || newDescription) {
                     editNote(note.id, newName, newDescription);
                   }
                 }}
               >
                 Edit note
               </Button>
               <Button
                 id="delete-button"
                 className="delete-button"
                 variation="link"
                 onClick={() => deleteNote(note)}>
                 Delete note
               </Button>
             </div>
           ))}
         </View>
       </div>
     </>
     <Button id="sign-out"onClick={signOut}>Sign Out</Button>
   </View>
   </>
 );
};

export default withAuthenticator(App);
