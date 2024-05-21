//@ts-nocheck
import { Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { FirebaseService, Summary } from '../firebase.service';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Router , NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('upload') files: ElementRef;
  summaries: Summary[] = []; 
  filteredSummaries: Summary[] = [];
  searchTerm: string = '';
  filterOption: string = 'all';

  //@ViewChild('upload') files: ElementRef;

  constructor(public fb: FirebaseService, public modal: ModalController, public storage: Storage, public router: Router) { }
  navigateToDetails(summary: Summary) {
    const navigationExtras: NavigationExtras = {
      state: {
        summary: summary
      }
    };
    this.router.navigate(['/detail'], navigationExtras);
  }
  ngOnInit() {
    this.fb.summaries$.subscribe(summaries => {
      this.summaries = summaries; 
      this.filterItems(); 
    });
  }

  navigateToDetails(summary: Summary) {
    const navigationExtras: NavigationExtras = {
      state: {
        summary: summary
      }
    };
    this.router.navigate(['/details'], navigationExtras);
  }

  filterItems() {
    this.filteredSummaries = this.summaries.filter(summary => {
      
      if (this.filterOption !== 'all' && summary.type !== this.filterOption) {
        return false;
      }
    
      if (this.searchTerm && this.searchTerm.trim() !== '') {
        const searchTermLC = this.searchTerm.toLowerCase();
        if (
          !summary.title.toLowerCase().includes(searchTermLC) &&
          !summary.topic.toLowerCase().includes(searchTermLC)
        ) {
          return false;
        }
      }
      return true;
    });
  }
  
  summary: Summary = {writer: this.fb.email};
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.summary, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
     // this.uploadFile(this.files.nativeElement);
      this.fb.addSummary(this.summary);
      this.summary = {writer: this.fb.email};
    }
  }

  showBook = false;
  type(){
    if(this.summary.type == 'book'){
      this.showBook = true;
      this.summary.chapters = [{chapter: null, summary: ""}, ];
    }
    else
      this.showBook = false;
  }

  addChapter(){
    this.summary.chapters.push({chapter: null, summary: ""});
    this.remove = false;
  }
  remove = true;
  removeChapter(i){
    this.summary.chapters.splice(i,1);
    if(this.summary.chapters.length == 1)
      this.remove = true;
  }
  
  uploadFile(input: HTMLInputElement) {
    if (!input.files) return
    const files: FileList = input.files;
    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
            const path:string = this.fb.email+"/"+this.summary.title+"/"+file.name;
            const url: string = "https://firebasestorage.googleapis.com/v0/b/project-f1277.appspot.com/o/"+path+"?alt=media";
            const storageRef = ref(this.storage, path);
            uploadBytesResumable(storageRef, file);   
            if(this.summary.images)   
              this.summary.images.push(url);  
            else
            this.summary.images = [url];
        }
    }
  }
  
    }
  