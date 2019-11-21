import Help_Order from '../models/HelpOrder';
import Student from '../models/Student';

import AnswerEmail from '../jobs/AnswerEmail';
import Queue from '../../lib/Queue';

class HelpAnswerController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const help_Order = await Help_Order.findAll({
      where: { answer_at: null },
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

  async update(req, res) {
    const { answer } = req.body;

    const help_Order = await Help_Order.findOne({
      where: { id: req.params.id },
    });

    if (!help_Order) {
      return res.status(400).json({ error: 'Question not exits' });
    }

    const { id, student_id, question } = help_Order;

    await help_Order.update({
      answer,
      answer_at: new Date(),
    });

    const student = await Student.findByPk(student_id);

    const { name, email } = student;

    // Send Email
    const send_email = { name, email, question, answer };

    await Queue.add(AnswerEmail.key, {
      send_email,
    });

    return res.json({
      id,
      question,
      answer,
      student_id,
      name,
    });
  }
}

export default new HelpAnswerController();
