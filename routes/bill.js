const express = require('express');
const connection = require('../connection');
const router = express.Router();
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res) => {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
    var query = "insert into bill (Bname,uuid,email,contactNumber,total,productDetails,createdBy) values(?,?,?,?,?,?,?)"
    connection.query(query, [orderDetails.Bname, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.total, orderDetails.productDetails, res.locals.email], (err, results) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.Bname, email: orderDetails.email, contactNumber: orderDetails.contactNumber, total: orderDetails.total }, (err, results) => {
                if (err) {
                    return res.status(500), json(err);
                }
                else {
                    pdf.create(results).toFile('./generated_pdf/' + generatedUuid + ".pdf", function (err, data) {
                        if (err) {
                            console.log(err);
                            return res.status(500).json(err);
                        }
                        else {
                            return res.status(200).json({ uuid: generatedUuid });
                        }
                    })
                }
            })
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.post('getpdf', auth.authenticateToken, function (req, res) {
    const orderDetails = req.body;
    const pdfpath = "./generate_pdf" + orderDetails.uuid + '.pdf';
    if(fs.existsSync(pdfpath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfpath).pipe(res);
    }
    else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.Bname, email: orderDetails.email, contactNumber: orderDetails.contactNumber, totalAmount: orderDetails.totalAmount }, (err, results) => {
            if (err) {
                return res.status(500), json(err);
            }
            else {
                pdf.create(results).toFile('./generated_pdf/' + generatedUuid + ".pdf", function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json(err);
                    }
                    else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfpath).pipe(res);
                    }

                })
            }
        })
    }
})
router.get('/getBills', auth.authenticateToken, (req, res, next) => {
    var query = 'select *from bill by id desc';
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }

    })
})

router.delete('/delete/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    var query = "delete from bill where id=? ";
    coonnection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Bill id not found." });
            }
            return res.status(500).json({ message: "Bill Deleted successfully" });
        }
        else {
            return res.status(200).json(err);
        }
    })
})

module.exports= router;