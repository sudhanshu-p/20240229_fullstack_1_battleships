import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
// import { HttpClientModule } from '@angular/common/http';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regiter',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './regiter.component.html',
  styleUrl: './regiter.component.css',
})
export class RegiterComponent {
  signupForm: FormGroup;
  username: string = '';
  password: string = '';
  email: string = '';
  /**
   * Constructor
   *
   * Initializes the signup form with validators for username, email, and password fields.
   * @param formBuilder FormBuilder instance for creating the form group
   */
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          (control: { value: any }) => {
            const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/; // Start with letter, followed by letters or numbers
            const valid = usernameRegex.test(control.value); // Check if username follows the pattern
            if (control.value.length > 0 && control.value.startsWith('_')) {
              return { invalidUsername: true }; // Return error if the username starts with an underscore
            }
            return valid ? null : { invalidUsername: true }; // Return error if the username is not valid
          },
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(200),
          (control: { value: any }) => {
            const passwordRegex =
              /^(?=.*[A-Z])(?=.*[!@#$%^&()])(?=.*[0-9])(?!.*\s)(?!.*(\d)\1)/;
            return passwordRegex.test(control.value)
              ? null
              : { invalidPassword: true };
          },
        ],
      ],
    });
  }

  /**
   * onSubmit
   *
   * Handles form submission.
   * Logs success message if the form is valid, otherwise logs error message.
   */
  // onSubmit() {
  //   if (this.signupForm.valid) {
  //     console.log('Form submitted successfully!');
  //     // Fetch call to your API
  //     fetch('http://localhost:3000/auth/signup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         username: this.username,
  //         password: this.password,
  //         email: this.email
  //       })
  //     })
  //       .then(response => {
  //         console.log(response)
  //         // if (!response.ok) {
  //         //   throw new Error('Network response was not ok');
  //         // }
  //         // return response.json();
  //       })
  //       .then(data => {
  //         console.log('Login successful:', data);
  //         // Handle successful login response
  //       })
  //       .catch(error => {
  //         console.error('Login failed: ', error);
  //         // Handle login error
  //       });
  //   } else {
  //     console.log('Form is invalid. Please fix the errors.');
  //   }
  // }
  onSubmit() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
    };
    this.http.post('http://localhost:3000/auth/signup', userData).subscribe({
      next: (response) => {
        // Handle the response if needed
        console.log('Signup successful', response);
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        // Handle any errors here
        console.error('Signup failed', error);
      },
    });
  }

  /**
   * showAlert
   *
   * Displays an alert if the form is invalid.
   */
  showAlert() {
    if (this.signupForm.invalid) {
      alert('Please fill all the fields correctly.');
    }
  }
}
