// import model / collection from db.js

const db = require('./db')

// import jsonwebtoken

const jwt = require('jsonwebtoken')

// defining logic to resolve register request
const register = (acno, username, password) => {
    console.log("inside register logic");
    //  1. check acno is existing in user collection of bank database
    //  Asynchronous function call- promise()

    return db.User.findOne({
        acno
    }).then((result) => {
        console.log(result);
        // 2.1 if acno is existing, send response as "user already exist"to client
        if (result) {
            return {
                statusCode: 401,
                message: "User Already Exist"
            }
        }
        //  2.1 if acno is not existing, create acno in bank database with details as its uname and pswd and  
        //  send respose as "register successfull" to client

        else {
            const newUser = new db.User({
                acno,
                username,
                password,
                balance: 1000,
                transactions: []
            })
            // to store data in mongodb
            newUser.save()
            // send response to index.js
            return {
                statusCode: 200,
                message: "Register Successfully"
            }

        }
    })



}


// defining logic to resolve login request

const login = (acno, pswd) => {
    //  to check acno and pswd is available in db
    return db.User.findOne({
        acno,
        password: pswd
    }).then((result) => {
        // user exist
        if (result) {
            //   generate token
            const token = jwt.sign({
                loginAcno: acno
            }, "supersecretkey123")
            return {
                statusCode: 200,
                message: "Register Successfully",
                // sending logined username to client
                currentUsername: result.username,
                // sending logined username to client
                currentAcno: acno,
                // sending token to front end
                token


            }
        }
        else {
            return {
                statusCode: 404,
                message: "Invalid User details!!!"
            }
        }
    })
}

// to get balance

const getBalance = (acno) => {
    // check acno is available user collection
    return db.User.findOne({
        acno
    }).then(
        (result) => {
            if (result) {
                // acno is present
                // send balance to front end
                return {
                    statusCode: 200,
                    balance: result.balance
                }

            }
            else {
                // send balance to front end
                return {
                    statusCode: 401,
                    message: "Invalid Account Number"
                }
            }
        }
    )
}

// fund transfer
const fundTransfer = (fromAcno, pswd, toAcno, amt) => {
    let amount = parseInt(amt)

    return db.User.findOne({
        acno: fromAcno,
        password: pswd
    }).then(
        (result) => {
            // denied operation for self account transfer
            if (fromAcno == toAcno) {
                return {
                    statusCode: 404,
                    message: "Permission Denied"
                }
            }
            if (result) {
                // from acno verified
                return db.User.findOne({
                    acno: toAcno
                }).then(
                    (data) => {
                        if (data) {
                            // toacno verified
                            if (result.balance >= amount) {
                                // sufficient balance
                                // debit amount fromacno
                                result.balance -= amount
                                result.transactions.push
                                    ({
                                        type: 'DEBIT',
                                        fromAcno,
                                        toAcno,
                                        amount
                                    })
                                result.save()
                                // credit amount toacno
                                data.balance += amount
                                data.transactions.push
                                    ({
                                        type: 'CREDIT',
                                        fromAcno,
                                        toAcno,
                                        amount
                                    })
                                data.save()

                                return {
                                    statusCode: 200,
                                    message: "fund transfer successfully"
                                }

                            }
                            else {
                                return {
                                    statusCode: 404,
                                    message: "Insuffienct balance"
                                }
                            }


                        }
                        else {
                            return {
                                statusCode: 404,
                                message: "Invalid credit credentials"
                            }

                        }
                    }
                )
            }
            else {
                return {
                    statusCode: 404,
                    message: "Invalid debit credential"
                }
            }
        })
}


//get transaction history
const transactionHistory = (acno)=>{
        return db.User.findOne({
            acno
        }).then((result)=>{
            if(result){
                //  acno is present in db - result is entire detail of acno
                return{
                    statusCode: 200,
                    transactions:result.transactions

                }
            }
            else{
                // acno is not present in db
                return {
                    statusCode: 404,
                    message: "Invalid  Account Number"
                }
            }
        })
}


// logic to delete an account from db

const deleteAcno = (acno)=>{
    // delete acno from db
   return db.User.deleteOne({
        acno
    }).then(
        (result)=>{
            if(result){
                // acno removed successfully
                return{
                    statusCode:200,
                    message:'Account successfully deleted'
                }
            }
            else{
                return {
                    statusCode: 404,
                    message: "Invalid debit credential"
                }
            }
        }
    )
}
// export

module.exports = {
    register,
    login,
    getBalance,
    fundTransfer,
    transactionHistory,
    deleteAcno
}

