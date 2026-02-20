import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Label, Input, Textarea, Button, Message, Spinner } from 'theme-ui';
import { LanguageContext } from '@helpers-blog/useLanguageContext';
import emailjs from 'emailjs-com';

const ContactForm = () => {
  const { language } = useContext(LanguageContext);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await emailjs.sendForm(
        'service_wmqomka',
        'template_tg46y1r',
        event.target,
        '_siqrQw8JSSNqZSdI'
      );

      if (result.text === 'OK') {
        setSuccess(true);
        event.target.reset();
      } else {
        setSuccess(false);
      }
    } catch (error) {
      setSuccess(false);
    }

    setSubmitting(false);
  };

  const texts = {
    en: {
      successMessage: 'Thank you for contacting us. We\'ll get back to you soon!',
      errorMessage: 'Something went wrong. Please try again later!',
      nameLabel: 'Name',
      companyLabel: 'Company Name',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '(xxx) xxx-xxxx',
      subjectLabel: 'Subject',
      messageLabel: 'Your Message',
      submitButton: 'Submit',
    },
    es: {
      successMessage: 'Gracias por contactarnos. ¡Nos pondremos en contacto contigo pronto!',
      errorMessage: 'Algo salió mal. ¡Por favor, inténtalo de nuevo más tarde!',
      nameLabel: 'Nombre',
      companyLabel: 'Nombre de la empresa',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'correo@ejemplo.com',
      phoneLabel: 'Número de teléfono',
      phonePlaceholder: '(xxx) xxx-xxxx',
      subjectLabel: 'Asunto',
      messageLabel: 'Tu mensaje',
      submitButton: 'Enviar',
    },
  };

  const {
    successMessage,
    errorMessage,
    nameLabel,
    companyLabel,
    emailLabel,
    emailPlaceholder,
    phoneLabel,
    phonePlaceholder,
    subjectLabel,
    messageLabel,
    submitButton,
  } = texts[language];

  return (
    <form onSubmit={handleSubmit} method='POST'>
      {success === true && <Message variant='success'>{successMessage}</Message>}
      {success === false && <Message variant='error'>{errorMessage}</Message>}
      <Box variant='forms.row'>
        <Box variant='forms.column'>
          <Label htmlFor='contact-form-name'>{nameLabel}</Label>
          <Input type='text' id='contact-form-name' name='name' required />
        </Box>
        <Box variant='forms.column'>
          <Label htmlFor='contact-form-company'>{companyLabel}</Label>
          <Input type='text' id='contact-form-company' name='company' />
        </Box>
      </Box>
      <Box variant='forms.row'>
        <Box variant='forms.column'>
          <Label htmlFor='contact-form-email'>{emailLabel}</Label>
          <Input
            type='email'
            placeholder={emailPlaceholder}
            id='contact-form-email'
            name='email'
            required
          />
        </Box>
        <Box variant='forms.column'>
          <Label htmlFor='contact-form-phone'>{phoneLabel}</Label>
          <Input
            type='tel'
            placeholder={phonePlaceholder}
            id='contact-form-phone'
            name='phone'
          />
        </Box>
      </Box>
      <Box variant='forms.row'>
        <Label htmlFor='contact-form-subject'>{subjectLabel}</Label>
        <Input type='text' id='contact-form-subject' name='subject' required />
      </Box>
      <Box variant='forms.row'>
        <Label htmlFor='contact-form-message'>{messageLabel}</Label>
        <Textarea name='message' id='contact-form-message' />
      </Box>
      <Button variant={success || submitting ? 'disabled' : 'primary'} disabled={success || submitting} type='submit' required>
        {submitButton} {submitting && <Spinner size='20' />}
      </Button>
    </form>
  );
};

export default ContactForm;

ContactForm.propTypes = {
  // Remove the handleSubmit, submitting, and success props
};