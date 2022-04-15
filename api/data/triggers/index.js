function onResponseUpdateFunction() {
    return `CREATE FUNCTION RESPONSES_NOTIFY_TRIGGER() RETURNS TRIGGER AS $$
      DECLARE
      BEGIN
        PERFORM pg_notify('update_notification', row_to_json(new) :: text);
        RETURN new;
      END;
      $$ LANGUAGE PLPGSQL;`;
}

function onResponseUpdateTrigger() {
    return `CREATE TRIGGER RESPONSES_UPDATE_TRIGGER AFTER
      UPDATE ON RESPONSES
      FOR EACH ROW EXECUTE PROCEDURE RESPONSES_NOTIFY_TRIGGER();`;
}

function onResponsePairsInsertFunction() {
    return `CREATE FUNCTION RESPONSE_PAIRS_NOTIFY_TRIGGER() RETURNS TRIGGER AS $$
      DECLARE
      BEGIN
        PERFORM pg_notify('update_notification', row_to_json(new) :: text);
        RETURN new;
      END;
      $$ LANGUAGE PLPGSQL;`;
}
function onResponsePairsInsertTrigger() {
    return `CREATE TRIGGER RESPONSE_PAIRS_UPDATE_TRIGGER AFTER
      INSERT ON RESPONSE_PAIRS
      FOR EACH ROW EXECUTE PROCEDURE RESPONSE_PAIRS_NOTIFY_TRIGGER();`;
}

function dropOnResponseUpdateTrigger() {
    return `
    DROP TRIGGER IF EXISTS RESPONSES_UPDATE_TRIGGER ON RESPONSES CASCADE;
    DROP FUNCTION IF EXISTS RESPONSES_NOTIFY_TRIGGER();
    `;
}

function dropOnResponsePairsInsertTrigger() {
    return `
    DROP TRIGGER IF EXISTS RESPONSE_PAIRS_UPDATE_TRIGGER ON RESPONSE_PAIRS CASCADE;
    DROP FUNCTION IF EXISTS RESPONSE_PAIRS_NOTIFY_TRIGGER();
    `;
}

module.exports = {
    onResponseUpdateFunction,
    onResponseUpdateTrigger,
    onResponsePairsInsertTrigger,
    onResponsePairsInsertFunction,
    dropOnResponseUpdateTrigger,
    dropOnResponsePairsInsertTrigger,
};
