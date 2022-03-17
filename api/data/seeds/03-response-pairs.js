exports.seed = function (knex) {
    return knex("response_pairs").insert([
        {
            primary_response_id: 2,
            secondary_response_id: 3,
        },
    ]);
};
