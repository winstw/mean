import {Post} from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient} from "@angular/common/http";
import { map} from 'rxjs/operators';

import { Router } from '@angular/router';


@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{postCount: number, posts: Post[]}>();

  constructor(private http: HttpClient, private router: Router) {

  }
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, totalPosts: number}>("http://localhost:3000/api/posts/" + queryParams)
      .pipe(map((postData) => {
        return {
          posts : postData.posts.map((post => {
                return {
                    title: post.title,
                    content: post.content,
                    id : post._id,
                    imagePath: post.imagePath,
                    creator: post.creator
                }
            })
          ),
          totalPosts: postData.totalPosts
      }}))
       .subscribe((transformedPostData) => {
         this.posts = transformedPostData.posts;
         this.postsUpdated.next({postCount: transformedPostData.totalPosts, posts: [...this.posts]});
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }


  addPost(title: string, content: string, image: File) {
    let postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{message: string, post: Post}>("http://localhost:3000/api/posts/", postData) // all postData formatting is handled by HttpClient
      .subscribe((responseData) => {
        this.router.navigate(['/' ]);
      });
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string}>
      ("http://localhost:3000/api/posts/" + id);
  }

  deletePost(postId: string) {
    return this.http.delete("http://localhost:3000/api/posts/" + postId)

  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
      postData.append('id', id);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null};
    }

    this.http.put<{message: string, post: Post}>("http://localhost:3000/api/posts/" + id, postData)
      .subscribe(response => {
        this.router.navigate(['/' ]);
      });
  }
}
