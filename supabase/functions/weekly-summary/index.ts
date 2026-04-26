import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

    if (!supabaseServiceRoleKey || !resendApiKey) {
      throw new Error('Gerekli API anahtarları (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY) bulunamadı.')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 1. Tüm kullanıcıları çek
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const results = []

    // Mevcut haftanın başlangıcı (Pazartesi) ve sonu (Pazar)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 (Sun) - 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    for (const user of users.users) {
      // 2. Kullanıcının işlemlerini çek
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

      if (txError) {
        console.error(`Kullanıcı ${user.email} için hata:`, txError)
        continue
      }

      // Bakiye hesapla
      const bakiye = transactions.reduce((acc, curr) => {
        const miktar = parseFloat(curr.miktar) || 0
        return curr.tip === 'gelir' ? acc + miktar : acc - miktar
      }, 0)

      // Bu haftaki ödemeler
      const haftalikOdemeler = transactions.filter(t => {
        const tDate = new Date(t.tarih)
        return t.tip === 'gider' && tDate >= monday && tDate <= sunday
      })

      if (haftalikOdemeler.length === 0 && bakiye === 0) continue

      // 3. E-posta içeriği hazırla
      const odemelerListesi = haftalikOdemeler.length > 0 
        ? `<ul>${haftalikOdemeler.map(t => `<li><strong>${t.aciklama}:</strong> ${t.miktar} TL (${new Date(t.tarih).toLocaleDateString('tr-TR')})</li>`).join('')}</ul>`
        : '<p>Bu hafta yapılması gereken bir ödeme bulunmuyor.</p>'

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0058bc;">Haftalık Finansal Özetiniz</h2>
          <p>Merhaba,</p>
          <p>İşte bu haftaki finansal durumunuzun özeti:</p>
          
          <div style="background: #f4f3f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 14px; color: #414755;">Güncel Net Bakiye</span><br/>
            <strong style="font-size: 24px; color: ${bakiye >= 0 ? '#006e28' : '#ba1a1a'};">${bakiye.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
          </div>

          <h3 style="color: #1a1b1f; border-bottom: 2px solid #0058bc; padding-bottom: 5px;">Bu Haftaki Ödemeler</h3>
          ${odemelerListesi}

          <p style="margin-top: 30px; font-size: 12px; color: #717786;">
            Bu e-posta Finans uygulaması tarafından otomatik olarak oluşturulmuştur.
          </p>
        </div>
      `

      // 4. Resend ile gönder
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Finans <onboarding@resend.dev>',
          to: user.email,
          subject: 'Haftalık Finansal Özetiniz',
          html: emailHtml,
        }),
      })

      const resData = await res.json()
      results.push({ email: user.email, status: res.status, data: resData })
    }

    return new Response(
      JSON.stringify({ message: "İşlem tamamlandı", results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
