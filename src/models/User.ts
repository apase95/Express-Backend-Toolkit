import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    hashedPassword: { 
        type: String,
        required: false
    },
    displayName: { 
        type: String,
        required: true,
        trim: true
    },
    firstName: { 
        type: String, 
        trim: true 
    },
    lastName: { 
        type: String, 
        trim: true 
    },
    phoneNumber: { 
        type: String,
        sparse: true
    },
    avatarURL: { 
        type: String 
    },
    avatarId: { 
        type: String 
    }, 
    googleId: { 
        type: String 
    },
    linkedinId: { 
        type: String 
    },
    role: {
        type: String,
        default: "user"
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;