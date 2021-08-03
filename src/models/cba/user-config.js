var UserConfig = {

  tableName: 'cba_user_config',

  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: 'string',
    },
    created_at: {
      type: 'datetime',
      datetime: true
    },
    updated_at: {
      type: 'datetime',
      datetime: true
    }
  }
};
module.exports = UserConfig