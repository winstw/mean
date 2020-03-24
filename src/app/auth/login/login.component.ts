import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;

  constructor(private auth: AuthService) { }

  onLogin(form: NgForm) {
    if (form.invalid) {return;}
    this.isLoading = true;
    this.auth.login(form.value.email, form.value.password);
  }
  ngOnInit(): void {

  }


}
