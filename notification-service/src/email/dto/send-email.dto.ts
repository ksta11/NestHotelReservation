export class SendEmailDto {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}
