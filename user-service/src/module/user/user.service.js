import userModel from "../../database/model/user.model.js";
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import jwt from 'jsonwebtoken'
import { sendEmail } from "../../utilts/sendEmail.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import orderModel from "../../database/model/order.model.js";
import maintainanceModel from "../../database/model/maintainanceCenter.model.js";

export const getAllDeletedUser = handleAsyncError(async (req, res) => {
    let usersData = await userModel.find({ isDeleted: true }).populate('deletedBy', { name: 1, email: 1, phone: 1 });
    if (!usersData) {
        return res.json({ message: 'No deleted users found' });
    }
    res.json({ message: 'Deleted users retrieved successfully', usersData });
})
export const updateProfile = handleAsyncError(async (req, res) => {
    let { id } = req.user
    let { name, email, phone, gender, age, location } = req.body;
    let exsistUser = await userModel.findById(id).select("-password -__v -isVerified -isDeleted -deletedAt -deletedBy -createdAt -updatedAt -isVerified -platformPercentage -xPercentage -yPercentage -shippingPercentage");
    if (!exsistUser) {
        throw new AppError("User not found", 400);
    }
    if (exsistUser.isDeleted == true) {
        throw new AppError("User is already deleted", 400);
    }
    if (email) {
        let exsistEmail = await userModel.findOne({ email }).select("-password -__v -isVerified -isDeleted -deletedAt -deletedBy -createdAt -updatedAt -isVerified -platformPercentage -xPercentage -yPercentage -shippingPercentage");
        if (exsistEmail) {
          return res.json({ message: "Email already exists" });
        }else if (email== exsistUser.email){
            return res.json({ message: "Email is the same" });
        }
        console.log("email updated");
        
        let token = jwt.sign({ id: exsistUser._id }, process.env.VERIFY_SIGNATURE, { expiresIn: '3m' });
        let confirmationLink = `http://${process.env.CLIENT_URL}/auth/confirm-email/${token}`;
        let html = `
        <!DOCTYPE html>
                        <html>
                        <head>
                            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                        <style type="text/css">
                        body{background-color: #88BDBF;margin: 0px;}
                        </style>
                        <body style="margin:0px;"> 
                        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                        <tr>
                        <td>
                        <table border="0" width="100%">
                        <tr>
                        <td>
                        <a href="www.google.com"  target="_blank" style="display: none;">www.google.com</a > 
                        <h1>
                            <img width="100px" src="https://imgs.search.brave.com/sQKQlbEGmcJQ7Y3fwrRxzhodH-cHHOxvGE2-_FOYExc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM3/NDg3NjMxOC9waG90/by9jbG9zZS11cC1v/Zi1tZWNoYW5pYy1p/bi10aXJlLXNlcnZp/Y2Utd29ya3Nob3At/Y2hhbmdpbmctdGly/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9MUpxTEhEcEZY/OVVrT0dramYxZV83/STFVcXY3U0szN1Js/X1c3NDdVYUZacz0"/>
                        </h1>
                        </td>
                        <td>
                        <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        <tr>
                        <td>
                        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                        <tr>
                        <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                        <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                        </td>
                        </tr>
                        <tr>
                        <td>
                        <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
                        </td>
                        </tr>
                        <tr>
                        <td>
                        <p style="padding:0px 100px;">
                        </p>
                        </td>
                        </tr>
                        <tr>
                        <td>
                        <div> 
                        <a href="${confirmationLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
                        </div>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        <tr>
                        <td>
                        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                        <tr>
                        <td>
                        <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                        </td>
                        </tr>
                        <tr>
                        <td>
                        <div style="margin-top:20px;">
                        <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                        
                        <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                        </a>
                        
                        <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                        </a>
                        </div>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                        </body>
                        </html>
            `;
        sendEmail(email, html);
        exsistUser.isVerified = false
        exsistUser.email = email
    }
    name ? exsistUser.name = name : exsistUser.name
    phone ? exsistUser.phone = phone : exsistUser.phone
    gender ? exsistUser.gender = gender : exsistUser.gender
    age ? exsistUser.age = age : exsistUser.age
    location ? exsistUser.location = location : exsistUser.location
    let updatedUser = await exsistUser.save();
    res.json({ message: "User updated successfully", updatedUser })
})

export const deletedUser = handleAsyncError(async (req, res, next) => {
    let { userId } = req.params;
    console.log(userId);
    
    let exsistUser = await userModel.findById(userId).select("-password -__v -otp -confirmRule -isVerified -isDeleted -deletedAt -deletedBy -createdAt -updatedAt")
    console.log(exsistUser);
    
    if (!exsistUser) {
        throw new AppError("User not found", 400);
    }
    if (exsistUser.isDeleted == true) {
        throw new AppError("User is already deleted", 400);
    }
    exsistUser.isDeleted = true
    exsistUser.deletedBy = req.user.id
    exsistUser.deletedAt = Date.now()
    let deletedUser = await exsistUser.save();
    res.json({ message: "User deleted successfully", deletedUser })
})

