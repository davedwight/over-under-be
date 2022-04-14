const Responses = require("./responses-model");
const axios = require("axios");

let responsesArr = [];

const getStockData = (stockSymbol, index) => {
    axios
        .get(
            `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=sandbox_c8ct8raad3i9nv0d14tg`
        )
        .then((res) => {
            const end_price = parseFloat(res.data.c.toFixed(2));

            responsesArr[index] = {
                ...responsesArr[index],
                end_price,
            };
            Responses.addEndPrice(
                responsesArr[index].response_id,
                responsesArr[index].end_price
            );
        })
        .catch((err) => console.error(err));
};

function setEndPrices() {
    Responses.getExpiredResponses()
        .then((responses) => {
            if (responses.length > 0) {
                responsesArr = responses;
                responses.map((response, index) => {
                    getStockData(response.stock_symbol, index);
                });
            }
        })
        .catch((err) => console.error(err));
}

module.exports = {
    setEndPrices,
};
