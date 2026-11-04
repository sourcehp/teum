export const MIN_PASSWORD_LENGTH = 10;

/** 새 비밀번호 검사. 문제가 없으면 null, 있으면 한국어 안내 문구. */
export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `새 비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`;
  if (password !== confirm) return "새 비밀번호와 확인 값이 일치하지 않습니다";
  return null;
}
