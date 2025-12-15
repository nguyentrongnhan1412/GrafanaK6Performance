export class User {
  constructor(data = {}) {
    this.firstName = data.FirstName || data.firstName || '';
    this.lastName = data.LastName || data.lastName || '';
    this.email = data.Email || data.email || '';
    this.password = data.Password || data.password || '';
    this.confirmPassword = data.ConfirmPassword || data.confirmPassword || '';
    this.gender = data.Gender || data.gender || 'M';
    this.dateOfBirthDay = data.DateOfBirthDay || data.dateOfBirthDay || '1';
    this.dateOfBirthMonth = data.DateOfBirthMonth || data.dateOfBirthMonth || '1';
    this.dateOfBirthYear = data.DateOfBirthYear || data.dateOfBirthYear || '1990';
    this.registeredAt = data.registeredAt || new Date().toISOString();
  }

  toRegistrationPayload() {
    return {
      FirstName: this.firstName,
      LastName: this.lastName,
      Email: this.email,
      Password: this.password,
      ConfirmPassword: this.confirmPassword,
      Gender: this.gender,
      DateOfBirthDay: this.dateOfBirthDay,
      DateOfBirthMonth: this.dateOfBirthMonth,
      DateOfBirthYear: this.dateOfBirthYear,
      'g-recaptcha-response': '',
    };
  }

  toLoginPayload() {
    return {
      Email: this.email,
      Password: this.password,
      RememberMe: false,
    };
  }

  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      gender: this.gender,
      dateOfBirthDay: this.dateOfBirthDay,
      dateOfBirthMonth: this.dateOfBirthMonth,
      dateOfBirthYear: this.dateOfBirthYear,
      registeredAt: this.registeredAt,
    };
  }

  static fromJSON(json) {
    return new User({
      firstName: json.firstName,
      lastName: json.lastName,
      email: json.email,
      password: json.password,
      gender: json.gender,
      dateOfBirthDay: json.dateOfBirthDay,
      dateOfBirthMonth: json.dateOfBirthMonth,
      dateOfBirthYear: json.dateOfBirthYear,
      registeredAt: json.registeredAt,
    });
  }
}
