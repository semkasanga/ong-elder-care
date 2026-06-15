const rules = {
  name: (value) => {
    if (!value.trim()) return 'Please enter your full name.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
  email: (value) => {
    if (!value.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
    return '';
  },
  subject: (value) => {
    if (!value) return 'Please select a subject.';
    return '';
  },
  message: (value) => {
    if (!value.trim()) return 'Please enter your message.';
    if (value.trim().length < 10) return 'Message must be at least 10 characters.';
    return '';
  },
};

const initForms = () => {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const fields = {
    name: form.querySelector('#contact-name'),
    email: form.querySelector('#contact-email'),
    subject: form.querySelector('#contact-subject'),
    message: form.querySelector('#contact-message'),
  };

  const getErrorEl = (field) =>
    form.querySelector(`[data-error-for="${field.id}"]`);

  const setFieldState = (field, message) => {
    const errorEl = getErrorEl(field);
    const isInvalid = Boolean(message);

    field.classList.toggle('is-invalid', isInvalid);
    field.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('is-visible', isInvalid);
    }
  };

  const validateField = (field) => {
    const rule = rules[field.name];
    if (!rule) return true;
    const message = rule(field.value);
    setFieldState(field, message);
    return !message;
  };

  Object.values(fields).forEach((field) => {
    if (!field) return;

    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (status) {
      status.textContent = '';
      status.classList.remove('is-success', 'is-error');
    }

    const results = Object.values(fields).map((field) => {
      if (!field) return true;
      return validateField(field);
    });

    if (results.includes(false)) {
      const firstInvalid = Object.values(fields).find((f) => f?.classList.contains('is-invalid'));
      firstInvalid?.focus();
      if (status) {
        status.textContent = 'Please correct the errors below before submitting.';
        status.classList.add('is-error');
      }
      return;
    }

    if (status) {
      status.textContent = 'Thank you for your message. We will get back to you soon.';
      status.classList.add('is-success');
      status.focus();
    }

    form.reset();
    Object.values(fields).forEach((field) => {
      if (field) setFieldState(field, '');
    });
  });
};

export default initForms;
