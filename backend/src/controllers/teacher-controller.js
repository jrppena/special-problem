import Teacher from '../models/teacher.model.js';

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const teacherRoutes = {
    getTeachers,
};

