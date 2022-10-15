exports.getLogin = (req, res, next) => {
    res.render("login", {showErr: false});
};

exports.postLogin = (req, res, next) => {
    const { email, password} = req.body
    if (email === 'qwe@qwe' && password === 'qwe') {
        res.redirect('/')
        return
    }
    res.render("login", {errMsg: '帳號或密碼錯誤',  showErr: true});
};