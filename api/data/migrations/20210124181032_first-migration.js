exports.up = async (knex) => {
    await knex.schema
        .createTable("users", (users) => {
            users.increments("user_id");
            users.string("phone_number", 200).notNullable();
            users.timestamps(false, true);
        })
        .createTable("responses", (table) => {
            table.increments("response_id");
            table
                .integer("user_id")
                .unsigned()
                .notNullable()
                .references("user_id")
                .inTable("users")
                .onDelete("RESTRICT")
                .onUpdate("RESTRICT");
            table.string("stock_symbol", 50).notNullable();
            table.string("stock_name", 300).notNullable();
            table.float("current_price").notNullable();
            table.string("response_value").notNullable();
            table.integer("response_length").unsigned().notNullable();
            table.timestamp("expiration_time").notNullable();
            table.timestamp("created_at").notNullable();
        })
        .createTable("response_pairs", (table) => {
            table.increments("response_pair_id");
            table
                .integer("primary_response_id")
                .unsigned()
                .notNullable()
                .references("response_id")
                .inTable("responses")
                .onDelete("RESTRICT")
                .onUpdate("RESTRICT");
            table
                .integer("secondary_response_id")
                .unsigned()
                .notNullable()
                .references("response_id")
                .inTable("responses")
                .onDelete("RESTRICT")
                .onUpdate("RESTRICT");
        });
};

exports.down = async (knex) => {
    await knex.schema
        .dropTableIfExists("response_pairs")
        .dropTableIfExists("responses")
        .dropTableIfExists("users");
};
