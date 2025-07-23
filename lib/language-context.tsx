"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "id"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, options?: { [key: string]: any }) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Main page
    title: "BMI Calculator",
    subtitle: "Calculate your Body Mass Index",
    name: "Your Name",
    namePlaceholder: "Enter your name (optional)",
    optional: "optional",
    gender: "Gender",
    male: "Male",
    female: "Female",
    height: "Height",
    weight: "Weight",
    age: "Age (optional)",
    heightPlaceholder: "Enter your height",
    weightPlaceholder: "Enter your weight",
    agePlaceholder: "Enter your age",
    calculateButton: "Calculate BMI",
    calculating: "Calculating your BMI...",
    disclaimer: "BMI is a screening tool and not a diagnostic tool.",
    consultAdvice: "Consult a healthcare professional for medical advice.",
    personalizedFor: "Personalized for",
    welcomeMessage: "Welcome!",
    dataStoredMessage: "Hello {name}! Your data has been securely stored.",
    view_database: "View Database",
    select_gender: "Select Gender",
    other: "Other",
    your_name: "Your Name",
    height_cm: "Height (cm)",
    weight_kg: "Weight (kg)",
    error: "Error",
    please_fill_all_fields: "Please fill all required fields.",
    please_enter_valid_numbers: "Please enter valid positive numbers.",
    failed_to_calculate_bmi: "Failed to calculate BMI.",
    failed_to_calculate_bmi_try_again: "Failed to calculate BMI. Please try again.",
    success: "Success",
    enter_your_details: "Enter your details",

    // Validation messages
    nameRange: "Name must be between 2-50 characters",
    nameFormat: "Name can only contain letters and spaces",
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
    your_bmi_result: "Your BMI Result",
    loadingResults: "Loading Your Results",
    preparingInsights: "Preparing your personalized health insights...",
    bodyMassIndex: "Body Mass Index",
    bmiRange: "BMI Range",
    healthInsight: "Health Insight",
    personalizedTips: "Personalized Tips for You",
    yourDetails: "Your Details",
    printReport: "Print Report",
    completed: "completed",
    allCategories: "All",
    diet: "Diet",
    exercise: "Exercise",
    lifestyle: "Lifestyle",
    medical: "Medical",
    high: "High",
    medium: "Medium",
    low: "Low",
    markComplete: "Mark Complete",
    markIncomplete: "Undo",
    findProfessional: "Find Professional",
    progressSummary: "Your Progress",
    your_bmi_is: "Your BMI is",
    which_is: "Which is",
    recalculate_bmi: "Recalculate BMI",
    health_tip: "Health Tip",
    no_specific_health_tip: "No specific health tip available for this category.",
    unknown: "Unknown",

    // BMI Categories
    underweight: "Underweight",
    normal_weight: "Normal Weight",
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

    // Enhanced Personalized Tips
    tips: {
      underweight: {
        nutrition: {
          title: "Increase Caloric Intake with Nutrient-Dense Foods",
          desc: "Focus on healthy fats like avocados, nuts, and olive oil. Add protein-rich foods like lean meats, fish, and legumes to every meal.",
        },
        exercise: {
          title: "Build Muscle with Strength Training",
          desc: "Incorporate resistance exercises 3-4 times per week. Focus on compound movements like squats, deadlifts, and bench press to build overall muscle mass.",
        },
        meals: {
          title: "Eat More Frequent, Smaller Meals",
          desc: "Aim for 5-6 smaller meals throughout the day instead of 3 large ones. This helps increase overall caloric intake without feeling overly full.",
        },
      },
      normal: {
        maintain: {
          title: "Maintain Your Healthy Weight",
          desc: "Continue your current healthy habits. Focus on a balanced diet with 50% vegetables, 25% lean protein, and 25% whole grains.",
        },
        exercise: {
          title: "Stay Active with Regular Exercise",
          desc: "Aim for 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus 2 days of strength training.",
        },
        hydration: {
          title: "Stay Properly Hydrated",
          desc: "Drink 8-10 glasses of water daily. Limit sugary drinks and alcohol. Proper hydration supports metabolism and overall health.",
        },
      },
      overweight: {
        deficit: {
          title: "Create a Sustainable Caloric Deficit",
          desc: "Aim for a moderate deficit of 300-500 calories per day through a combination of diet and exercise for healthy weight loss.",
        },
        portions: {
          title: "Practice Mindful Portion Control",
          desc: "Use smaller plates, eat slowly, and listen to hunger cues. Fill half your plate with vegetables, quarter with protein, quarter with whole grains.",
        },
        cardio: {
          title: "Incorporate Regular Cardio Exercise",
          desc: "Start with 30 minutes of moderate cardio 5 days per week. Walking, swimming, or cycling are excellent low-impact options.",
        },
      },
      obese: {
        gradual: {
          title: "Start with Small, Sustainable Changes",
          desc: "Begin with simple swaps like water instead of sugary drinks, and take a 10-minute walk daily. Gradual changes are more sustainable.",
        },
        professional: {
          title: "Consult Healthcare Professionals",
          desc: "Work with a doctor, registered dietitian, or certified trainer to create a safe, personalized weight management plan.",
        },
        lowimpact: {
          title: "Begin with Low-Impact Exercise",
          desc: "Start with gentle activities like walking, swimming, or chair exercises to protect joints while building fitness gradually.",
        },
      },
      female: {
        title: "Women's Health Considerations",
        desc: "Ensure adequate iron and calcium intake. Consider hormonal factors that may affect weight management, especially during menstrual cycles.",
      },
      youngAdult: {
        title: "Build Healthy Habits Early",
        desc: "Your metabolism is naturally higher at your age. Focus on establishing sustainable healthy habits that will benefit you long-term.",
      },
      matureAdult: {
        title: "Age-Appropriate Exercise Focus",
        desc: "Include resistance training to combat age-related muscle loss and maintain bone density. Consider joint-friendly exercises.",
      },
    },

    // Database page specific
    back: "Back",
    database_title: "BMI Calculator Database",
    database_description: "View and manage BMI calculation records stored in the database",
    refresh: "Refresh",
    debug_information: "Debug Information",
    total_records: "Total Records",
    applied_filters: "Applied Filters",
    gender_stats: "Gender Stats",
    database_filters: "Database Filters",
    search_name: "Search Name",
    search_by_name_placeholder: "Search by name...",
    bmi_category: "BMI Category",
    all_categories: "All categories",
    all_genders: "All genders",
    clear_all_filters: "Clear All Filters",
    export_json: "Export JSON",
    export_csv: "Export CSV",
    showing_records: "Showing {count} of {total} database records",
    records_per_page: "Records per page",
    lastCalculation: "Last Calculation",
    no_database_records_found: "No database records found",
    clear_filters: "Clear Filters",
    page_of_total: "Page {currentPage} of {totalPages}",
    database_error: "Database Error",
    failed_to_fetch_database_content: "Failed to fetch database content",
    export_successful: "Export Successful",
    data_exported_as: "Data exported as {format}",
    export_failed: "Export Failed",
    failed_to_export_database_content: "Failed to export database content",
  },
  id: {
    // Main page
    title: "Kalkulator BMI",
    subtitle: "Hitung Indeks Massa Tubuh Anda",
    name: "Nama Anda",
    namePlaceholder: "Masukkan nama Anda (opsional)",
    optional: "opsional",
    gender: "Jenis Kelamin",
    male: "Pria",
    female: "Wanala",
    height: "Tinggi Badan",
    weight: "Berat Badan",
    age: "Usia (opsional)",
    heightPlaceholder: "Masukkan tinggi badan Anda",
    weightPlaceholder: "Masukkan berat badan Anda",
    agePlaceholder: "Masukkan usia Anda",
    calculateButton: "Hitung BMI",
    calculating: "Menghitung BMI Anda...",
    disclaimer: "BMI adalah alat skrining dan bukan alat diagnostik.",
    consultAdvice: "Konsultasikan dengan profesional kesehatan untuk saran medis.",
    personalizedFor: "Dipersonalisasi untuk",
    welcomeMessage: "Selamat datang!",
    dataStoredMessage: "Halo {name}! Data Anda telah disimpan dengan aman.",
    view_database: "Lihat Database",
    select_gender: "Pilih Jenis Kelamin",
    other: "Lainnya",
    your_name: "Nama Anda",
    height_cm: "Tinggi Badan (cm)",
    weight_kg: "Berat Badan (kg)",
    error: "Kesalahan",
    please_fill_all_fields: "Harap isi semua kolom yang wajib diisi.",
    please_enter_valid_numbers: "Harap masukkan angka positif yang valid.",
    failed_to_calculate_bmi: "Gagal menghitung BMI.",
    failed_to_calculate_bmi_try_again: "Gagal menghitung BMI. Silakan coba lagi.",
    success: "Berhasil",
    enter_your_details: "Masukkan detail Anda",

    // Validation messages
    nameRange: "Nama harus antara 2-50 karakter",
    nameFormat: "Nama hanya boleh berisi huruf dan spasi",
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
    your_bmi_result: "Hasil BMI Anda",
    loadingResults: "Memuat Hasil Anda",
    preparingInsights: "Menyiapkan wawasan kesehatan personal Anda...",
    bodyMassIndex: "Indeks Massa Tubuh",
    bmiRange: "Rentang BMI",
    healthInsight: "Wawasan Kesehatan",
    personalizedTips: "Tips Personal untuk Anda",
    yourDetails: "Detail Anda",
    printReport: "Cetak Laporan",
    completed: "selesai",
    allCategories: "Semua",
    diet: "Diet",
    exercise: "Olahraga",
    lifestyle: "Gaya Hidup",
    medical: "Medis",
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah",
    markComplete: "Tandai Selesai",
    markIncomplete: "Batal",
    findProfessional: "Cari Profesional",
    progressSummary: "Kemajuan Anda",
    your_bmi_is: "BMI Anda adalah",
    which_is: "Yang termasuk",
    recalculate_bmi: "Hitung Ulang BMI",
    health_tip: "Tips Kesehatan",
    no_specific_health_tip: "Tidak ada tips kesehatan spesifik untuk kategori ini.",
    unknown: "Tidak Diketahui",

    // BMI Categories
    underweight: "Kurus",
    normal_weight: "Berat Badan Normal",
    overweight: "Berat Badan Berlebih",
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

    // Enhanced Personalized Tips
    tips: {
      underweight: {
        nutrition: {
          title: "Tingkatkan Asupan Kalori dengan Makanan Bergizi",
          desc: "Fokus pada lemak sehat seperti alpukat, kacang-kacangan, dan minyak zaitun. Tambahkan makanan kaya protein seperti daging tanpa lemak, ikan, dan kacang-kacangan di setiap makan.",
        },
        exercise: {
          title: "Bangun Otot dengan Latihan Kekuatan",
          desc: "Sertakan latihan resistensi 3-4 kali per minggu. Fokus pada gerakan compound seperti squat, deadlift, dan bench press untuk membangun massa otot keseluruhan.",
        },
        meals: {
          title: "Makan Lebih Sering dengan Porsi Kecil",
          desc: "Targetkan 5-6 makan kecil sepanjang hari daripada 3 makan besar. Ini membantu meningkatkan asupan kalori keseluruhan tanpa merasa terlalu kenyang.",
        },
      },
      normal: {
        maintain: {
          title: "Pertahankan Berat Badan Sehat Anda",
          desc: "Lanjutkan kebiasaan sehat Anda saat ini. Fokus pada diet seimbang dengan 50% sayuran, 25% protein tanpa lemak, dan 25% biji-bijian utuh.",
        },
        exercise: {
          title: "Tetap Aktif dengan Olahraga Teratur",
          desc: "Targetkan 150 menit aktivitas aerobik sedang atau 75 menit aktivitas berat mingguan, plus 2 hari latihan kekuatan.",
        },
        hydration: {
          title: "Tetap Terhidrasi dengan Baik",
          desc: "Minum 8-10 gelas air setiap hari. Batasi minuman manis dan alkohol. Hidrasi yang tepat mendukung metabolisme dan kesehatan keseluruhan.",
        },
      },
      overweight: {
        deficit: {
          title: "Buat Defisit Kalori yang Berkelanjutan",
          desc: "Targetkan defisit moderat 300-500 kalori per hari melalui kombinasi diet dan olahraga untuk penurunan berat badan yang sehat.",
        },
        portions: {
          title: "Praktikkan Kontrol Porsi yang Mindful",
          desc: "Gunakan piring yang lebih kecil, makan perlahan, dan dengarkan sinyal lapar. Isi setengah piring dengan sayuran, seperempat dengan protein, seperempat dengan biji-bijian utuh.",
        },
        cardio: {
          title: "Sertakan Olahraga Kardio Teratur",
          desc: "Mulai dengan 30 menit kardio sedang 5 hari per minggu. Jalan kaki, berenang, atau bersepeda adalah pilihan low-impact yang sangat baik.",
        },
      },
      obese: {
        gradual: {
          title: "Mulai dengan Perubahan Kecil yang Berkelanjutan",
          desc: "Mulai dengan penggantian sederhana seperti air daripada minuman manis, dan jalan kaki 10 menit setiap hari. Perubahan bertahap lebih berkelanjutan.",
        },
        professional: {
          title: "Konsultasi dengan Profesional Kesehatan",
          desc: "Bekerja dengan dokter, ahli diet terdaftar, atau pelatih bersertifikat untuk membuat rencana manajemen berat badan yang aman dan personal.",
        },
        lowimpact: {
          title: "Mulai dengan Olahraga Low-Impact",
          desc: "Mulai dengan aktivitas lembut seperti jalan kaki, berenang, atau latihan kursi untuk melindungi sendi sambil membangun kebugaran secara bertahap.",
        },
      },
      female: {
        title: "Pertimbangan Kesehatan Wanita",
        desc: "Pastikan asupan zat besi dan kalsium yang cukup. Pertimbangkan faktor hormonal yang dapat mempengaruhi manajemen berat badan, terutama selama siklus menstruasi.",
      },
      youngAdult: {
        title: "Bangun Kebiasaan Sehat Sejak Dini",
        desc: "Metabolisme Anda secara alami lebih tinggi di usia Anda. Fokus pada membangun kebiasaan sehat berkelanjutan yang akan menguntungkan Anda jangka panjang.",
      },
      matureAdult: {
        title: "Fokus Olahraga yang Sesuai Usia",
        desc: "Sertakan latihan resistensi untuk melawan kehilangan otot terkait usia dan menjaga kepadatan tulang. Pertimbangkan olahraga yang ramah sendi.",
      },
    },

    // Database page specific
    back: "Kembali",
    database_title: "Database Kalkulator BMI",
    database_description: "Lihat dan kelola catatan perhitungan BMI yang tersimpan di database",
    refresh: "Segarkan",
    debug_information: "Informasi Debug",
    total_records: "Total Catatan",
    applied_filters: "Filter yang Diterapkan",
    gender_stats: "Statistik Jenis Kelamin",
    database_filters: "Filter Database",
    search_name: "Cari Nama",
    search_by_name_placeholder: "Cari berdasarkan nama...",
    bmi_category: "Kategori BMI",
    all_categories: "Semua kategori",
    all_genders: "Semua jenis kelamin",
    clear_all_filters: "Hapus Semua Filter",
    export_json: "Ekspor JSON",
    export_csv: "Ekspor CSV",
    showing_records: "Menampilkan {count} dari {total} catatan database",
    records_per_page: "Catatan per halaman",
    lastCalculation: "Perhitungan Terakhir",
    no_database_records_found: "Tidak ada catatan database ditemukan",
    clear_filters: "Hapus Filter",
    page_of_total: "Halaman {currentPage} dari {totalPages}",
    database_error: "Kesalahan Database",
    failed_to_fetch_database_content: "Gagal mengambil konten database",
    export_successful: "Ekspor Berhasil",
    data_exported_as: "Data diekspor sebagai {format}",
    export_failed: "Ekspor Gagal",
    failed_to_export_database_content: "Gagal mengekspor konten database",
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

  const t = (key: string, options?: { [key: string]: any }): string => {
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

    let translatedString = typeof value === "string" ? value : key

    // Replace placeholders if options are provided
    if (options) {
      for (const optionKey in options) {
        translatedString = translatedString.replace(`{${optionKey}}`, options[optionKey])
      }
    }

    return translatedString
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
