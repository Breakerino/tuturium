import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async wipeData(ctx) {
    const tables = [
      // Links
      'components_receipt_items_product_links',
      'receipts_store_links',
			'receipts_user_links',
      //'categories_parent_links',
      'products_categories_links',
			'products_origin_store_links',
			'components_product_price_histories_store_links',
			'transactions_category_links',
			//'transactions_label_links',
			'transactions_labels_links', // # TEMP
			'transactions_receipt_links',
			'transactions_wallet_links',
      
      // Content type component
      'products_components',
      'receipts_components',
      //#'stores_components',
			'transactions_components',
      
      // Components
      'components_receipt_items',
      'components_receipt_taxes',
      'components_store_organizations',
			'components_transaction_bank_accounts',
			'components_product_price_histories',
			'components_product_alternative_names',
      
      // Content types
      //'categories',
      'products',
      'receipts',
      //#'stores',
			'transactions'
    ];

		// @ts-ignore
    const knex = strapi.db.connection;

    try {
      await knex.transaction(async (trx) => {
        // Disable foreign key checks
        await trx.raw('SET FOREIGN_KEY_CHECKS = 0');

        // Clear data from tables
        for (const table of tables) {
          await trx(table).truncate();
        }

        // Reset auto-increment values for tables
        for (const table of tables) {
          await trx.raw(`ALTER TABLE ?? AUTO_INCREMENT = 1`, [table]);
        }

        // Enable foreign key checks
        await trx.raw('SET FOREIGN_KEY_CHECKS = 1');
      });

      ctx.send({ message: `Successfully wiped data for tables:\n${tables.join('\n')}` });
    } catch (error) {
      ctx.send({
        message: `An error occurred while wiping data: ${error.message}`
      }, 500);
    }
  }
});