const mongooes=require('mongoose')
const Store=mongooes.model('Store')
const User=mongooes.model('User')
const multer = require('multer')
const jimp = require('jimp');
const uuid = require('uuid')

const multerOptions={
    storage: multer.memoryStorage(),
    fileFilter(req,file,next){
        const isPhoto =file.mimetype.startsWith('image/')
        if(isPhoto){
            next(null,true)
        }else{
            next({message:'That filetype isn\'t allowed'},false)
        }
    }
}

exports.upload=multer(multerOptions).single('photo');
exports.resize=async (req,res,next)=>{
    //check if there is new file to resize
    if(!req.file){
        next();//skip to next middleware
        return
    }
    const extension=req.file.mimetype.split('/')[1];
    req.body.photo =`${uuid.v4()}.${extension}`;
    //now we resize 
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800,jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    //once we written photo to file system,keep going
    next(); 
}

exports.homepage =(req,res) =>{
    res.render('index',{title:'DT'})
}

exports.addStore=(req,res)=>{
    res.render('editStore',{title:'addStore'})
}

exports.createStore=async(req,res)=>{
    req.body.author=req.user._id;
    const store = await (new Store(req.body)).save();
    req.flash('success',`Successfully created ${store.name} . Care to review?`);
    res.redirect(`/stores/${store.slug}`);
}
exports.getStore=async(req,res)=>{
    const page=req.params.page || 1;
    const limit= 9;
    const skip=(page * limit)- limit;

    //Query the db for a list of all stores
    const storesPromise=Store
    .find()
    .skip(skip)
    .limit(limit)
    .sort({created:'desc'})
    const countPromise=Store.count();
    const [stores,count]= await Promise.all([storesPromise,countPromise])
    const pages = Math.ceil(count/limit);
    if(!stores.length && skip){
        req.flash('info',"that page in not vaild ")
        res.refirect(`/stores/page/${pages}`)
    }
    res.render('stores',{title:'Stores',stores,page,pages,count})
}
const confirmOwner=(store,user)=>{
    if(!store.author.equals(user.id)){
        throw Error('You must be a store owner to edit it')
    }
}
exports.editStore=async(req,res)=>{
    //find the store id
    const store = await Store.findOne({_id:req.params.id})
    //confirm they are store owner
    confirmOwner(store,req.user)

    //render edit form
    res.render('editStore',{title:`Edit ${store.name}`,store})
}
exports.updateStore=async(req,res)=>{
    //set loc type to point
    req.body.location.type='Point';
    //find and update store
    const store=await Store.findOneAndUpdate({_id:req.params.id},req.body,{
        new:true,//return the new store instead of the old one
        runValidators:true
    }).exec();
    req.flash('success',`Successfully updated <strong>${store.name}</store>,<a href="/stores/${store.slug}">View Store -> </a>`)
    //redirect to store tell them it worked
    res.redirect('/');
}

exports.getStoreBySlug=async(req,res,next)=>{
    const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
    if(!store){
        return next();
    }
    res.render('store',{store,title:store.name})
}

exports.getTags = async (req,res)=>{
    const tag=req.params.tag;
    const tagQuery=tag || {$exists:true}
    const tagsPromis = Store.getTagsList();
    const storesPromis=Store.find({tag:tagQuery})
    const [tags,stores]=await Promise.all([tagsPromis,storesPromis])
    res.render('tag',{tags,title:'Tags',tag,stores});
}
exports.searchStores=async(req,res)=>{
    const stores = await Store.find({
        $text:{
            $search:req.query.q
        }
    },{
        score:{
            $meta:'textScore'
        }
    }).sort({
        score:
        {$meta:'textScore'}
    }).limit(5);
    res.json(stores);
}

exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: 10000 // 10km
        }
      }
    };
  
    const stores = await Store.find(q).select('slug name description location photo').limit(10);
    res.json(stores);
  };

exports.mapPage=(req,res)=>{
    res.render('map',{title:'Map'});
}
exports.heartStore=async(req,res)=>{
    const hearts= req.user.hearts.map(obj=>obj.toString());
    const operator=hearts.includes(req.params.id) ? '$pull' :'$addToSet';
    const user=await User.findByIdAndUpdate(
        req.user._id,
        {[operator]:{hearts:req.params.id}},
        {new:true}
        )
    res.json(user)
}
exports.getHearts = async (req,res)=>{
    const stores = await Store.find({
        _id:{$in:req.user.hearts}
    });
    res.render('stores',{title:'Liked Stores',stores})
};

exports.getTopStores = async (req, res) => {
    const stores = await Store.getTopStores();
   res.render('topStores', { stores, title:'??? Top Stores!'});
  }