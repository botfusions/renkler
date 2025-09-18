# 👤 Admin User Setup Guide - Sanzo Color Advisor

Bu kılavuz, Sanzo Color Advisor projesinde admin kullanıcısı oluşturma ve ilk kurulum adımlarını açıklar.

## 🚀 Hızlı Kurulum

### 1. Environment Variables Ayarlama

`.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

Gerekli değişkenleri doldurun:
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Local Development (optional)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_here
```

### 2. Dependencies Yükleme

```bash
npm install
```

### 3. Supabase Database Kurulumu

#### Option A: Local Supabase (Önerilen)
```bash
# Supabase CLI kurulu olmalı
npm run supabase:start

# Database migrate et
npm run supabase:migrate
```

#### Option B: Cloud Supabase
1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Yeni proje oluşturun
3. SQL Editor'da `supabase/database.sql` dosyasını çalıştırın

### 4. Admin Kullanıcısı Oluşturma

**Otomatik Yöntem (Önerilen):**
```bash
npm run create-admin
```

Bu script şunları oluşturur:
- **Admin User**: `admin@sanzo-color-advisor.com` / `SanzoAdmin2025!`
- **Test User**: `test@sanzo-color-advisor.com` / `TestUser2025!`

**Manuel Yöntem:**
1. Supabase Dashboard > Authentication > Users
2. "Create User" butonuna tıklayın
3. Admin bilgilerini girin:
   - Email: `admin@sanzo-color-advisor.com`
   - Password: `SanzoAdmin2025!`
   - Email Confirm: ✅
4. User oluştuktan sonra `supabase/seed.sql` dosyasındaki profile verisini SQL Editor'da çalıştırın

### 5. Test Data Ekleme (Opsiyonel)

```bash
npm run seed-data
```

## 🔐 Login Bilgileri

### Admin User
- **Email**: `admin@sanzo-color-advisor.com`
- **Password**: `SanzoAdmin2025!`
- **Permissions**: Full admin access

### Test User
- **Email**: `test@sanzo-color-advisor.com`
- **Password**: `TestUser2025!`
- **Permissions**: Standard user access

## 🛠️ Development Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Supabase yerel sunucusunu başlat
npm run supabase:start

# Supabase yerel sunucusunu durdur
npm run supabase:stop

# Database'i sıfırla ve yeniden migrate et
npm run supabase:reset

# Admin kullanıcısını oluştur
npm run create-admin

# Test verilerini ekle
npm run seed-data

# Health check
npm run health
```

## 🧪 Test Etme

### 1. API Test
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sanzo-color-advisor.com",
    "password": "SanzoAdmin2025!"
  }'
```

### 2. Frontend Test
1. Browser'da `http://localhost:3000` adresine gidin
2. Login sayfasında admin bilgileriyle giriş yapın
3. Dashboard'a erişiminiz olmalı

## 🔧 Troubleshooting

### Supabase Connection Error
```bash
# Environment variables'ları kontrol edin
echo $REACT_APP_SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Supabase connection test
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('profiles').select('count').then(console.log);
"
```

### User Creation Failed
```bash
# Service key permissions kontrol edin
# Supabase Dashboard > Settings > API > Service role key

# Manuel olarak user oluşturun
node scripts/create-admin.js
```

### Database Schema Missing
```bash
# Database schema'yı yeniden yükleyin
npm run supabase:reset

# Veya manuel olarak SQL'i çalıştırın
# Supabase Dashboard > SQL Editor > supabase/database.sql dosyasını paste edin
```

## 📋 Verification Checklist

- [ ] Environment variables doğru ayarlandı
- [ ] Supabase connection test edildi
- [ ] Database schema migrate edildi
- [ ] Admin user oluşturuldu ve login test edildi
- [ ] Test user oluşturuldu
- [ ] Seed data yüklendi (opsiyonel)
- [ ] Frontend login test edildi
- [ ] API endpoints test edildi

## 🎯 Next Steps

Admin kurulumu tamamlandıktan sonra:

1. **OAuth Providers** (Opsiyonel):
   - Google OAuth client ID/secret
   - GitHub OAuth client ID/secret

2. **Production Environment**:
   - Production Supabase project
   - Domain ve SSL sertifikası
   - Environment variables production'a taşı

3. **Monitoring**:
   - Error tracking (Sentry)
   - Analytics integration
   - Performance monitoring

## 🆘 Destek

Herhangi bir sorun yaşıyorsanız:

1. Console error'larını kontrol edin
2. Supabase Dashboard > Logs'u inceleyin
3. Network tab'ında API request'lerini kontrol edin
4. Environment variables'ları doğrulayın

**Ready to go!** 🚀 Admin kullanıcınız hazır ve sisteme giriş yapabilirsiniz.