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

  try {
    const rawBody = await req.json().catch(() => null);
    
    // Debug log
    console.log("Sunucuya ulaşan ham veri:", JSON.stringify(rawBody));

    // Veriyi ayıkla
    const summaryData = rawBody?.summaryData || rawBody;

    if (!summaryData) {
       return new Response(
         JSON.stringify({ error: "Analiz için veri sunucuya ulaşmadı." }), 
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
    }

    // Retrieve Groq API Key
    const API_KEY = Deno.env.get('GROQ_API_KEY')

    if (!API_KEY) {
      throw new Error('GROQ_API_KEY bulunamadı. Lütfen Supabase sırlarına ekleyin.')
    }

    const mode = summaryData.mode || 'general';
    let prompt = "";

    if (mode === 'statement') {
      prompt = `Sen profesyonel bir finansal analistsin. Aşağıda bir kredi kartı ekstresinden çıkarılmış metin bulunmaktadır:
${summaryData.statementText}

Lütfen bu veriyi analiz et ve:
1. En büyük 3 harcamayı belirt.
2. Harcama alışkanlıkları hakkında kısa bir yorum yap.
3. Bir tasarruf önerisi ver.
Cevabın özlü ve samimi olsun. Metin dışında emoji veya işaret ekleme.`;
    } else {
      const totalGelir = summaryData.totalGelir || 0;
      const totalGider = summaryData.totalGider || 0;
      let kategoriOzeti = "";
      if (summaryData.giderKategoriler && Object.keys(summaryData.giderKategoriler).length > 0) {
        kategoriOzeti = Object.entries(summaryData.giderKategoriler)
          .map(([k, v]) => `${k}: ${v} TL`)
          .join(', ');
      }
      prompt = `Şu an yaratıcı bir kişisel finans danışmanısın. Kullanıcının güncel finansal özeti şöyledir:
Toplam Net Mevcut Bakiye: ${summaryData.mevcutBakiye} TL
Son İşlemlerdeki Toplam Gelir: ${totalGelir} TL
Son İşlemlerdeki Toplam Gider: ${totalGider} TL
En çok harcama yapılan kategoriler: ${kategoriOzeti || 'Henüz kategori verisi yok.'}

Senden istenen: SADECE 1 veya en fazla 2 cümlelik, samimi, motive edici ve tamamen finansal durumuna özel nokta atışı bir içgörü, uyarı veya tavsiye mesajı üret. Metin dışında fazladan hiçbir merhabalaşma, emoji, işaret veya açıklama ekleme. Sadece tavsiyeyi ver.`;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Sen özlü ve etkili tavsiyeler veren bir finans danışmanısın." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || "Groq servisine ulaşılamadı.";
      console.error('Groq API Error Detail:', errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || "Mali durumunuzu şu an analiz edemedim."

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
