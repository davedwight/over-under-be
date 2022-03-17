exports.seed = function (knex) {
    return knex("users").insert([
        { phone: "8046789413" },
        { phone: "6467840656" },
        { phone: "8046789412" },
    ]);
};
