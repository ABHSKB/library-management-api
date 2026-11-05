const { getAllBooks, checkIsbn, createBook, updateBook, deleteBook, getBookById } = require("../models/bookModel");

async function getAllBooksController(req, res) {
    try{

        const books = await getAllBooks();
        res.status(200).json(books);

    }catch(err){
        console.error("Get all books error:", err);

        res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getBookByIdController(req, res){
    try{

        const id = Number(req.params.id);
        if(!Number.isInteger(id)||id<=0){
            return res.status(400).json({
                message: "Bad request"
            });
        }

        const books = await getBookById(id);
        if(!books){
            return res.status(404).json({
                message: "Not found"
            });
        }

        return res.status(200).json(books);

    }catch(err){
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function createBookController(req, res) {
    try{
        if(
            req.body === null ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ){
            return res.status(400).json({
                message: "Invalid request body"
            });
        }
        const {title, author, isbn, category, total_copies} = req.body;
        
        if(
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof isbn !== "string" || !isbn.trim() ||
            typeof category !== "string" || !category.trim() ||
            !Number.isInteger(total_copies) || total_copies <0
        ){
            return res.status(400).json({
                message:"Invalid input"
            });
        }

        const titleT = title.trim();
        const authorT = author.trim();
        const isbnT = isbn.trim().toUpperCase();
        const categoryT = category.trim();

        const book= await checkIsbn(isbnT);

        if(book){
            return res.status(409).json({
                message: "ISBN already exists"
            });
        }


        const bookData = {
            title:titleT, 
            author: authorT, 
            isbn: isbnT, 
            category: categoryT, 
            total_copies
        };
        const books = await createBook(bookData);

        return res.status(201).json({
            message:"Created",
            id:books
        });

    
    }catch(err){
        if(err.code === "ER_DUP_ENTRY"){
            return res.status(409).json({
                message: "ISBN already exists"
            });
        }
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function updateBookController(req, res) {
    try{
        if(
            req.body === null ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ){
            return res.status(400).json({
                message: "Invalid request body"
            });
        }

        const id = Number(req.params.id);
        if(!Number.isInteger(id)||id<=0){
            return res.status(400).json({
                message: "Bad request"
            });
        }

        const {title, author, isbn, category, total_copies} = req.body;
        
        if(
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof isbn !== "string" || !isbn.trim() ||
            typeof category !== "string" || !category.trim() ||
            !Number.isInteger(total_copies) || total_copies <0
        ){
            return res.status(400).json({
                message:"Invalid input"
            });
        }

        const titleT = title.trim();
        const authorT = author.trim();
        const isbnT = isbn.trim().toUpperCase();
        const categoryT = category.trim();

        const book= await checkIsbn(isbnT);

        if (book && Number(book.id) !== id) {
            return res.status(409).json({
                message: "ISBN already belongs to another book"
            });
        }
        
        const bookData = {
            title: titleT, 
            author: authorT, 
            isbn: isbnT, 
            category: categoryT, 
            total_copies
        };
        const books = await updateBook(id, bookData);

        if(books === "not exist"){
            return res.status(404).json({
                message: "Book not found"
            });
        }else if(books === "less than"){
            return res.status(400).json({
                message: "Total copies cannot be less than active borrowings"
            });
        }

        return res.status(200).json({
            message: "Book updated successfully"
        });
    }catch(err){
        if(err.code === "ER_DUP_ENTRY"){
            return res.status(409).json({
                message: "ISBN already exists"
            });
        }
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function deleteBookController(req, res){
    try{
        const id = Number(req.params.id);
        if(!Number.isInteger(id)||id<=0){
            return res.status(400).json({
                message: "Bad request"
            });
        }  

        const books = await deleteBook(id);
        if(!books){
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json({
            message: "Deleted"
        });

    }catch(err){
        if(err.code === "ER_ROW_IS_REFERENCED_2"){
            return res.status(409).json({
                message: "Cannot delete a book referenced by borrowing records"
            }); 
        }
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    getAllBooksController,
    getBookByIdController,
    createBookController,
    updateBookController,
    deleteBookController
};