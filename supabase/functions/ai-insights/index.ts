import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // supabase/functions/ai-insights/index.ts

  try {
    const rawBody = await req.json().catch(() => null);
    
    // Debug log (Supabase Dashboard Logs'da görünecek)
    console.log("Sunucuya ulaşan ham veri:", JSON.stringify(rawBody));

    // Veriyi ayıkla (summaryData yoksa root objeyi kullan)
    const summaryData = rawBody?.summaryData || rawBody;

    if (!summaryData || (summaryData.mevcutBakiye === undefined && summaryData.totalGelir === undefined)) {
       return new Response(
         JSON.stringify({ error: "Analiz için gerekli finansal veriler (bakiye vb.) sunucuya ulaşmadı." }), 
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
    }

    // Retrieve Gemini API Key from environment variable
    const API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY bulunamadı. Lütfen Supabase sırlarına ekleyin.')
    }

    const totalGelir = summaryData.totalGelir || 0;
    const totalGider = summaryData.totalGider || 0;

    let kategoriOzeti = "";
    if (summaryData.giderKategoriler && Object.keys(summaryData.giderKategoriler).length > 0) {
      kategoriOzeti = Object.entries(summaryData.giderKategoriler)
        .map(([k, v]) => `${k}: ${v} TL`)
        .join(', ');
    }

    const prompt = `Şu an yaratıcı bir kişisel finans danışmanısın. Kullanıcının güncel finansal özeti şöyledir:
Toplam Net Mevcut Bakiye: ${summaryData.mevcutBakiye} TL
Son İşlemlerdeki Toplam Gelir: ${totalGelir} TL
Son İşlemlerdeki Toplam Gider: ${totalGider} TL
En çok harcama yapılan kategoriler: ${kategoriOzeti || 'Henüz kategori verisi yok.'}

Senden istenen: SADECE 1 veya en fazla 2 cümlelik, samimi, motive edici ve tamamen finansal durumuna özel nokta atışı bir içgörü, uyarı veya tavsiye mesajı üret. (Örn: "Dışarıda yemeye epey bütçe harcamışsınız, biraz mutfağa dönme vakti!" veya "Giderleriniz gelirinizi aşıyor, tasarruf yapmayı ihmal etmeyin." gibi). Metin dışında fazladan hiçbir merhabalaşma, emoji, işaret veya açıklama ekleme. Sadece tavsiyeyi ver.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || "Gemini servisine ulaşılamadı.";
      console.error('Gemini API Error Detail:', errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json()
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mali durumunuzu şu an analiz edemedim."

    return new Response(
      JSON.stringify({ insight: aiMessage.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error('Function Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
