const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminModel } = require('../model/admin.model');
const { adminMiddleware } = require('../middlewares/admin.middlewares');
const { courseModel } = require('../model/courses.model');
const {z} = require("zod")

const adminRouter = Router();

















// Admin Signup
adminRouter.post('/signup', async (req, res) => {

    const { email, password, firstName, lastName } = req.body;
    
    const validatorSchema = z.object({
        email:z.string().min(3).max(50).email(),
        password:z.string().min(3).max(12),
        firstName:z.string().min(2).max(20),
        lastName:z.string()
    })

    const validatorSchemaSafeParse = validatorSchema.safeParse(req.body) 

    if(!validatorSchemaSafeParse.success){
        return res.status(400).json({
            message: "Validation failed. Please ensure all fields meet the required criteria.",
            error: validatorSchemaSafeParse.error
        });
    }

    try {
        

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await adminModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        return res.status(201).json({
            message: "Admin account created successfully.",
            admin
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error occurred during admin signup.",
            error: error.message
        });
    }
});

// Admin Login
adminRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const validatorSchema = z.object({
        email:z.string().min(3).max(50).email(),
        password:z.string().min(3).max(20)
    })

    const validatorSchemaSafeParse = validatorSchema.safeParse(req.body)

    if(!validatorSchemaSafeParse.success){
        return res.status(400).json({
            message:"Validation failed. Please ensure all fields meet the required criteria.",
            error:validatorSchemaSafeParse.error
        })
    }
    try {
                  
        const adminUser = await adminModel.findOne({ email });

        if (!adminUser) {
            return res.status(404).json({
                message: "Admin not found."
            });
        }

        const verifiedPassword = await bcrypt.compare(password, adminUser.password);

        if (!verifiedPassword) {
            return res.status(401).json({
                message: "Invalid credentials. Please try again."
            });
        }

        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET_ADMIN, { expiresIn: '1h' });
        // set cookies
        res.cookie('adminToken',token,{httpOnly:true,maxAge:60*60*1000})
        return res.status(200).json({
            message: "Login successful.",
            adminUser,
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error occurred during login.",
            error: error.message
        });
    }
});

// Create Course
adminRouter.post('/courses', adminMiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;
        if (!adminId) {
            return res.status(404).json({
                message: 'Admin ID not found.'
            });
        }

        const { title, description, price, imageUrl } = req.body;

         const validatorSchema = z.object({
            title:z.string().min(5).max(100),
            description:z.string().min(10).max(1000),
            price:z.number().positive().finite().safe(),
            imageUrl:z.string()
         })

         const validatorSchemaSafeParse = validatorSchema.safeParse(req.body)

         if(!validatorSchemaSafeParse.success){
            return res.status(400).json({
                message:"Validation failed. Please ensure all fields meet the required criteria.",
                error:validatorSchemaSafeParse.error
            })
         }

        const course = await courseModel.create({
            title,
            description,
            price,
            imageUrl,
            creatorId: adminId
        });

        return res.status(201).json({
            message: "Course created successfully.",
            course
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error occurred while creating the course.",
            error: error.message
        });
    }
});

// Update Course
adminRouter.put('/courses/:courseId', adminMiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;
        const { courseId } = req.params;

        if (!adminId) {
            return res.status(404).json({
                message: "Admin ID not found."
            });
        }

        const { title, description, price, imageUrl } = req.body;

        const validatorSchema = z.object({
            title:z.string().min(5).max(100),
            description:z.string().min(10).max(1000),
            price:z.number().positive().finite().safe(),
            imageUrl:z.string()
         })

         const validatorSchemaSafeParse = validatorSchema.safeParse(req.body)

         if(!validatorSchemaSafeParse.success){
            return res.status(400).json({
                message:"Validation failed. Please ensure all fields meet the required criteria.",
                error:validatorSchemaSafeParse.error
            })
         }
        const updatedCourse = await courseModel.findByIdAndUpdate(courseId, {
            title,
            description,
            price,
            imageUrl
        }, { new: true });

        if (!updatedCourse) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        return res.status(200).json({
            message: "Course updated successfully.",
            course: updatedCourse
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error occurred while updating the course.",
            error: error.message
        });
    }
});

// Get All Courses
adminRouter.get('/courses', adminMiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;

        if (!adminId) {
            return res.status(404).json({
                message: "Admin ID not found."
            });
        }

        const courses = await courseModel.find({ creatorId: adminId });

        if (courses.length === 0) {
            return res.status(404).json({
                message: "No courses found for this admin."
            });
        }

        return res.status(200).json({
            message: "Courses retrieved successfully.",
            courses
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error occurred while fetching courses.",
            error: error.message
        });
    }
});

module.exports = {
    adminRouter
};
