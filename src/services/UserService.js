const Users = require('../models/user')

const getAllUsers = async () => {
    return await Users.find()
}

const getUserById = async (id) => {
    return await Users.findOne({ _id: id })
}

const getUserByUsernameOrEmail = async (username) => {
    return await Users.findOne({
        $or: [{ username: username }, { email: username }]
    })
}

const createUser = async (data) => {
    return await Users.create(data)
}

const updateUser = async (data) => {
    const user = await Users.findOne({ _id: data._id });
    if (!user) return null;

    if (data.fullname) user.fullname = data.fullname;
    if (data.username) user.username = data.username;
    if (data.password) user.password = data.password;
    if (data.email)    user.email = data.email;
    if (data.phone) user.phone = data.phone;
    if (data.birthday)   user.dob = data.dob;
    if (data.role)     user.role = data.role;

    await user.save();
    return user;
};

const updateProfile = async (userId, data) => {
  const { fullname, email, phone, birthday } = data;

  const updatedUser = await Users.findByIdAndUpdate(
    userId,
    { fullname, email, phone, birthday },
    { new: true }
  ).select("-password");

  return updatedUser;
};

const deleteUser = async (id) => {
    return await Users.findByIdAndDelete(id);
}


const checkExistingUsername = async (username) => {
    return await Users.findOne({ username })
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByUsernameOrEmail,
    createUser,
    updateUser,
    deleteUser,
    updateProfile,
    checkExistingUsername
}
