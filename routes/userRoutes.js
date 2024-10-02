const { Router } = require("express");
const { userModel } = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userMiddleware } = require("../middlewares/user.middlewares");
const { purchaseModel } = require("../model/purchase.model");
const { courseModel } = require("../model/courses.model");
const { z } = require("zod")

const userRouter = Router();


// User Signup
userRouter.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const validatorSchema = z.object({
        email: z.string().min(3).max(50).email(),
        password: z.string().min(3).max(12),
        firstName: z.string().min(2).max(20),
        lastName: z.string()
    })

    const validatorSchemaSafeParse = validatorSchema.safeParse(req.body)

    if (!validatorSchemaSafeParse.success) {
        return res.status(400).json({
            message: "Validation failed. Please ensure all fields meet the required criteria.",
            error: validatorSchemaSafeParse.error
        });
    }
    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!hashedPassword) {
            return res.status(500).json({
                message: "Error hashing the password."
            });
        }

        const user = await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        return res.status(201).json({
            message: "User created successfully.",
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred during user signup.",
            error: error.message
        });
    }
});

// User Login
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const validatorSchema = z.object({
        email: z.string().min(3).max(50).email(),
        password: z.string().min(3).max(20)
    })

    const validatorSchemaSafeParse = validatorSchema.safeParse(req.body)

    if (!validatorSchemaSafeParse.success) {
        return res.status(400).json({
            message: "Validation failed. Please ensure all fields meet the required criteria.",
            error: validatorSchemaSafeParse.error
        })
    }
    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const verifiedPassword = await bcrypt.compare(password, user.password);

        if (!verifiedPassword) {
            return res.status(401).json({
                message: "Invalid credentials. Please try again."
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_USER, { expiresIn: '1h' });


        if (!token) {
            return res.status(500).json({
                message: "Error generating token."
            });
        }

        res.cookie('userToken', token, { httpOnly: true, maxAge: 60 * 60 * 1000 })
        return res.status(200).json({
            message: "Login successful.",
            user,
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred during login.",
            error: error.message
        });
    }
});



userRouter.get('/courses',userMiddleware ,async (req, res) => {
    // logic to list all courses
    try {
        const course = await courseModel.find();
        if (!course) {
            return res.status(400).json({
                message: "something went wrong",
            })
        }

        res.status(200).json({
            message: "successfully find get all the course",
            course
        })
    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
            error: error.message
        })
    }

});

userRouter.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // logic to purchase a course
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(500).json({
                message: "userId is not found",
            })
        }

        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({
                message: "courseId not found ",
            })
        }

        const purchaseCourse = await purchaseModel.create({
            user: userId,
            coursePurchase: courseId,
        })

        if (!purchaseCourse) {
            return res.status(400).json({
                message: "something went wrong while purchasing course",
            })
        }

        res.status(200).json({
            message: "successfull purcahse the course",
            purchaseCourse
        })
    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
            error: error.message
        })
    }

});


userRouter.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // logic to view purchased courses

    const userId = req.userId
    try {

        if (!userId) {
            return res.status(400).json({
                message: "userId is not found"
            })
        }

        const course = await purchaseModel.find({ user: userId }).populate('coursePurchase').exec();

        if (!course) {
            return res.status(401).json({
                message: "purchased course not found",
            })
        }

        res.status(200).json({
            message: "successfull fetch the course",
            course,
        })


    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
            error: error.message
        })
    }
});





module.exports = {
    userRouter
};
