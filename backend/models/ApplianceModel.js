const Joi = require("joi");

class ApplianceModel {
    static schema = Joi.object({
        ownerUsername: Joi.string().max(24).required(),
        name: Joi.string().max(64).required(),
        description: Joi.string().required(),
        timeAvailable: Joi.date().timestamp(),
        lendTo: Joi.string().valid("Same Floor", "Same Building", "Anyone").required(),
        isVisible: Joi.boolean().required(),
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

module.exports = ApplianceModel;