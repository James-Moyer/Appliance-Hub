const Joi = require("joi");

class MessageModel {
  static schema = Joi.object({
    sender: Joi.string().required(),
    recipient: Joi.string().required(),
    text: Joi.string().min(1).max(1000).required(),
    timestamp: Joi.date().timestamp().required()
  });

  static validate(object) {
    const { error, value } = this.schema.validate(object);
    if (error) {
      return { error: error.details[0] };
    } else {
      return value;
    }
  }
}

module.exports = MessageModel;
