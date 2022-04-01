exports.seed = function (knex) {
    return knex("users").insert([
        { phone_number: "+18046789414" },
        { phone_number: "+16467840656" },
        { phone_number: "+18046789412" },
    ]);
};
