const Joi = require("joi");

class RequestModel {
    static schema = Joi.object({
        requesterEmail: Joi.string().email({tlds: {allow: ['edu']}}).required(),
        applianceName: Joi.string().max(64).required(),
        collateral: Joi.boolean().default(false),
        requestDuration: Joi.number().integer().greater(0).required(),
        status: Joi.string().valid("open", "fulfilled", "closed").required(),
        created: Joi.date().required()
    });

    static validate(object) {
        const { error, value } = this.schema.validate(object);  // Fixed "schema" reference
        if (error) {
            return { error: error.details[0] };
        } else {
            return value;
        }
    }
}

module.exports = RequestModel;