export const getAllUsers = handleAsyncError(async (req, res, next) => {
    let users = await userModel.find({ isDeleted: false }, { password: 0, __v: 0, isVerified: 0, isDeleted: 0, deletedAt: 0, deletedBy: 0, createdAt: 0, updatedAt: 0 }).populate('deletedBy', { name: 1, email: 1, phone: 1 });
    res.json({ message: "All users", users })
})

export const restoreUser = handleAsyncError(async (req, res, next) => {
    let { userId } = req.params;
    let exsistUser = await userModel.findById(userId).select("-password -__v -otp -confirmRule -isVerified -isDeleted -deletedAt -deletedBy -createdAt -updatedAt");
    if (!exsistUser) {
        throw new AppError("User not found", 400);
    }
    if (exsistUser.isDeleted == false) {
        throw new AppError("User is not deleted", 400);
    }
    exsistUser.isDeleted = false
    exsistUser.deletedBy = null
    exsistUser.deletedAt = null
    let deletedUser = await exsistUser.save();
    res.json({ message: "User restored successfully", deletedUser })
})

export const updateUser = handleAsyncError(async (req, res, next) => {
    let { userId } = req.params;
    let { name, email, phone, gender, age, password, role } = req.body
    let savedUser;
    let exsistUser = await userModel.findById(userId);
    if (!exsistUser) {
        throw new AppError("User not found", 400);
    }
    if (role == exsistUser.role) {
        throw new AppError("User is already has this role ", 400);
    }
    if (role == "Agent") {
        let platformPercentage = req.body.platformPercentage
        let name = req.body.name
        let shippingPercentage = req.body.shippingPercentage
        let xPercentage = req.body.xPercentage
        let yPercentage = req.body.yPercentage
        exsistUser.role = role
        exsistUser.name = name
        exsistUser.platformPercentage = platformPercentage
        exsistUser.shippingPercentage = shippingPercentage
        exsistUser.xPercentage = xPercentage
        exsistUser.yPercentage = yPercentage
        let upgradeRole = await exsistUser.save();
        return res.json({ message: "User upgraded successfully", upgradeRole })
    } else if (role == "MC" || exsistUser.role == "MC") {
        let { name, phone, city, iFrame, country, services, link, location } = req.body;
        let mcData = {
            name,
            phone,
            city,
            iFrame,
            country,
            services,
            link,
            location,
            userAccountId: userId
        };
        let savedUser = await maintainanceModel.findOneAndUpdate(
            { userAccountId: userId },
            mcData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        exsistUser.role = role ? role : exsistUser.role;
        await exsistUser.save();
        return res.json({ message: "Maintenance center upserted successfully", savedUser, role: exsistUser.role });
    }
    if (password) {
        let hashedPassword = await bcrypt.hash(password, process.env.HASH_SALT);
        exsistUser.password = hashedPassword
    }
    exsistUser.role = role ? role : exsistUser.role
    exsistUser.name = name ? name : exsistUser.name
    exsistUser.email = email ? email : exsistUser.email
    exsistUser.phone = phone ? phone : exsistUser.phone
    exsistUser.gender = gender ? gender : exsistUser.gender
    exsistUser.age = age ? age : exsistUser.age
    let upgradeRole = await exsistUser.save();
    return res.json({ message: "User upgraded successfully", upgradeRole })
})

export const getAllUsersForChat = handleAsyncError(async (req, res, next) => {
    let users = await userModel.find({ role: "Maintenance_Center", isDeleted: false })
    return res.json({ message: "All users", users })
})

export const getSpecificUser = handleAsyncError(async (req, res, next) => {
    let { userId } = req.params;
    let exsistUser = await userModel.findById(userId, { password: 0, __v: 0, isVerified: 0, isDeleted: 0, deletedAt: 0, deletedBy: 0, createdAt: 0, updatedAt: 0 });
    if (!exsistUser) {
        throw new AppError("User not found", 400);
    }
    let userOrders = await orderModel.find({ userId })
    return res.json({ message: "User retrieved successfully", userData: exsistUser, orders: userOrders })
})


export const updatePercentage = handleAsyncError(async (req, res, next) => {
    let { userId } = req.params;
    let { xPercentage, yPercentage, platformPercentage, shippingPercentage } = req.body
    let exsistUser = await userModel.findById(userId);
    if (!exsistUser) {
        throw new AppError("User not found", 400);
    }
    if (exsistUser.role !== "Agent") {
        throw new AppError("User is not an Agent", 400);
    }
    exsistUser.platformPercentage = platformPercentage ? platformPercentage : exsistUser.platformPercentage
    exsistUser.shippingPercentage = shippingPercentage ? shippingPercentage : exsistUser.shippingPercentage
    exsistUser.xPercentage = xPercentage ? xPercentage : exsistUser.xPercentage
    exsistUser.yPercentage = yPercentage ? yPercentage : exsistUser.yPercentage
    let updatedUser = await exsistUser.save();
    return res.json({ message: "User updated successfully", updatedUser })

})

export const getAllMentenanceCenter = handleAsyncError(async (req, res, next) => {
    const centers = await maintainanceModel
    .find({ isDeleted: false })
    .populate({
      path: "userAccountId",
      select: "-password -otp -__v -isVerified -isDeleted -deletedAt -deletedBy -createdAt -updatedAt"
    })
    .select("-__v -isDeleted -deletedAt -deletedBy -createdAt -updatedAt"); // applies to maintainanceModel root doc
    return res.json({ message: "Active maintenance centers", users: centers });
});

export const getAllMentenanceCenterForAdmins = handleAsyncError(async (req, res, next) => {
    const centers = await maintainanceModel.find().populate("userAccountId");
    return res.json({ message: "All maintenance centers (admin)", centers });
});

export const getMaintenanceByUser = handleAsyncError(async (req, res, next) => {
    const userId = req.user._id;

    const users = await maintainanceModel.findOne({
        userAccountId: userId,
        isDeleted: false
    }).populate("userAccountId");

    if (!users) {
        return next(new AppError("Maintenance center not found", 404));
    }

    return res.json({ message: "Your maintenance center", users });
});


export const getMentennaceByIdForAdmin = handleAsyncError(async (req, res, next) => {
    const { maintenanceId } = req.params;

    const center = await maintainanceModel.findById(maintenanceId).populate("userAccountId");

    if (!center) {
        return next(new AppError("Maintenance center not found", 404));
    }

    return res.json({ message: "Maintenance center found", center });
});


export const addMaintenanceCenter = handleAsyncError(async (req, res, next) => {
    const { name, phone, iFrame, city, country, services, location, link, userAccountId } = req.body;

    console.log(req.user);

    const center = await maintainanceModel.create({
        name,
        phone,
        iFrame,
        city,
        userAccountId,
        country,
        services,
        location,
        link
    });
    return res.status(201).json({ message: "Maintenance center added", center });
});

export const updateMaintenanceCenterForAdmin = handleAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let { name, phone, iFrame, city, country, services, location, link } = req.body
    let coverImage, profImage
    if (req.files && req.files.imageCover && req.files.images) {
        coverImage = req.files.imageCover[0].cloudinaryResult.secure_url;
        profImage = req.files.images[0].cloudinaryResult.secure_url;
    }
    const center = await maintainanceModel.findByIdAndUpdate({ _id: id }, { name, phone, iFrame, city, country, services, location, link, coverImage, profImage }, { new: true });
    if (!center) return next(new AppError("Maintenance center not found", 404));
    return res.json({ message: "Maintenance center updated", center });
});

