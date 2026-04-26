# Haftalık Özet E-posta Altyapısı

Her Pazartesi sabahı kullanıcılara mevcut bakiyelerini ve o haftaki ödemelerini bildiren sistem hazırlandı.

## Bileşenler

### 1. Edge Function: `weekly-summary`
[supabase/functions/weekly-summary/index.ts](file:///c:/Users/fatih/Antigravity/Finans/supabase/functions/weekly-summary/index.ts)
- Tüm kullanıcıları tarar.
- Her kullanıcı için bakiye ve o haftanın (Pazartesi-Pazar) ödemelerini hesaplar.
- **Resend** üzerinden HTML formatında özet e-postası gönderir.

### 2. SQL Zamanlayıcı: `pg_cron`
[supabase/cron_setup.sql](file:///c:/Users/fatih/Antigravity/Finans/supabase/cron_setup.sql)
- Her Pazartesi saat 09:00'da yukarıdaki fonksiyonu otomatik olarak tetikler.

## Kurulum Adımları

Sistemin çalışması için aşağıdaki adımları tamamlamanız gerekmektedir:

1.  **API Anahtarlarını Ayarlayın:**
    Supabase Dashboard > Settings > Edge Functions > Secrets kısmına şu iki anahtarı ekleyin:
    -   `RESEND_API_KEY`: Resend.com üzerinden alacağınız API anahtarı.
    -   `SUPABASE_SERVICE_ROLE_KEY`: Supabase Settings > API kısmındaki `service_role` anahtarı.

2.  **SQL Scriptini Çalıştırın:**
    [cron_setup.sql](file:///c:/Users/fatih/Antigravity/Finans/supabase/cron_setup.sql) dosyasındaki içeriği kopyalayıp Supabase Dashboard > SQL Editor kısmında çalıştırın.
    > [!IMPORTANT]
    > Script içindeki `YOUR_SERVICE_ROLE_KEY` kısmını kendi anahtarınızla değiştirmeyi unutmayın.

3.  **Fonksiyonu Dağıtın (Deploy):**
    Terminalde şu komutu çalıştırarak fonksiyonu canlıya alın:
    ```bash
    npx supabase functions deploy weekly-summary
    ```

## Örnek E-posta İçeriği
E-posta şık bir tasarımla şu bilgileri içerecektir:
- **Güncel Net Bakiye** (Pozitifse yeşil, negatifse kırmızı).
- **Bu Haftaki Ödemeler Listesi** (Açıklama, tutar ve tarih ile birlikte).
