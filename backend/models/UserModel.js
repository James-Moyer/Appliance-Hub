const Joi = require('joi');

class UserModel {
    static schema = Joi.object({
        username: Joi.string().max(24).require(), // Max 24 chars, we can change this
        email: Joi.string().email().require(),
        location: Joi.string().valid("Sandburg East", "Sandburg North", "Sandburg South", "Sandburg West").require(), // Just Sandburg for now
        floor: Joi.number().greater(0).require().when('location', { // Different max floor depending on building
    						    switch: [
                                      {is: 'Sandburg East', then: Joi.number().less(17)},
                                      {is: 'Sandburg North', then: Joi.number().less(26)},
                                      {is: 'Sandburg South', then: Joi.number().less(20)},
                                      {is: 'Sandburg West', then: Joi.number().less(16)}
                                      ]}),
        // profilePicture: NOT IMPLEMENTED YET
        created: Joi.date().require(),
        isActive: Joi.boolean(),
        showDorm: Joi.boolean(),
        showFloor: Joi.boolean(),
        // securityQuestions: NOT IMPLEMENTED YET
    })
}