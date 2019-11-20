import { addMonths, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Help_Order from '../models/Help_Order';
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

    const id = req.params.id;

    const { answer } = req.body;

    const help_Order = await Help_Order.findOne({
      where: { id: id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],          
        },
      ],
    });

    if (!help_Order) {
      return res.status(400).json({ error: 'Question not exits' });
    }

    const { id, created_at } = await Help_Order.update({
      id,
      answer,
      answer_at: new Date(),
    });   

    // Send Email
    const send_email = { help_Order.student.name, help_Order.student.email, question, answer };

    await Queue.add(AnswerEmail.key, {
      send_email,
    }); 

    return res.json({
      id,
      question,
      answer,
      help_Order.student.id,
      help_Order.student.name,
      created_at,
    });
  }
  
}

export default new HelpAnswerController();