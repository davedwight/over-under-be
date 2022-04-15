WITH orphan_responses AS (
    SELECT
        R.RESPONSE_ID,
        R.STOCK_SYMBOL,
        R.START_PRICE,
        CASE
            WHEN R.END_PRICE IS NOT NULL THEN R.END_PRICE :: text
            ELSE 'PENDING'
        END AS END_PRICE,
        R.RESPONSE_LENGTH,
        UPPER(R.RESPONSE_VALUE) AS RESPONSE_VALUE,
        R.EXPIRATION_TIME,
        COALESCE('NONE') AS OPPONENT,
        CASE
            WHEN R.END_PRICE > R.START_PRICE
            AND R.RESPONSE_VALUE = 'over' THEN 'WON'
            WHEN R.END_PRICE < R.START_PRICE
            AND R.RESPONSE_VALUE = 'under' THEN 'WON'
            WHEN R.END_PRICE = R.START_PRICE THEN 'TIED'
            WHEN R.END_PRICE IS NULL THEN 'PENDING'
            ELSE 'LOST'
        END AS RESULT
    FROM
        RESPONSES R
        JOIN USERS U ON R.USER_ID = U.USER_ID
    WHERE
        (
            R.USER_ID = ${userId}
            AND R.RESPONSE_ID NOT IN (
                SELECT
                    DISTINCT PRIMARY_RESPONSE_ID
                FROM
                    RESPONSE_PAIRS
            )
            AND R.RESPONSE_ID NOT IN (
                SELECT
                    DISTINCT SECONDARY_RESPONSE_ID
                FROM
                    RESPONSE_PAIRS
            )
        )
),
PRIMARY_RESPONSES AS (
    SELECT
        R.RESPONSE_ID,
        R.USER_ID,
        R.STOCK_SYMBOL,
        R.START_PRICE,
        CASE
            WHEN R.END_PRICE IS NOT NULL THEN R.END_PRICE :: text
            ELSE 'PENDING'
        END AS END_PRICE,
        R.RESPONSE_LENGTH,
        UPPER(R.RESPONSE_VALUE) AS RESPONSE_VALUE,
        R.EXPIRATION_TIME,
        CASE
            WHEN R.END_PRICE > R.START_PRICE
            AND R.RESPONSE_VALUE = 'over' THEN 'WON'
            WHEN R.END_PRICE < R.START_PRICE
            AND R.RESPONSE_VALUE = 'under' THEN 'WON'
            WHEN R.END_PRICE = R.START_PRICE THEN 'TIED'
            WHEN R.END_PRICE IS NULL THEN 'PENDING'
            ELSE 'LOST'
        END AS RESULT,
        RP.SECONDARY_RESPONSE_ID AS OPPONENT_ID
    FROM
        RESPONSE_PAIRS RP
        JOIN RESPONSES R ON RP.PRIMARY_RESPONSE_ID = R.RESPONSE_ID
        JOIN USERS U ON R.USER_ID = U.USER_ID
    WHERE
        R.USER_ID = ${userId}
),
final_primary_responses AS (
    SELECT
        PR.RESPONSE_ID,
        PR.STOCK_SYMBOL,
        PR.START_PRICE,
        PR.END_PRICE,
        PR.RESPONSE_LENGTH,
        PR.RESPONSE_VALUE,
        PR.EXPIRATION_TIME,
        U.PHONE_NUMBER AS OPPONENT,
        PR.RESULT
    FROM
        PRIMARY_RESPONSES PR
        JOIN USERS U ON PR.OPPONENT_ID = U.USER_ID
),
SECONDARY_RESPONSES AS (
    SELECT
        R.RESPONSE_ID,
        R.USER_ID,
        R.STOCK_SYMBOL,
        R.START_PRICE,
        CASE
            WHEN R.END_PRICE IS NOT NULL THEN R.END_PRICE :: text
            ELSE 'PENDING'
        END AS END_PRICE,
        R.RESPONSE_LENGTH,
        UPPER(R.RESPONSE_VALUE) AS RESPONSE_VALUE,
        R.EXPIRATION_TIME,
        CASE
            WHEN R.END_PRICE > R.START_PRICE
            AND R.RESPONSE_VALUE = 'over' THEN 'WON'
            WHEN R.END_PRICE < R.START_PRICE
            AND R.RESPONSE_VALUE = 'under' THEN 'WON'
            WHEN R.END_PRICE = R.START_PRICE THEN 'TIED'
            WHEN R.END_PRICE IS NULL THEN 'PENDING'
            ELSE 'LOST'
        END AS RESULT,
        RP.SECONDARY_RESPONSE_ID AS OPPONENT_ID
    FROM
        RESPONSE_PAIRS RP
        JOIN RESPONSES R ON RP.SECONDARY_RESPONSE_ID = R.RESPONSE_ID
        JOIN USERS U ON R.USER_ID = U.USER_ID
    WHERE
        R.USER_ID = ${userId}
),
final_secondary_responses AS (
    SELECT
        SR.RESPONSE_ID,
        SR.STOCK_SYMBOL,
        SR.START_PRICE,
        SR.END_PRICE,
        SR.RESPONSE_LENGTH,
        SR.RESPONSE_VALUE,
        SR.EXPIRATION_TIME,
        U.PHONE_NUMBER AS OPPONENT,
        SR.RESULT
    FROM
        SECONDARY_RESPONSES SR
        JOIN USERS U ON SR.OPPONENT_ID = U.USER_ID
)
SELECT
    *
FROM
    (
        SELECT
            *
        FROM
            orphan_responses
        UNION
        SELECT
            *
        FROM
            final_primary_responses
        UNION
        SELECT
            *
        FROM
            final_secondary_responses
    ) AS all_responses
ORDER BY
    expiration_time DESC;