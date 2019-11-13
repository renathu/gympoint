import * as Yup from 'yup';
import { parseISO, addMonths } from 'date-fns';
import { Op } from 'sequelize';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import InformationEmail from '../jobs/InformationEmail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .required()
        .positive(),
      plan_id: Yup.number()
        .required()
        .positive(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not exits' });
    }

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan not exits' });
    }

    const { duration, price } = plan;

    const end_date = addMonths(parseISO(start_date), duration);

    const existEnrollment = await Enrollment.findOne({
      where: {
        student_id,
        end_date: {
          [Op.gt]: end_date,
        },
      },
    });

    if (existEnrollment) {
      return res.status(400).json({ error: 'Student already enrolled' });
    }

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: parseISO(start_date),
      end_date,
      price: price * duration,
    });

    await Queue.add(InformationEmail.key, {
      enrollment,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().positive(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    let { plan_id, start_date } = req.body;

    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not exists' });
    }

    let { end_date } = enrollment;
    let { price } = enrollment;

    if (!start_date) {
      start_date = enrollment.start_date;
    }

    if (plan_id && plan_id !== enrollment.plan_id) {
      const plan = await Plan.findOne({
        where: { id: plan_id },
      });

      if (!plan) {
        return res.status(400).json({ error: 'Plan not exits' });
      }

      end_date = addMonths(parseISO(start_date), plan.duration);
      price = plan.price * plan.duration;
    } else {
      plan_id = enrollment.plan_id;
    }

    await enrollment.update({
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json({
      id,
      plan_id,
      start_date,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not exits' });
    }

    await enrollment.destroy(enrollment.id);

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
