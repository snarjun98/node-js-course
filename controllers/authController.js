const passport= require('passport');
const mongooes = require('mongoose')
const User=mongooes.model('User')
const crypto = require('crypto');
const promisify  = require('es6-promisify');
const mail = require('../handlers/mail')
exports.login=passport.authenticate('local',{
    failureRedirect:'/login',
    failureFlash:'Failed Login',
    successRedirect:'/',
    successFlash:'You are Logged in'
})
exports.isLoggedIn=(req,res,next)=>{
    if(req.isAuthenticated()){
        next();
        return
    }
    req.flash('error','Your Must Be Logged In');
    res.redirect('/login')
    
};


exports.logout=(req,res)=>{
    req.logout();
    req.flash('success','Your Now Logged Out');
    res.redirect('/')
}

exports.forgot=async(req,res)=>{
    //see user have exists
    const user = await User.findOne({email:req.body.email});
    if(!user){
        req.flash('error','No account with that Email address');
        return res.redirect('/login');
    }
    //set reset tokon and expaire on there account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires=Date.now() + 3600000;
    await user.save();
    //send email with token
    const resetURL=`http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
    await mail.send({
        user,
        subject: 'Password reset',
        resetURL,
        filename:'password-reset'
    })
    req.flash('success','You have been mailed The reset Password');
    //redirect to login page after token is set
    res.redirect('/login');
}

exports.reset = async (req,res) =>{
    const user= await User.findOne({
        resetPasswordToken:req.params.token,
        resetPasswordExpires:{$gt:Date.now()}
    });
    if(!user){
        req.flash('error',"Password Reset Link is expired or not Valid");
        return res.redirect('/login');
    }
    //show the reset form
    res.render('reset',{title:'Reset Your Password'})
}

exports.confirmedPasswords =(req,res,next)=>{
    if(req.body.password === req.body['password-confirm'])
    {
        next();
        return;
    }
    req.flash('error','Passwords do not match');
    res.redirect('back')
}

exports.update= async(req,res)=>{
    const user= await User.findOne({
        resetPasswordToken:req.params.token,
        resetPasswordExpires:{$gt:Date.now()}
    });
    if(!user){
        req.flash('error',"Password Reset Link is expired or not Valid");
        return res.redirect('/login');
    }
    const setPassword = promisify(user.setPassword,user);
    await setPassword(req.body.password);
    user.resetPasswordExpires=undefined;
    user.resetPasswordToken=undefined;
    const updateUser = await user.save();
    await req.login(updateUser);
    req.flash('success','Your password has been reset');
    res.redirect('/');
}