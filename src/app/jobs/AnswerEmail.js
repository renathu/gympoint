import Mail from '../../lib/Mail';

class AnswerEmail {
  get key() {
    return 'AnswerEmail';
  }

  async handle({ data }) {
    const { send_email } = data;    

    await Mail.sendMail({
      to: `${send_email.name} <${send_email.email}`,
      subject: 'Resposta Gympoint',
      template: 'Answer',
      context: {
        student: send_email.name,
        question: send_email.question,
        answer: send_email.answer,
      },
    });
  }
}

export default new AnswerEmail();
