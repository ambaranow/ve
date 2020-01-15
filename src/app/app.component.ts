import { Component, OnInit } from '@angular/core';

import { BackgroundTask, BackgroundTaskJob } from './background-tasks/models';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Angular web workers demo';
  tasks: BackgroundTask[] = [];

  form: FormGroup;
  fileUploaded = false;
  // file;

  private afterFilePicked: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {
  }

  ngOnInit() {
    this.generateForm();
    console.log(this.form)
    // this.generateTasks(5);
  }

  generateForm() {
    this.form = new FormGroup({
      fileCtrl: new FormControl('')
    });
  }

  onFilePicked($event) {
    // console.log('onFilePicked')
    // console.log($event)
    this.fileUploaded = true;
    // this.file = $event;
    this.afterFilePicked.next($event);
  }
  // private generateTasks(taskCount: number) {
  //   for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
  //     const id = `TASK-${taskIndex}`;
  //     this.tasks.push({
  //       id,
  //       jobs: this.generateJobs(id, 1 + Math.floor(Math.random() * 16)),
  //     });
  //   }
  // }

  // private generateJobs(taskId: string, count: number): BackgroundTaskJob[] {
  //   const jobs: BackgroundTaskJob[] = [];
  //   for (let job = 0; job < count; job++) {
  //     jobs.push({
  //       id: `${taskId}-${job}`,
  //       name: `job-${job}-forTask-${taskId}`,
  //     });
  //   }
  //   return jobs;
  // }
}
