const UserService = require('../services/UserService');
const jwt = require('jsonwebtoken');

module.exports = {
    register: async (req, res, next) => {
         console.log("🟢 Body nhận được từ FE:", req.body); // <== thêm dòng này
        try {
            const exists = await UserService.checkExistingUsername(req.body.username);
            if (exists) return res.status(409).send("User đã tồn tại");

            const newUser = await UserService.createUser(req.body);
            res.status(201).json(newUser);
        } catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const user = await UserService.getUserByUsernameOrEmail(username);
            if (!user) return res.status(404).send('Không tìm thấy user');
            if (user.password !== password) return res.status(401).send('Sai mật khẩu');

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                token, user,
                fullname: user.fullname,
                role: user.role
            });
        } catch (err) {
            next(err);
        }
    },

    index: async (req, res, next) => {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (err) {
            next(err);
        }
    },

    user: async (req, res, next) => {
        try {
            const user = await UserService.getUserById(req.params.id);
            if (!user) return res.status(404).send('Không tìm thấy user');
            res.json(user);
        } catch (err) {
            next(err);
        }
    },

    updateUser: async (req, res, next) => {
        try {
            // Nếu là admin => cho phép cập nhật bất kỳ
            // Nếu là user => chỉ được phép cập nhật chính họ
            if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
                return res.status(403).send("Không có quyền cập nhật thông tin người khác");
            }

            const updated = await UserService.updateUser({ _id: req.params.id, ...req.body });
            if (!updated) return res.status(404).send('Không tìm thấy user để cập nhật');
            res.json(updated);
        } catch (err) {
            next(err);
        }
    },

    deleteUser: async (req, res, next) => {
        try {
            const deleted = await UserService.deleteUser(req.params.id);
            if (!deleted) return res.status(404).send('Không tìm thấy user để xoá');
            res.status(204).end();
        } catch (err) {
            next(err);
        }
    },

    getProfile: async (req, res, next) => {
        try {
            const user = await UserService.getUserById(req.user.id);
            if (!user) return res.status(404).send('Không tìm thấy user');
            res.json(user);
        } catch (err) {
            next(err);
        }
    },
    
    updateProfile: async (req, res) => {
    try {
        const userId = req.user.id; // từ verifyToken
        const updatedUser = await UserService.updateProfile(userId, req.body);

        if (!updatedUser) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error("Lỗi update profile:", err);
        res.status(500).json({ message: "Cập nhật thông tin thất bại." });
    }
    },
    
    
};