import axios from "axios";

export const getCandles = async (req,res)=>{

 const symbol = req.params.symbol;

 const now = Math.floor(Date.now()/1000);

 const weekAgo = now - (7 * 24 * 60 * 60);

 try{

   const response = await axios.get(
    "https://finnhub.io/api/v1/stock/candle",
    {
      params:{
        symbol,
        resolution:"5",
        from:weekAgo,
        to:now,
        token:process.env.FINNHUB_API_KEY
      }
    }
   );

   res.json(response.data);

 }catch(error){

   console.log(error);

 }

}