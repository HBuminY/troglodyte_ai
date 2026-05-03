import { connection } from "next/server";

export async function getLatestCurrency(seriesCode: string = 'TP.DK.USD.A') {
  await connection();
  
  const apiKey = process.env.TCMB_EVDS_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key eksik!");
  }

  // Tarih Formatı: GG-AA-YYYY
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 5); // Güvenli aralık (Bayram/Hafta sonu için)

  const startDate = formatDate(pastDate);
  const endDate = formatDate(today);

  // Dökümantasyondaki güncel URL yapısı
  // authkey parametresi dökümantasyonda belirtilen yöntemdir.
  const baseUrl = 'https://evds2.tcmb.gov.tr/service/evds/';
  // API URL format required without `?` and using headers
  const url = `${baseUrl}series=${seriesCode}&startDate=${startDate}&endDate=${endDate}&type=json`;

  try {
    const response = await fetch(url, {
      headers: {
        key: apiKey
      },
      next: { revalidate: 3600 }, // 1 saat cache
    });

    if (!response.ok) {
      // Returning null directly instead of console.error to avoid console spam due to WAF blocks
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Suppress the console.error here since EVDS WAF commonly blocks cloud IPs and returns HTML
      return null;
    }

    const data = await response.json();

    if (data && data.items && data.items.length > 0) {
      // API çıktı verirken nokta (.) karakterlerini alt tire (_) ile değiştirir.
      const responseKey = seriesCode.replace(/\./g, '_');
      
      // Gelen veriler içinden değeri null olmayan en güncel (son) veriyi al
      const validItems = data.items.filter((item: any) => 
        item[responseKey] !== null && item[responseKey] !== undefined && item[responseKey] !== ""
      );

      if (validItems.length === 0) return null;

      const latestEntry = validItems[validItems.length - 1];

      return {
        tarih: latestEntry.Tarih,
        deger: latestEntry[responseKey],
        seri: seriesCode
      };
    }
    return null;
  } catch (error) {
    console.error("EVDS API Hatası:", error);
    return null;
  }
}