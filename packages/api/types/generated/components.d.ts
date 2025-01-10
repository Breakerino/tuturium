import type { Schema, Attribute } from '@strapi/strapi';

export interface GlobalCondition extends Schema.Component {
  collectionName: 'components_conditions';
  info: {
    displayName: 'Condition';
    description: '';
  };
  attributes: {
    field: Attribute.String;
    value: Attribute.Text;
    operator: Attribute.Enumeration<
      [
        'CONTAINS',
        'NOT CONTAINS',
        'IN',
        'NOT IN',
        'IS',
        'NOT',
        'GTE',
        'LTE',
        'GT',
        'LT'
      ]
    >;
  };
}

export interface ProductAlternativeNames extends Schema.Component {
  collectionName: 'components_product_alternative_names';
  info: {
    displayName: 'Alternative names';
    icon: 'archive';
  };
  attributes: {
    name: Attribute.String;
  };
}

export interface ProductPriceHistory extends Schema.Component {
  collectionName: 'components_product_price_histories';
  info: {
    displayName: 'Price history';
    description: '';
  };
  attributes: {
    date: Attribute.DateTime;
    price: Attribute.Decimal;
    vatRate: Attribute.Enumeration<['standard', 'reduced', 'zero']>;
    store: Attribute.Relation<
      'product.price-history',
      'oneToOne',
      'api::store.store'
    >;
  };
}

export interface ReceiptItem extends Schema.Component {
  collectionName: 'components_receipt_items';
  info: {
    displayName: 'Item';
    icon: 'archive';
  };
  attributes: {
    name: Attribute.String;
    type: Attribute.String;
    quantity: Attribute.Decimal;
    vatRate: Attribute.Enumeration<['standard', 'reduced', 'zero']>;
    price: Attribute.Decimal;
    unit: Attribute.Enumeration<['kg', 'pc']>;
    product: Attribute.Relation<
      'receipt.item',
      'oneToOne',
      'api::product.product'
    >;
  };
}

export interface ReceiptTaxes extends Schema.Component {
  collectionName: 'components_receipt_taxes';
  info: {
    displayName: 'Taxes';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    baseAmount: Attribute.Decimal;
    vatAmount: Attribute.Decimal;
    vatRate: Attribute.Decimal;
  };
}

export interface StoreOrganization extends Schema.Component {
  collectionName: 'components_store_organizations';
  info: {
    displayName: 'Organization';
  };
  attributes: {
    name: Attribute.String;
    companyID: Attribute.String;
    companyTaxID: Attribute.String;
    companyVatID: Attribute.String;
    isTaxPayer: Attribute.Boolean & Attribute.DefaultTo<true>;
  };
}

export interface TransactionBankAccount extends Schema.Component {
  collectionName: 'components_transaction_bank_accounts';
  info: {
    displayName: 'Bank account';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    iban: Attribute.String;
    currency: Attribute.String;
    agent: Attribute.String;
  };
}

export interface TransactionCategorizationRules extends Schema.Component {
  collectionName: 'components_transaction_category_rules';
  info: {
    displayName: 'Categorization Rules';
    icon: 'apps';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    relation: Attribute.Enumeration<['OR', 'AND']>;
    category: Attribute.Relation<
      'transaction.categorization-rules',
      'oneToOne',
      'api::transaction.transaction-category'
    >;
    conditions: Attribute.Component<'global.condition', true>;
  };
}

export interface TransactionMerchantCategoryCode extends Schema.Component {
  collectionName: 'components_transaction_merchant_category_codes';
  info: {
    displayName: 'Merchant Category Code';
  };
  attributes: {
    name: Attribute.String;
    code: Attribute.String;
  };
}

export interface WalletBalanceHistory extends Schema.Component {
  collectionName: 'components_wallet_balance_histories';
  info: {
    displayName: 'BalanceHistory';
    icon: 'bulletList';
  };
  attributes: {
    date: Attribute.DateTime;
    balance: Attribute.Decimal;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'global.condition': GlobalCondition;
      'product.alternative-names': ProductAlternativeNames;
      'product.price-history': ProductPriceHistory;
      'receipt.item': ReceiptItem;
      'receipt.taxes': ReceiptTaxes;
      'store.organization': StoreOrganization;
      'transaction.bank-account': TransactionBankAccount;
      'transaction.categorization-rules': TransactionCategorizationRules;
      'transaction.merchant-category-code': TransactionMerchantCategoryCode;
      'wallet.balance-history': WalletBalanceHistory;
    }
  }
}
