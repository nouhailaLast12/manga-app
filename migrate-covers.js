import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import ws from 'ws';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ الخطأ: خص ضروري تكون الـ URL و Service Role Key في ملف .env");
  process.exit(1);
}

// تمرير خيار الـ transport لحل مشكلة WebSocket في Node 20
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function migrateCovers() {
  console.log("🚀 جاري جلب المانغا من MangaDex...");
  
  try {
    // جلب قائمة المانغا مع الـ cover_art من MangaDex API
    const response = await fetch('https://api.mangadex.org/manga?limit=20&includes[]=cover_art');
    const data = await response.json();
    
    if (!data || !data.data) {
      console.error("❌ فشل الجلب من MangaDex API");
      return;
    }

    for (const manga of data.data) {
      const mangaId = manga.id;
      const mangaTitle = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown';
      
      // إيجاد العلاقة ديال الـ cover_art
      const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
      if (!coverRel) {
        console.log(`⚠️ ماكاينش كفر لهذه المانغا: ${mangaTitle}`);
        continue;
      }

      // جلب اسم ملف الصورة الحقيقي من ملقمات MangaDex
      const coverRes = await fetch(`https://api.mangadex.org/cover/${coverRel.id}`);
      const coverData = await coverRes.json();
      
      if (!coverData || !coverData.data) continue;

      const fileName = coverData.data.attributes.fileName;
      // رابط الصورة المصغرة
      const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
      
      console.log(`📥 جاري تحميل كفر المانغا: ${mangaTitle}...`);
      
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        console.log(`⚠️ فشل تحميل الصورة لـ ${mangaTitle}`);
        continue;
      }

      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const storagePath = `${mangaId}.jpg`;

      // الرفع إلى Supabase Storage Bucket ("covers")
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(storagePath, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`❌ خطأ في الرفع لـ ${mangaTitle}:`, uploadError.message);
      } else {
        // الحصول على الرابط العام (Public URL)
        const { data: publicUrlData } = supabase.storage
          .from('covers')
          .getPublicUrl(storagePath);
          
        console.log(`✅ تم بنجاح رفع: ${mangaTitle} ➔ ${publicUrlData.publicUrl}`);
      }
    }

    console.log("🎉 سالات عملية الهجرة (Migration) بنجاح تام!");
  } catch (err) {
    console.error("❌ وقع خطأ غير متوقع:", err);
  }
}

migrateCovers();