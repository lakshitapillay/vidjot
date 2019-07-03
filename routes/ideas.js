const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//load helper
const {ensureAuthenticated} = require('../helpers/auth');

//Load Idea model
const Idea = require('../models/Idea')

//Idea Index Page
router.get('/', ensureAuthenticated, (req,res) => {
    Idea.find({user: req.user.id})
        .sort({date:'desc'})
        .then(ideas => {
            res.render('ideas/index',{
                ideas:ideas
            });
        });
    
})

//add idea form
router.get('/add' , ensureAuthenticated, (req,res) => {
    res.render('ideas/add');
})

//edit idea form
router.get('/edit/:id' ,ensureAuthenticated, (req,res) => {
    Idea.findOne({_id: req.params.id })
        .then(idea => {
            if(idea.user !== req.user.id){
                req.flash('error_msg', 'Not Authorised');
                res.redirect('/ideas');
            }
            else{
                res.render('ideas/edit',{
                    idea:idea
                });
            }
        })
        .catch(err => console.log(err));
})


//process form
router.post('/', ensureAuthenticated,(req, res) =>{
    let errors = [];

    if(!req.body.title){
        errors.push({text: 'Title field cannot be empty'});
    }
    if(!req.body.details){
        errors.push({text: 'Details field cannot be empty'});
    }
    
    if(errors.length > 0){
        res.render('ideas/add', {
            errors:errors,
            title:req.body.title,
            details: req.body.details
        });
    }
    else{
        const newUser = {
            title : req.body.title,
            details : req.body.details,
            user: req.user.id
        }
        new Idea(newUser).save()
            .then(idea => {
                req.flash('success_msg', 'Video idea added');
                res.redirect('/ideas');
            })
            
    }
})

//edit form process
router.put('/:id',ensureAuthenticated, (req,res) => {
    const updatedIdea = {
        title: req.body.title,
        details: req.body.details
    }
    Idea.findByIdAndUpdate({_id: req.params.id }, updatedIdea )
        .then(idea => {
            req.flash('success_msg', 'Video idea updated');
            res.redirect('/ideas');
        })
})

//delete idea
router.delete('/:id' , ensureAuthenticated, (req, res) => {
    Idea.remove({_id: req.params.id})
        .then(() => {
            req.flash('error_msg', 'Video idea deleted');
            res.redirect('/ideas');
        });
})

module.exports = router;