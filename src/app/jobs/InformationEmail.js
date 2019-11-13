import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';
import Student from '../models/Student';
import Plan from '../models/Plan';

class InformationMail {
  get key() {
    return 'InformationMail';
  }

  async handle({ data }) {
    const { enrollment } = data;

    const { name } = Student.findByPk(enrollment.student_id);

    const { planName } = Plan.findByPk(enrollment.plan_id);

    await Mail.sendMail({
      to: `${enrollment.name} <${enrollment.email}`,
      subject: 'Matrícula Gympoint',
      template: 'Information',
      context: {
        student: name,
        plan: planName,
        date: format(
          parseISO(enrollment.end_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new InformationMail();
