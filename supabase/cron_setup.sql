-- 1. pg_cron eklentisini etkinleştir (Eğer etkin değilse)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Mevcut bir job varsa temizle (isteğe bağlı)
-- SELECT cron.unschedule('weekly-summary-job');

-- 3. Her Pazartesi sabah 09:00'da çalışacak job'ı oluştur
-- Not: URL kısmını kendi Supabase proje URL'niz ile güncelleyin.
-- Not: anon anahtarı yerine Service Role anahtarı kullanılması daha güvenlidir veya fonksiyonun auth gereksinimlerini düzenleyin.

SELECT cron.schedule(
  'weekly-summary-job',
  '0 9 * * 1', -- Her Pazartesi saat 09:00 (UTC)
  $$
  SELECT
    net.http_post(
      url:='https://xzcimebxlsgjksqsawmt.supabase.co/functions/v1/weekly-summary',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y2ltZWJ4bHNnamtzcXNhd210Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MTY5MSwiZXhwIjoyMDkyMTE3NjkxfQ.479a2F62si87ruY33dcue_D1mB_xVJYElA4TYsC4Qzw"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ÖNEMLİ NOTLAR:
-- 1. 'YOUR_SERVICE_ROLE_KEY' kısmını Supabase Dashboard > Settings > API kısmındaki service_role (secret) anahtarı ile değiştirin.
-- 2. Zaman dilimi UTC'dir. Türkiye saati (GMT+3) için '0 6 * * 1' kullanabilirsiniz.
-- 3. pg_net eklentisinin kurulu olduğundan emin olun (Genelde Supabase'de varsayılan olarak gelir).
