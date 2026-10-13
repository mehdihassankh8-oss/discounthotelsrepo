// Contact details used across the site (footer, contact page, WhatsApp links).
// Change them here and every page follows.
export const CONTACT = {
  /** International format, digits only, as wa.me expects. */
  whatsapp: '923220957136',
  /** Shown to visitors. */
  phoneLocal: '0322 0957136',
  phoneIntl: '+92 322 0957136',
  email: 'support@discounthotels.pk',
  hours: 'Every day, 9am to 11pm',
};

export const waLink = (text?: string): string =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/**
 * Bank account shown on the booking page and the pro forma invoice.
 * Edit the values below to change the payment details everywhere.
 * `account` is optional: leave it '' to hide the "Account no." row (the IBAN already identifies the account).
 */
export const BANK = {
  bank: 'FAYSAL BANK LIMITED',
  title: 'DISCOUNT HOTEL COMPANY',
  account: '',
  iban: 'PK68FAYS3733499000000491',
};
