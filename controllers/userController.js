const mongooes = require('mongoose')
const User=mongooes.model('User')
const promisify=require('es6-promisify')
exports.loginForm=(req,res)=>{
    res.render('login',{title:'Login'})
}

exports.registerForm=(req,res)=>{
    res.render('register',{title:'Register'})
}

exports.validateRegister=(req,res,next)=>{
    req.sanitizeBody('name');
    req.checkBody('name','You must supply name').notEmpty();
    req.checkBody('email','That email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots:false,
        remove_extensions:false,
        gmail_remove_subaddress:false
    });
    req.checkBody('password','Password cannot be empty').notEmpty();
    req.checkBody('password-confirm','Confirm Password cannot be empty').notEmpty();
    req.checkBody('password-confirm','Your Passwords Do not match ').equals(req.body.password);
    const errors= req.validationErrors();
    if(errors){
        req.flash('error',errors.map(err=>err.msg));
        res.render('register',{titile:'Register',body:req.body,flashes:req.flash()})
        return
    }
    next();

}
exports.register=async(req,res,next)=>{
    const user= new User({email:req.body.email,name:req.body.name});
    const register = promisify(User.register,User);
    await register(user,req.body.password);
    next();
}

exports.account=(req,res)=>{
    res.render('account',{title:'Edit Your Account'});
}

exports.updateAccount=async(req,res)=>{
    const updates={
        name:req.body.name,
        email:req.body.email
    }
    const user = await User.findOneAndUpdate(
        {_id:req.user._id},
        {$set:updates},
        {new:true,
        runValidators:true,
    context:'query'}
    );
    req.flash('success','Updated the Profile!'); 
    res.redirect('back');
}