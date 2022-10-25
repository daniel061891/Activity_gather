module.exports = (req, res, next) => {
    if (req.session.user) {
        req.session.date = Date.now();
        next();
    } else {
        res.redirect("/login");
    }
}