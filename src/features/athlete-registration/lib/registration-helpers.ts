export type AthleteRegistrationFormValues = {
  email: string
  password: string
  confirmPassword: string
  nome: string
  cognome: string
}

export function validateAthleteRegistrationForm(
  values: AthleteRegistrationFormValues,
): string | null {
  if (values.password !== values.confirmPassword) {
    return 'Le password non corrispondono'
  }

  if (values.password.length < 6) {
    return 'La password deve essere di almeno 6 caratteri'
  }

  return null
}

export function createEmptyAthleteRegistrationForm(): AthleteRegistrationFormValues {
  return {
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
  }
}
