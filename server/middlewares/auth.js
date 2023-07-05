const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/user/signin');
    }
};

module.exports = {isAuthenticated}