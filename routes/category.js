const express = require('express');
const connection=require('../connection');
const router=express.Router();
var auth=require('../services/authentication');
var checkRole= require('../services/checkRole');

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let category=req.body;
    query="insert category (Item) values(?)";
    connection.query(query,[category.Item],(err,results)=>{
        if(!err){
            return res.status(200).json({message:"Category added successfully."});
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/get',auth.authenticateToken,(req,res,next)=>{
    var query="select *from category order by Item";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let product=req.body;
    var query="update category set Item=? where id =?";
    connection.query(query,[product.Pname,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Category not found."});
            }
            return res.status(200).json({message:"Category updated successfully."});
        }
        else{
            return res.status(500).json(err);
        }
    })
})



module.exports = router;