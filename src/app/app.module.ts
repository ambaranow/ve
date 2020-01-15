import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatButtonModule, MatProgressBarModule, MatIconModule, MatCardModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiTaskComponent } from './background-tasks/components/ui-task/ui-task.component';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FfmpegModule } from './ffmpeg/ffmpeg.module';

@NgModule({
  declarations: [
    AppComponent,
    UiTaskComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FfmpegModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatCardModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
