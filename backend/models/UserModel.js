const Joi = require('joi');

class UserModel {
    static #myschema = Joi.object({
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
        created: Joi.date().default(Date.now()).required(),
        isActive: Joi.boolean().default(false),
        showDorm: Joi.boolean().default(false),
        showFloor: Joi.boolean().default(false),
        // securityQuestions: NOT IMPLEMENTED YET- can it be stored with the auth stuff?
    })

    static newValidate(object) {
        const {error, value} = this.#myschema.validate(object);
        if (error) {
            return { error: error.details[0] };
        } else {
            return value;
        }
    };

    static updateValidate(object) {
        let keys = Object.keys(this.#myschema.describe().keys); // Extracts list of keys(fields) in myschema
        let newschema = this.#myschema.fork(keys, (field) => field.optional()) // Make all fields optional
        
        const {error, value} = newschema.validate(object);
        if (error) {
            return { error: error.details[0] };
        } else {
            return value;
        }
    };
}

module.exports = UserModel;