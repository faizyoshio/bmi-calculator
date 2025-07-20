"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "id"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Main page
    title: "BMI Calculator",
    subtitle: "Calculate your Body Mass Index",
    gender: "Gender",
    male: "Male",
    female: "Female",
    height: "Height (cm)",
    weight: "Weight (kg)",
    age: "Age (optional)",
    heightPlaceholder: "Enter your height",
    weightPlaceholder: "Enter your weight",
    agePlaceholder: "Enter your age",
    calculateButton: "Calculate BMI",
    calculating: "Calculating your BMI...",
    disclaimer: "BMI is a screening tool and not a diagnostic tool.",
    consultAdvice: "Consult a healthcare professional for medical advice.",

    // Validation messages
    heightRange: "Height should be between 50-300 cm",
    weightRange: "Weight should be between 20-500 kg",
    ageRange: "Age should be between 1-120 years",
    missingInfo: "Missing Information",
    missingInfoDesc: "Please enter both height and weight.",
    invalidInput: "Invalid Input",
    invalidInputDesc: "Please enter valid positive numbers.",
    calculationError: "Calculation Error",
    calculationErrorDesc: "Failed to calculate BMI. Please try again.",

    // Results page
    yourResult: "Your BMI Result",
    loadingResults: "Loading Your Results",
    preparingInsights: "Preparing your personalized health insights...",
    bodyMassIndex: "Body Mass Index",
    bmiRange: "BMI Range",
    healthInsight: "Health Insight",
    personalizedTips: "Personalized Tips for You",
    yourDetails: "Your Details",
    printReport: "Print Report",
    exportPDF: "Export PDF",
    exporting: "Exporting...",

    // BMI Categories
    underweight: "Underweight",
    normal: "Normal",
    overweight: "Overweight",
    obese: "Obese",

    // Units
    cm: "cm",
    kg: "kg",
    years: "years",

    // Health Tips
    healthTips: {
      underweight:
        "Consider consulting a nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods and regular exercise to build muscle mass.",
      normal:
        "Great job! Maintain your healthy weight through balanced nutrition and regular physical activity. Keep up the good work!",
      overweight:
        "Consider adopting a balanced diet and increasing physical activity. Small lifestyle changes can make a big difference in your health.",
      obese:
        "We recommend consulting with a healthcare professional to develop a comprehensive weight management plan. Focus on gradual, sustainable changes.",
    },

    // Personalized Tips
    tips: {
      underweight: [
        "Focus on nutrient-dense, calorie-rich foods like nuts, avocados, and lean proteins to gain healthy weight.",
        "Incorporate strength training exercises 3-4 times per week to build muscle mass rather than just fat.",
        "Eat smaller, frequent meals throughout the day to increase your overall caloric intake.",
        "Consider adding healthy smoothies with protein powder, fruits, and nut butters to your diet.",
      ],
      normal: [
        "Maintain your healthy weight with a balanced diet of 50% vegetables, 25% lean protein, and 25% whole grains.",
        "Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly.",
        "Stay hydrated with 8-10 glasses of water daily and limit processed foods and sugary drinks.",
        "Get 7-9 hours of quality sleep each night to support your metabolism and overall health.",
      ],
      overweight: [
        "Create a moderate caloric deficit of 300-500 calories per day through diet and exercise for sustainable weight loss.",
        "Fill half your plate with non-starchy vegetables, one quarter with lean protein, and one quarter with whole grains.",
        "Incorporate both cardio (30 minutes, 5 days/week) and strength training (2-3 days/week) into your routine.",
        "Practice portion control by using smaller plates and eating slowly to recognize fullness cues.",
      ],
      obese: [
        "Start with small, sustainable changes like replacing sugary drinks with water and taking a 10-minute walk daily.",
        "Focus on whole, unprocessed foods and consider meal prep to avoid impulsive food choices.",
        "Begin with low-impact exercises like swimming, walking, or cycling to protect your joints.",
        "Consider working with a registered dietitian to create a personalized meal plan that fits your lifestyle.",
      ],
    },
  },
  id: {
    // Main page
    title: "Kalkulator BMI",
    subtitle: "Hitung Indeks Massa Tubuh Anda",
    gender: "Jenis Kelamin",
    male: "Pria",
    female: "Wanita",
    height: "Tinggi Badan (cm)",
    weight: "Berat Badan (kg)",
    age: "Usia (opsional)",
    heightPlaceholder: "Masukkan tinggi badan Anda",
    weightPlaceholder: "Masukkan berat badan Anda",
    agePlaceholder: "Masukkan usia Anda",
    calculateButton: "Hitung BMI",
    calculating: "Menghitung BMI Anda...",
    disclaimer: "BMI adalah alat skrining dan bukan alat diagnostik.",
    consultAdvice: "Konsultasikan dengan profesional kesehatan untuk saran medis.",

    // Validation messages
    heightRange: "Tinggi badan harus antara 50-300 cm",
    weightRange: "Berat badan harus antara 20-500 kg",
    ageRange: "Usia harus antara 1-120 tahun",
    missingInfo: "Informasi Kurang",
    missingInfoDesc: "Harap masukkan tinggi dan berat badan.",
    invalidInput: "Input Tidak Valid",
    invalidInputDesc: "Harap masukkan angka positif yang valid.",
    calculationError: "Kesalahan Perhitungan",
    calculationErrorDesc: "Gagal menghitung BMI. Silakan coba lagi.",

    // Results page
    yourResult: "Hasil BMI Anda",
    loadingResults: "Memuat Hasil Anda",
    preparingInsights: "Menyiapkan wawasan kesehatan personal Anda...",
    bodyMassIndex: "Indeks Massa Tubuh",
    bmiRange: "Rentang BMI",
    healthInsight: "Wawasan Kesehatan",
    personalizedTips: "Tips Personal untuk Anda",
    yourDetails: "Detail Anda",
    printReport: "Cetak Laporan",
    exportPDF: "Ekspor PDF",
    exporting: "Mengekspor...",

    // BMI Categories
    underweight: "Kurus",
    normal: "Normal",
    overweight: "Gemuk",
    obese: "Obesitas",

    // Units
    cm: "cm",
    kg: "kg",
    years: "tahun",

    // Health Tips
    healthTips: {
      underweight:
        "Pertimbangkan untuk berkonsultasi dengan ahli gizi untuk mengembangkan rencana penambahan berat badan yang sehat. Fokus pada makanan padat nutrisi dan olahraga teratur untuk membangun massa otot.",
      normal:
        "Kerja bagus! Pertahankan berat badan sehat Anda melalui nutrisi seimbang dan aktivitas fisik teratur. Teruskan!",
      overweight:
        "Pertimbangkan untuk mengadopsi diet seimbang dan meningkatkan aktivitas fisik. Perubahan gaya hidup kecil dapat membuat perbedaan besar dalam kesehatan Anda.",
      obese:
        "Kami merekomendasikan berkonsultasi dengan profesional kesehatan untuk mengembangkan rencana manajemen berat badan yang komprehensif. Fokus pada perubahan bertahap dan berkelanjutan.",
    },

    // Personalized Tips
    tips: {
      underweight: [
        "Fokus pada makanan padat nutrisi dan kalori tinggi seperti kacang-kacangan, alpukat, dan protein tanpa lemak untuk menambah berat badan yang sehat.",
        "Sertakan latihan kekuatan 3-4 kali per minggu untuk membangun massa otot daripada hanya lemak.",
        "Makan dalam porsi kecil dan sering sepanjang hari untuk meningkatkan asupan kalori keseluruhan.",
        "Pertimbangkan menambahkan smoothie sehat dengan protein powder, buah-buahan, dan selai kacang ke dalam diet Anda.",
      ],
      normal: [
        "Pertahankan berat badan sehat dengan diet seimbang 50% sayuran, 25% protein tanpa lemak, dan 25% biji-bijian utuh.",
        "Targetkan minimal 150 menit aktivitas aerobik sedang atau 75 menit aktivitas berat per minggu.",
        "Tetap terhidrasi dengan 8-10 gelas air setiap hari dan batasi makanan olahan dan minuman manis.",
        "Tidur berkualitas 7-9 jam setiap malam untuk mendukung metabolisme dan kesehatan keseluruhan.",
      ],
      overweight: [
        "Buat defisit kalori moderat 300-500 kalori per hari melalui diet dan olahraga untuk penurunan berat badan yang berkelanjutan.",
        "Isi setengah piring dengan sayuran non-tepung, seperempat dengan protein tanpa lemak, dan seperempat dengan biji-bijian utuh.",
        "Sertakan kardio (30 menit, 5 hari/minggu) dan latihan kekuatan (2-3 hari/minggu) dalam rutinitas Anda.",
        "Praktikkan kontrol porsi dengan menggunakan piring yang lebih kecil dan makan perlahan untuk mengenali sinyal kenyang.",
      ],
      obese: [
        "Mulai dengan perubahan kecil yang berkelanjutan seperti mengganti minuman manis dengan air dan berjalan kaki 10 menit setiap hari.",
        "Fokus pada makanan utuh yang tidak diproses dan pertimbangkan meal prep untuk menghindari pilihan makanan impulsif.",
        "Mulai dengan olahraga berdampak rendah seperti berenang, berjalan, atau bersepeda untuk melindungi sendi.",
        "Pertimbangkan bekerja dengan ahli diet terdaftar untuk membuat rencana makan personal yang sesuai dengan gaya hidup Anda.",
      ],
    },
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("bmi-calculator-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "id")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("bmi-calculator-language", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback to English if translation not found
        value = translations.en
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if no translation found
          }
        }
        break
      }
    }

    return typeof value === "string" ? value : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
