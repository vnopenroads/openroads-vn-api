var UserConfig = {

  tableName: 'cba_user_configs',

  attributes: {
    id: { type: 'integer', primaryKey: true, autoIncrement: true },
    name: { type: 'string' },
    discount_rate: { type: 'float' },
    economic_rate: { type: 'float' },
    created_at: { type: 'datetime', datetime: true },
    updated_at: { type: 'datetime', datetime: true }
  }
};
module.exports = UserConfig