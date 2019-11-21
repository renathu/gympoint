import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const checkins = await Checkin.findAll({
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

    return res.json(checkins);
  }

  async store(req, res) {
    const student_id = req.params.id;

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not exits' });
    }

    const end_date = new Date();
    const start_date = subDays(end_date, 7);

    const countChekin = await Checkin.count({
      where: {
        student_id,
        created_at: {
          [Op.between]: [startOfDay(start_date), endOfDay(end_date)],
        },
      },
    });

    if (countChekin >= 5) {
      return res
        .status(400)
        .json({ error: 'You can only do 5 checkins within 7 calendar days' });
    }

    const { id, created_at } = await Checkin.create({
      student_id,
    });
    const { name } = student;

    return res.json({
      id,
      student_id,
      name,
      created_at,
    });
  }
}

export default new CheckinController();
