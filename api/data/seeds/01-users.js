exports.seed = function (knex) {
    return knex("users").insert([
        { phone_number: "8046789413" },
        { phone_number: "6467840656" },
        { phone_number: "8046789412" },
    ]);
};
