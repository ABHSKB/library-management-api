const {createBorrow, borrowedBookById, memberBorrowingHistory, allBorrowingHistory, returnBorrowing } = require("../models/borrowingModel");

async function  borrowings(req, res) {
    try{
        if (
            req.body === null ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                message: "Invalid request body"
            });
        }
        const bookId = req.body.id;
        const id = req.user.id;

        if(!Number.isInteger(bookId) || bookId <= 0){
            return res.status(400).json({message: "Bad request"});
        }

        const result = await createBorrow(id, bookId);

        return res.status(201).json({
            message: "borrowed",
            borrowedId: result.borrowed
        });

    }catch(err){
        if(err.message === "LIBRARY_SETTINGS_NOT_FOUND"){
            return res.status(404).json({message: "Not found"});
        
        }else if(err.message === "BOOK_NOT_FOUND"){
            return res.status(404).json({message: "Book not found"});

        }else if(err.message === "BOOK_UNAVAILABLE"){
            return res.status(409).json({message: "Unavailable book"});
            
        }else if (err.message === "MAX_ACTIVE_BORROWINGS") {
            return res.status(409).json({
                message: "Maximum active borrowing limit reached"
            });
        }else if (err.message === "USER_NOT_FOUND") {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }else if (err.code === "ACTIVE_BORROWING_EXISTS") {
            return res.status(409).json({
                message: "You have already borrowed this book"
            });
        }else {
            console.error("Borrowing error:", err);
            return res.status(500).json({message: "Internal server error"});

        }
    }
}

async function getBorrowingById(req, res) {
    try{
        const borrowingId = Number(req.params.id);
        if(!Number.isInteger(borrowingId) || borrowingId <= 0){
            return res.status(400).json({message: "Bad request"});
        }

        const record = await borrowedBookById(borrowingId);

        if(record === null){
            return res.status(404).json({message: "Not found"});

        }
        
        if(Number(req.user.id) === Number(record.user_id) || req.user.role === "librarian" || req.user.role === "admin"){

            return res.status(200).json(record);

        }

        return res.status(403).json({
            message: "Forbidden"
        });

    }catch(err){
        console.error("Get borrowing by ID error:", err);
        return res.status(500).json({message: "Internal server error"});

    }  
}

async function borrowingHistory(req, res) {
    try{
        const id  = req.user.id;

        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).json({message: "Bad request"});
        }

        const record = await memberBorrowingHistory(id);

        return res.status(200).json(record);


    }catch(err){
        console.error("Get all borrowing history error:", err);
        return res.status(500).json({message: "Internal server error"});
        
    }
    
}

async function allBorrowingHistoryController(req, res) {
    try{
        const record = await allBorrowingHistory();
        return res.status(200).json(record);

    }catch(err){
        console.error("Return book error:", err);
        return res.status(500).json({message: "Internal server error"});
        
    }
    
}

async function returnBook(req, res) {
    try{
        const id  = Number(req.params.id);

        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).json({message: "Bad request"});
        }

        const records = await borrowedBookById(id);

        if(records === null){
            return res.status(404).json({
                message: "Not found"
            });
        }

        if(Number(req.user.id) === Number(records.user_id) || req.user.role === "librarian" || req.user.role === "admin"){
            await returnBorrowing(id);

            return res.status(200).json({message: "returned"});

        }

        return res.status(403).json({
            message: "Forbidden"
        });


    }catch(err){
        if(err.message === "NOT_FOUND"){
            return res.status(404).json({message: "Borrowing record not found"});

        }else if (err.message === "BOOK_NOT_FOUND") {
            return res.status(404).json({
                message: "Book not found"
            });
        }else if(err.message === "ALREADY_RETURNED"){
            return res.status(409).json({message: "ALREADY RETURNED book"});
            
        }else{
            console.error("Get borrowing by ID error:", err);
            return res.status(500).json({message: "Internal server error"});

        }
    }
    
}

module.exports =  {
    borrowings,
    getBorrowingById,
    borrowingHistory,
    allBorrowingHistoryController,
    returnBook
};