export const updateMaintenanceCenter = handleAsyncError(async (req, res, next) => {
    const { id } = req.user;
    console.log(id);

    let { name, phone, iFrame, city, country, services, location, link } = req.body
    let coverImage, profImage
    if (req.files || req.files.imageCover || req.files.images) {
        req.files.imageCover ? coverImage = req.files.imageCover[0].cloudinaryResult.secure_url : ""
        req.files.images ? profImage = req.files.images[0].cloudinaryResult.secure_url : ""
    }
    const center = await maintainanceModel.findOneAndUpdate(
        { userAccountId: id },
        { name, phone, iFrame, city, country, services, location, link, coverImage, profImage },
        { new: true }
    ); if (!center) return next(new AppError("Maintenance center not found", 404));
    return res.json({ message: "Maintenance center updated", center });
});

export const deleteMaintenanceCenter = handleAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const center = await maintainanceModel.findById(id);
    if (!center) return next(new AppError("Maintenance center not found", 404));
    if (center.isDeleted) {
        return res.status(400).json({ message: "Center already deleted" });
    }
    center.isDeleted = true;
    await center.save();
    return res.json({ message: "Maintenance center deleted (soft delete)", center });
});

export const hardDeleteMC = handleAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const center = await maintainanceModel.findByIdAndDelete(id);
    if (!center) return next(new AppError("Maintenance center not found", 404));
    return res.json({ message: "Maintenance center deleted (hard delete)", center });
})

export const restoreMaintenanceCenter = handleAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const center = await maintainanceModel.findById(id);
    if (!center) return next(new AppError("Maintenance center not found", 404));
    if (!center.isDeleted) {
        return res.status(400).json({ message: "Center is already active" });
    }
    center.isDeleted = false;
    center.deletedBy = null;
    await center.save();
    return res.json({ message: "Maintenance center restored", center });
});


