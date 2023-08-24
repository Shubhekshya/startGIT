const  express = require('express')
const connection=require('../connection')///need to look
const router =express.Router();
var auth= require('../services/authentication')
var checkRole= require('../services/checkRole');
            ///here authenticatetoken need to look

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res)=>
{
    let product=req.body;
    var query="insert into product (Pname,categoryid,descriptions,price,stat) values(?,?,?,?,'true')";
    connection.query(query,[product.Pname,product.categoryid,product.descriptions,product.price],(err,results)=>
    {
        if(!err)
        {
            return res.status(200).json({message:"Product added succefully."});
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.patch('/updateStatus',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>
{
    let user= req.body;
    var query="update product set stat=? where id =?";
    connection.query(query,[user.stat,user.id],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404),json({message:"Product not found."});
            }
            return res.status(200).json({message:"Product status updated successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/get',auth.authenticateToken,(req,res,next)=>
{
    //inerjoin
    var query ="select p.id,p.Pname,p.descriptions,p.price,p.stat,c.id as categoryid, c.Item as Item from product as p INNER JOIN category as c where p.categoryid = c.id";
    connection.query(query,(err,results)=> {
        if (!err)
        {
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/getByCategory/:id',auth.authenticateToken,(req,res,next)=>{
    const id=req.params.id;
    var query="select id,Pname from product where categoryid= ? and stat= 'true'";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})
router.get('/getByid/:id',auth.authenticateToken,(req,res,next)=>{
    const id= req.params.id;
    var query="select id,Pname,descriptions,price from product where id =?";
    connecction.query(query,[id],(err,results)=>{
       if(!err){
            return res.status(200).json(results[0]);
         }
        else{
        return res.status(500).json(err);
          }

    })
})

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let product= req.body;
    var query ="update product set Pname =?, categoryid=?,price=? where id=?" ;
    connection.query(query,[product.Pname,product.categoryid,product.descriptions,product.price,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Product id not found."});
            }
            return res.status(200).json({message:"Product updated successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.delete('/delete/:id',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    const id =req.params.id;
    var query="delete from product where id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Product id no found"})
            }
            return res.status(200).json({message:"Product deketed successfully."});
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;