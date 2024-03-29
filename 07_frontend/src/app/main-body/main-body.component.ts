import { Component } from '@angular/core';
import { SigninComponent } from '../auth/signin/signin.component';

@Component({
  selector: 'app-main-body',
  standalone: true,
  imports: [SigninComponent],
  templateUrl: './main-body.component.html',
  styleUrl: './main-body.component.css',
})
export class MainBodyComponent {}
