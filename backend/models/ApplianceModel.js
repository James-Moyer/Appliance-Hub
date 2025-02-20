const Joi = require("joi");

class ApplianceModel {
    static schema = Joi.object({
        ownerUsername: Joi.string().max(24).require(),
        name: Joi.string().max(64).require(),
        description: Joi.string().require(),
        timeAvailable: Joi.date().timestamp(),
        lendTo: Joi.string().allow("Same Floor", "Same Building", "Anyone").require(),
        isVisible: Joi.boolean().require(),
        created: Joi.date().require()
    });

    static validate(object) {
        const {error, value} = schema.validate(object);
        if (error) {
            return error;
        } else {
            return value;
        }
    };
};

module.exports = ApplianceModel;