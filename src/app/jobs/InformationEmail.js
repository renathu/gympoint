import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class InformationMail {
  get key() {
    return 'InformationMail';
  }

  async handle({ data }) {
    const { send_email } = data;

    const total = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(send_email.total / 100);

    await Mail.sendMail({
      to: `${send_email.name} <${send_email.email}`,
      subject: 'Matrícula Gympoint',
      template: 'Information',
      context: {
        student: send_email.name,
        plan: send_email.title,
        date: format(
          parseISO(send_email.end_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        total,
      },
    });
  }
}

export default new InformationMail();
