import { connection } from "next/server";
const tcmbCurrency = require("tcmb-doviz-api");

export async function getLatestCurrency() {
 const result = await tcmbCurrency.getCurrency("USD");
 return result;
}