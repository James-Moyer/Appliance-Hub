const Joi = require('joi');

class UserModel {
    static schema = Joi.object({
        username: Joi.string().max(24).require(), // Max 24 chars, we can change this
        email: Joi.string().email({tlds: {allow: ['edu']}}).require(),
        location: Joi.string().valid("Sandburg East", "Sandburg North", "Sandburg South", "Sandburg West").require(), // Just Sandburg for now
        floor: Joi.number().greater(0).when('location', { // Different max floor depending on building
    						    switch: [
                                      {is: 'Sandburg East', then: Joi.number().less(17)},
                                      {is: 'Sandburg North', then: Joi.number().less(26)},
                                      {is: 'Sandburg South', then: Joi.number().less(20)},
                                      {is: 'Sandburg West', then: Joi.number().less(16)}
                                      ]}).require(),
        // profilePicture: NOT IMPLEMENTED YET- we can just have default pictures for now since pfps require firebase cloud storage
        created: Joi.date().require(),
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