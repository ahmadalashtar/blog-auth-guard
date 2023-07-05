const express = require('express');
const Article = require('./../models/article');
const router = express.Router();
const {isAuthenticated} = require('./../middlewares/auth')

router.get('/new', isAuthenticated, (req, res) => {
  // no user: A GET request to /articles/new will redirect to /user/login
  res.render('articles/new', { article: new Article() });
});

router.get('/edit/:id', isAuthenticated, async (req, res) => {
  // no user: A GET request to /articles/edit/:id will redirect to /user/login
  const article = await Article.findById(req.params.id);
  res.render('articles/edit', { article: article });
});

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });
  if (article == null) res.redirect('/');
  res.render('articles/show', { article: article });
});

router.post(
  '/',
  async (req, res, next) => {
    // no user: A POST request to `/articles/` will result in 403 status code and **not** create a new article
    if (req.session && req.session.user) {
      req.article = new Article();
      next();
    }
    res.status(403);
    
  },
  saveArticleAndRedirect('new')
);

router.put(
  '/:id',
  async (req, res, next) => {
    // no user: A PUT, DELETE request to `/articles/:id` will result in 403 status code and **not** update or delete any article // done
    // user: A PUT request to `/articles/:id` of another user's article will result in 403 status code and **not** update article
    // user: A PUT request to `/articles/:id` of current user's 
    // article will update the article and redirect the user to the article's slug `/articles/:slug`
    if (req.session && req.session.user) {
      req.article = await Article.findById(req.params.id)
      if(req.article.author.id === req.session.user._id){
        req.article = await Article.findById(req.params.id);
        next();
      }
    }
    res.status(403);
  },
  saveArticleAndRedirect('edit')
);

router.delete('/:id', async (req, res) => {
  // no user: A PUT, DELETE request to `/articles/:id` will result in 403 status code and **not** update or delete any article // done
  // user:A DELETE request to `/articles/:id` of another user's article will result in 403 status code and **not** delete article
  if (req.session && req.session.user) {
    req.article = await Article.findById(req.params.id)
    if(req.article.author.id === req.session.user._id){
      await Article.findByIdAndDelete(req.params.id);
      res.redirect('/');
    }
  }
  return res.status(403);

});

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.snippet = req.body.snippet;
    article.markdown = req.body.markdown;
    try {
      article.author = req.session?.user?._id ?? null;
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (e) {
      console.log(e);
      res.render(`articles/${path}`, { article: article });
    }
  };
}

module.exports = router;
