export const LEGAL_NOTICE = {
  ownerName: 'Matthias Wallner-Géhri',
  address: 'BITTE_LADUNGSFAEHIGE_ADRESSE_ERGAENZEN',
  email: 'BITTE_E_MAIL_ADRESSE_ERGAENZEN',
  phone: 'BITTE_TELEFONNUMMER_ODER_ALTERNATIVE_KONTAKTANGABE_PRUEFEN',
  businessPurpose:
    'Persoenliche Webseite zur Darstellung von Person, Projekten und Kontaktmoeglichkeiten.',
  editorResponsible: 'Matthias Wallner-Géhri',
};

export const LEGAL_PLACEHOLDER_PREFIX = 'BITTE_';

export const legalHasPlaceholders = Object.values(LEGAL_NOTICE).some(
  (value) => typeof value === 'string' && value.startsWith(LEGAL_PLACEHOLDER_PREFIX),
);
