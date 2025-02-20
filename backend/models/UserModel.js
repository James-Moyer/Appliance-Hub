const Joi = require('joi');

class UserModel {
    static schema = Joi.object({
        username: Joi.string().max(24).required(), // Max 24 chars, we can change this
        email: Joi.string().email({tlds: {allow: ['edu']}}).required(),
        location: Joi.string().valid("Sandburg East", "Sandburg North", "Sandburg South", "Sandburg West").required(), // Just Sandburg for now
        floor: Joi.number().greater(0).when('location', { // Different max floor depending on building, numbers taken from wikipedia
    						    switch: [
                                      {is: 'Sandburg East', then: Joi.number().less(18)},
                                      {is: 'Sandburg North', then: Joi.number().less(27)},
                                      {is: 'Sandburg South', then: Joi.number().less(21)},
                                      {is: 'Sandburg West', then: Joi.number().less(17)}
                                      ]}).required(),
        // profilePicture: NOT IMPLEMENTED YET- we can just have default pictures for now since pfps require firebase cloud storage
        created: Joi.date().required(),
        isActive: Joi.boolean(),
        showDorm: Joi.boolean(),
        showFloor: Joi.boolean(),
        // securityQuestions: NOT IMPLEMENTED YET- can it be stored with the auth stuff?
    })

    static validate(object) {
        const {error, value} = schema.validate(object);
        if (error) {
            return error;
        } else {
            return value;
        }
    };
}

module.exports = UserModel;