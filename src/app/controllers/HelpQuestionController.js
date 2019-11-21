import Help_Order from '../models/HelpOrder';
import Student from '../models/Student';

class HelpQuestionController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const help_Order = await Help_Order.findAll({
      where: { student_id: req.params.id },
      order: ['created_at'],
      attributes: ['id', 'created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(help_Order);
  }

  async store(req, res) {
    const student_id = req.params.id;

    const { question } = req.body;

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not exits' });
    }

    const { id, created_at } = await Help_Order.create({
      student_id,
      question,
    });

    const { name } = student;

    return res.json({
      id,
      question,
      student_id,
      name,
      created_at,
    });
  }
}

export default new HelpQuestionController();
