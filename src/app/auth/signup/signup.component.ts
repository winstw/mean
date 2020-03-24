import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  isLoading = false;

  constructor(private auth: AuthService) {}

  onSignup(form: NgForm) {
    if (form.invalid) {return;}
    this.isLoading = true;
    this.auth.createUser(form.value.email, form.value.password);

  }
  ngOnInit(): void {

  }


}
