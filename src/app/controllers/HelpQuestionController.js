import { addMonths, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Help_Order from '../models/Help_Order';
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
}

export default new HelpQuestionController();
