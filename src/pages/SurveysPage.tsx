import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SurveyCard from "@/components/SurveyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Survey } from "@/types/survey";

const testSurveys: Survey[] = [
  {
    id: "survey-1",
    companyId: "kapital-bank",
    companyName: "Kapital Bank",
    companyLogo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop",
    title: "Mobil Tətbiq Təcrübəsi Sorğusu",
    description: "Kapital Bank mobil tətbiqindən istifadə təcrübənizi öyrənmək və xidmətlərimizi yaxşılaşdırmaq istəyirik.",
    questions: [
      { id: "q1", type: "rating", question: "Mobil tətbiqimizi ümumi olaraq necə qiymətləndirirsiniz?" },
      { id: "q2", type: "single", question: "Hansı funksiyanı ən çox istifadə edirsiniz?", options: ["Köçürmələr", "Ödənişlər", "Kart idarəsi", "Kredit"] },
      { id: "q3", type: "multiple", question: "Hansı yeni funksiyaları görmək istərdiniz?", options: ["Kripto", "İnvestisiya", "Sığorta", "Təqaüd planlaması"] },
      { id: "q4", type: "text", question: "Əlavə rəy və təklifləriniz?" }
    ],
    reward: "10 AZN bonus",
    expiresAt: "2025-01-15",
    responseCount: 234,
    status: "active",
    createdAt: "2024-12-20"
  },
  {
    id: "survey-2",
    companyId: "azercell",
    companyName: "Azercell",
    companyLogo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop",
    title: "5G Xidməti Maraq Sorğusu",
    description: "5G texnologiyasına keçid planlarımız çərçivəsində istifadəçi maraqlarını öyrənirik.",
    questions: [
      { id: "q1", type: "single", question: "5G haqqında nə qədər məlumatlısınız?", options: ["Çox", "Orta", "Az", "Heç"] },
      { id: "q2", type: "rating", question: "5G-yə keçməyə nə qədər maraqlısınız?" },
      { id: "q3", type: "multiple", question: "5G-dən hansı məqsədlər üçün istifadə edərdiniz?", options: ["Video izləmə", "Oyun", "İş", "IoT cihazlar"] }
    ],
    reward: "1 GB internet",
    expiresAt: "2025-01-20",
    responseCount: 567,
    status: "active",
    createdAt: "2024-12-18"
  },
  {
    id: "survey-3",
    companyId: "bravo",
    companyName: "Bravo",
    companyLogo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop",
    title: "Alış-veriş Vərdişləri Araşdırması",
    description: "Müştərilərimizin alış-veriş vərdişlərini və üstünlüklərini öyrənmək istəyirik.",
    questions: [
      { id: "q1", type: "single", question: "Həftədə neçə dəfə Bravo-ya gəlirsiniz?", options: ["Hər gün", "2-3 dəfə", "1 dəfə", "Ayda 1-2 dəfə"] },
      { id: "q2", type: "multiple", question: "Ən çox hansı şöbələrdən alış-veriş edirsiniz?", options: ["Qida", "İçki", "Təmizlik", "Kosmetika", "Ev əşyaları"] },
      { id: "q3", type: "rating", question: "Qiymətlərdən razısınızmı?" }
    ],
    expiresAt: "2025-01-10",
    responseCount: 89,
    status: "active",
    createdAt: "2024-12-22"
  }
];

const categories = [
  { value: "all", label: "Bütün kateqoriyalar" },
  { value: "bank", label: "Bank & Maliyyə" },
  { value: "telecom", label: "Telekommunikasiya" },
  { value: "retail", label: "Pərakəndə" },
];

const SurveysPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filteredSurveys = testSurveys.filter((survey) => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
              Sorğular
            </h1>
            <p className="text-muted-foreground">
              Şirkətlərin sorğularına cavab verin və mükafatlar qazanın
            </p>
          </div>
          <Link to="/surveys/create">
            <Button variant="gold">
              <Plus className="w-4 h-4 mr-2" />
              Sorğu yarat
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Sorğu və ya şirkət axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Kateqoriya" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Survey List */}
        <div className="space-y-4">
          {filteredSurveys.length > 0 ? (
            filteredSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Sorğu tapılmadı</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SurveysPage;
