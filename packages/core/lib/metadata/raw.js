// Generated by CoffeeScript 2.5.1
module.exports = {
  name: '@nikitajs/core/lib/metadata/raw',
  hooks: {
    'nikita:registry:normalize': function(action) {
      var base, base1, base2;
      if (action.metadata == null) {
        action.metadata = {};
      }
      if ((base = action.metadata).raw == null) {
        base.raw = false;
      }
      if ((base1 = action.metadata).raw_input == null) {
        base1.raw_input = action.metadata.raw;
      }
      return (base2 = action.metadata).raw_output != null ? base2.raw_output : base2.raw_output = action.metadata.raw;
    },
    'nikita:session:action': function(action) {
      var base, base1, base2;
      if ((base = action.metadata).raw == null) {
        base.raw = false;
      }
      if ((base1 = action.metadata).raw_input == null) {
        base1.raw_input = action.metadata.raw;
      }
      return (base2 = action.metadata).raw_output != null ? base2.raw_output : base2.raw_output = action.metadata.raw;
    }
  }
};
