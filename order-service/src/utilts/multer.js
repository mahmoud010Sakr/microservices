import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KYE,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET_KYE
});

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml' , 'application/pdf'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    }
});

const uploadSingleFile = (file) => {
    return new Promise((resolve, reject) => {
        const isSvg = file.mimetype === 'image/svg+xml';
        
        const uploadOptions = {
            resource_type: 'auto',
            // For SVG files, explicitly set the format and public_id with extension
            ...(isSvg && {
                format: 'svg',
                public_id: `${file.originalname.split('.')[0]}` 
            })
        };

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    if (isSvg && !result.secure_url.endsWith('.svg')) {
                        result.secure_url = `${result.secure_url}.svg`;
                    }
                    resolve(result);
                }
            }
        );
        stream.end(file.buffer);
    });
};

export const uploadToCloudinary = (isRequired = true, type = "array") => async (req, res, next) => {
    try {
        if (type === "array") {
            if (!req.files) {
                if (isRequired) {
                    return next(new Error('File upload is required'));
                }
                // If not required and no files, just continue
                return next();
            }

            // Process imageCover if it exists
            if (req.files.imageCover) {
                try {
                    const result = await uploadSingleFile(req.files.imageCover[0]);
                    req.files.imageCover[0].cloudinaryResult = result;
                } catch (error) {
                    return next(new Error("Cloudinary imageCover upload failed"));
                }
            }

            // Process images if they exist
            if (req.files.images) {
                try {
                    const uploadedImages = await Promise.all(
                        req.files.images.map(async (file) => {
                            const result = await uploadSingleFile(file);
                            return { ...file, cloudinaryResult: result };
                        })
                    );
                    req.files.images = uploadedImages;
                } catch (error) {
                    return next(new Error("Cloudinary multiple upload failed"));
                }
            }
            
            return next();
        } 
        
        if (type === "single") {            

            if (!req.file) {
                if (isRequired) {
                    return next(new Error('File upload is required'));
                }
                return next();
            }
            
            try {
                const result = await uploadSingleFile(req.file);
                req.file.cloudinaryResult = result;                
                req.body.image = result.secure_url;
                return next();
            } catch (error) {
                return next(new Error("Cloudinary single image upload failed"));
            }
        }
        
        // If type is neither "array" nor "single"
        return next(new Error('Invalid upload type specified'));
    } catch (error) {
        return next(error);
    }
};

export { upload };