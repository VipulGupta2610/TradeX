import axios from "axios";

export const getCandles = async (req, res) => {
  try {
    let symbol = req.params.symbol;
    
    console.log("Original Symbol requested:", symbol);

    // 🌟 THE FIX: TwelveData prefers the generic BTC/USD pair
    if (symbol === "BTCUSDT") {
      symbol = "BTC/USD"; 
    }

    console.log("Formatted Symbol sent to Twelve Data:", symbol);

    const response = await axios.get(
      "https://api.twelvedata.com/time_series",
      {
        params: {
          symbol: symbol,
          interval: "1min", 
          outputsize: 100,
          apikey: process.env.TWELVE_DATA_KEY
        }
      }
    );
console.log(response)
    // Twelve Data sometimes returns 200 OK but includes an error message in the JSON
    if (response.data.status === "error") {
       return res.status(400).json({ error: response.data.message });
    }

    res.json(response.data);

  } catch (error) {
    console.log("TWELVE DATA ERROR");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
}