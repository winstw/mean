import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector : 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
 isLoading = false;
 posts: Post[] = [] ;
 private postsSub: Subscription;
 public totalPosts = 10;
 public postsPerPage = 2;
 public pageSizeOptions = [1, 2, 5, 10];
 private currentPage;
 constructor(public postsService: PostsService) {
 }
 ngOnInit() {
   this.isLoading = true;
  this.postsService.getPosts(this.postsPerPage, 1);
  this.postsSub = this.postsService.getPostUpdateListener()
  .subscribe((postData: {postCount: number, posts: Post[]}) => {
    this.isLoading = false;
    this.posts = postData.posts;
    this.totalPosts = postData.postCount;
  });
}

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId)
      .subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      });

  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

 }


