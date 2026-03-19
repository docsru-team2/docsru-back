import bcrypt from 'bcrypt';

export class PasswordProvider {
  #saltRounds;

  constructor() {
    this.#saltRounds = 10;
  }

  async hash(password) {
    try {
      return await bcrypt.hash(password, this.#saltRounds);
    } catch {
      throw new Error('비밀번호 해싱 중 오류가 발생했습니다.');
    }
  }

  async compare(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch {
      return false;
    }
  }
}