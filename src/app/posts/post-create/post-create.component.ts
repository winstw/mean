import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  isLoading = false;

  form: FormGroup;
  private mode = 'create';
  private postId: string;
  post: Post;
  imagePreview: string;

  constructor(public postsService: PostsService, public route: ActivatedRoute){}

  onSavePost(){
    if (this.form.invalid) {return};
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content);
    } else {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content);
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    console.log('in onImagePicked');
    const file = (event.target as HTMLInputElement).files[0]; // doit caster event target pour que TS connaisse l'attribut files
    this.form.patchValue({'image': file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {this.imagePreview = reader.result as string;}
    reader.readAsDataURL(file);

  }

  ngOnInit() {
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(3)
        ]
      }),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
      'content': new FormControl(null, {
        validators: [
          Validators.required
        ]
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {id: postData._id, title: postData.title, content: postData.content};
          this.form.setValue({
            'title': this.post.title,
            'content': this.post.content
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

}
