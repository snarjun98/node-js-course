const mongooes=require('mongoose')
const Review = mongooes.model('Review')
const Store=mongooes.model('Store')
const User=mongooes.model('User')

exports.addReview=async(req,res)=>{
    req.body.author=req.user._id
    req.body.store=req.params.id
    const newReview = new Review(req.body);
    await newReview.save();
    req.flash('success','Revivew Saved!')
    res.redirect('back');
}