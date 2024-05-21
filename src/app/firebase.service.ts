//@ts-nocheck
import { Injectable } from '@angular/core';
import { Auth, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendSignInLinkToEmail, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { collection, collectionData, CollectionReference, DocumentReference } from '@angular/fire/firestore';
import { getDocs, doc, deleteDoc, updateDoc, docData, setDoc, addDoc, query } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';

import { getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(public auth:Auth, public fs: Firestore, public router: Router) {
    this.userCollection = collection(this.fs, 'Users');
    this.summaryCollection = collection(this.fs, 'Summaries');

    this.getUsers();
    this.getSummaries();
    this.getSummariesCopy();
    this.user$ = new Observable(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          this.uid = user.uid;
          this.email = user.email;
        } 
        else {
          this.uid = null;
        }
      });
    });      
  }

  uid;
  email = "default value";
  un;
  user$: Observable<any>;

  user: User;
  public users: any[] = [];
  public users$: Observable<User[]>;
  userCollection: CollectionReference<DocumentData>;

  summary: Summary;
  public summaries: any[] = [];
  public summaries$: Observable<Summary[]>;
  summaryCollection: CollectionReference<DocumentData>;

  async getUsers(){
    this.users$ = collectionData(query(this.userCollection), {idField: 'id'}) as Observable<User[]>;
  }
  async getSummaries(){
    this.summaries$ = collectionData(query(this.summaryCollection), {idField: 'id'}) as Observable<Summary[]>;
  }
  async getSummariesCopy(){
    const querySnapshot = await getDocs(this.summaryCollection);
    querySnapshot.forEach((doc) => {
      this.summaries.push(doc.data());
    });
  }
  addUser(u): Promise<DocumentReference>{
    return addDoc(this.userCollection, u);
  }
  addSummary(s): Promise<DocumentReference>{
    return addDoc(this.summaryCollection, s);
  }
  editUser(u:User): Promise<DocumentReference>{
    return updateDoc(doc(this.fs, `Users/${u.id}`), {usernaem: u.username, email: u.email});
  }
  editSummary(s:Summary): Promise<DocumentReference>{
    return updateDoc(doc(this.fs, `Summaries/${s.id}`), {type: s.type, title: s.title, topic: s.topic, date: new Date(), summary: s.summary, chapters: s.chapters});
  }
  addComment(id, comment): Promise<void>{
    return updateDoc(doc(this.fs, `Summaries/${id}`), {comments: comment});
  }
  addRating(id, rating): Promise<void>{
    return updateDoc(doc(this.fs, `Summaries/${id}`), {ratings: rating});
  }
  deleteUser(u:User): Promise<void>{
    return deleteDoc(doc(this.fs, 'Users', u.id));
  }
  deleteSummary(b:Summary): Promise<void>{
    return deleteDoc(doc(this.fs, 'Summaries', b.id));
  }

  const auth = getAuth();

  signup(un, em, ps){
    createUserWithEmailAndPassword(this.auth, em, ps)
    .then(() => {
      this.user = {username: un, email: em, read: [], favorite: []};
      this.addUser(this.user);
      this.router.navigateByUrl('/login');
      alert("signup successful");
    })
    .catch(() => {
      alert("signup failled, could be the email is already used");
    });
  }
  login(em, ps){
    signInWithEmailAndPassword(this.auth, em, ps)
    .then(() => {
      this.router.navigateByUrl('/home');
      alert("success login");
    })
    .catch(() => {
      alert("failled login");
    });
  }
  signout(){
    signOut(this.auth)
    .then(() => {
      this.router.navigateByUrl('/login');
      alert("success signout");
    })
    .catch(() => {
      alert("failled signout");
    });
  }
  
}

export interface Summary {
  id: string,
  type: string,
  title: string,
  topic: string[],
  date: Date,
  summary: string,
  images: string[],
  writer: string,
  chapters: {chapter: number, summary: string, images: string[]}[],
  comments: {comment: string, user: string}[],
  ratings: {rating: number, user: string}[]
}

export interface User {
  id?: string,
  username: string,
  email: string,
  read?: string[],
  favorite?: string[]
}