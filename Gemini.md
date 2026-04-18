React, Tailwind ve Supabase ile tek sayfa finans MVP'si yap.
**Bölümler:**
1. **Üst:** Dev "Net Bakiye" + "Kritik Uyarı" Kartı (Örn: Yaklaşan Kira).
2. **Orta:** Hızlı Ekle (Tutar, Açıklama) + "Tekrarlı" Toggle + Ekle.
3. **Alt:** "AI Danışman" UI (Statik öneri) + Açılır Geçmiş Listesi.
**Veri (Supabase):** `transactions` tablosu kullan: `{id, miktar, aciklama, tip(gelir/gider), tekrarli, tarih}`. Verileri DB'den çek, ekle ve bakiyeyi anlık hesapla.
**Stil:** Minimalist, beyaz alan, Lucide.