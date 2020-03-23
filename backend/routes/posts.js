const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('../models/post');
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid mime type');
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalName.toLowerCase().split(' ').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + extension);
  }

});

router.post('', multer(storage).single('image'), (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then(result => {
     res.status(201).json({
    message: 'Post added successsfully',
    postId: result._id
  })
  });
  console.log(post);
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found'});
    }
  })
});


router.put("/:id", (req, res, next) => {
  post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  });
  Post.updateOne({_id: req.params.id}, post).then(result => {
    console.log(result);
    res.status(200).json({message: 'Update successful'});
  });
});



router.get('', (req, res, next) => {
  Post.find()
    .then(documents => {
      console.log(documents);
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: documents
      });
    });

})


router.delete("/:id", (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then(result => {
    console.log(result);
      res.status(200).json({message: 'Post deleted!'});
  });
});

module.exports = router;