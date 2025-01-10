import * as yup from 'yup';

export const ekasaReceiptValidationSchema = yup.object().shape({
  receiptId: yup.string().required(),
  ico: yup.string().required(),
  cashRegisterCode: yup.string().required(),
  issueDate: yup.string().required(),
  createDate: yup.string().required(),
  dic: yup.string().required(),
  icDph: yup.string().optional().nullable(),
  okp: yup.string().required(),
  receiptNumber: yup.string().required(),
  type: yup.string().required(),
  taxBaseBasic: yup.number().optional().nullable(),
  taxBaseReduced: yup.number().optional().nullable(),
  totalPrice: yup.number().required(),
  freeTaxAmount: yup.number().nullable(),
  vatAmountBasic: yup.number().optional().nullable(),
  vatAmountReduced: yup.number().optional().nullable(),
  vatRateBasic: yup.number().optional().nullable(),
  vatRateReduced: yup.number().optional().nullable(),
  items: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      itemType: yup.string().required(),
      quantity: yup.number().required(),
      vatRate: yup.number().required(),
      price: yup.number().required(),
      sellerId: yup.mixed().nullable(),
      sellerIdType: yup.mixed().nullable(),
      specialRegulation: yup.mixed().nullable(),
      voucherNumber: yup.mixed().nullable()
    })
  ).required(),
  organization: yup.object().shape({
    buildingNumber: yup.string().nullable(),
    country: yup.string().required(),
    dic: yup.string().required(),
    icDph: yup.string().optional().nullable(),
    ico: yup.string().required(),
    municipality: yup.string().required(),
    name: yup.string().required(),
    postalCode: yup.string().required(),
    propertyRegistrationNumber: yup.mixed().nullable(),
    streetName: yup.string().required(),
    vatPayer: yup.boolean().required()
  }).required(),
  unit: yup.object().shape({
    cashRegisterCode: yup.string().optional().nullable(),
    buildingNumber: yup.string().optional().nullable(),
    country: yup.string().optional().nullable(),
    municipality: yup.string().optional().nullable(),
    postalCode: yup.string().optional().nullable(),
    propertyRegistrationNumber: yup.string().optional().nullable(),
    streetName: yup.string().optional().nullable(),
    name: yup.mixed().optional().nullable(),
    unitType: yup.string().optional().nullable()
  }).required(),
  exemption: yup.boolean().required()
});

export const receiptValidationSchema = yup.object().shape({
  uid: yup.string().required(),
  okp: yup.string().required(),
  issueDate: yup.string().required(),
  createDate: yup.string().required(),
  receiptNumber: yup.number().required(),
  type: yup.string().required(),
  exemption: yup.boolean().required(),
  totals: yup.object().shape({
    totalPrice: yup.number().optional().nullable(),
    taxBaseBasic: yup.number().optional().nullable(),
    vatRateBasic: yup.number().optional().nullable(),
    vatAmountBasic: yup.number().optional().nullable(),
    taxBaseReduced: yup.number().optional().nullable(),
    vatRateReduced: yup.number().optional().nullable(),
    vatAmountReduced: yup.number().optional().nullable(),
    freeTaxAmount: yup.number()
  }),
  store: yup.object().shape({
    uid: yup.string().required(),
    name: yup.string().required(),
    unitType: yup.string().required(),
    address: yup.object().shape({
      street: yup.string().required(),
      city: yup.string().required(),
      postalCode: yup.string().required(),
      country: yup.string().required()
    }),
    organization: yup.object().shape({
      id: yup.string().required(),
      name: yup.string().required(),
      taxID: yup.string().required(),
      vatID: yup.string().required(),
      isVatPayer: yup.boolean().required()
    })
  }),
  items: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      type: yup.string().required(),
      quantity: yup.number().required(),
      vatRate: yup.number().required(),
      price: yup.number().required()
    })
  ).required()
});