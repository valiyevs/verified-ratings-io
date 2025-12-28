import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Gift, Users, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Survey, SurveyQuestion } from "@/types/survey";

const testSurveys: Record<string, Survey> = {
  "survey-1": {
    id: "survey-1",
    companyId: "kapital-bank",
    companyName: "Kapital Bank",
    companyLogo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop",
    title: "Mobil Tətbiq Təcrübəsi Sorğusu",
    description: "Kapital Bank mobil tətbiqindən istifadə təcrübənizi öyrənmək və xidmətlərimizi yaxşılaşdırmaq istəyirik. Bu sorğu təxminən 3 dəqiqə çəkəcək.",
    questions: [
      { id: "q1", type: "rating", question: "Mobil tətbiqimizi ümumi olaraq necə qiymətləndirirsiniz?" },
      { id: "q2", type: "single", question: "Hansı funksiyanı ən çox istifadə edirsiniz?", options: ["Köçürmələr", "Ödənişlər", "Kart idarəsi", "Kredit müraciəti"] },
      { id: "q3", type: "multiple", question: "Hansı yeni funksiyaları görmək istərdiniz?", options: ["Kripto ticarəti", "İnvestisiya", "Sığorta", "Təqaüd planlaması", "Büdcə izləmə"] },
      { id: "q4", type: "text", question: "Əlavə rəy və təklifləriniz varmı?" }
    ],
    reward: "10 AZN bonus",
    expiresAt: "2025-01-15",
    responseCount: 234,
    status: "active",
    createdAt: "2024-12-20"
  },
  "survey-2": {
    id: "survey-2",
    companyId: "azercell",
    companyName: "Azercell",
    companyLogo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop",
    title: "5G Xidməti Maraq Sorğusu",
    description: "5G texnologiyasına keçid planlarımız çərçivəsində istifadəçi maraqlarını öyrənirik.",
    questions: [
      { id: "q1", type: "single", question: "5G haqqında nə qədər məlumatlısınız?", options: ["Çox məlumatlıyam", "Orta səviyyədə", "Az məlumatlıyam", "Heç məlumatım yoxdur"] },
      { id: "q2", type: "rating", question: "5G-yə keçməyə nə qədər maraqlısınız?" },
      { id: "q3", type: "multiple", question: "5G-dən hansı məqsədlər üçün istifadə edərdiniz?", options: ["Video izləmə", "Onlayn oyun", "Uzaqdan iş", "IoT cihazlar", "Virtual reallıq"] }
    ],
    reward: "1 GB internet",
    expiresAt: "2025-01-20",
    responseCount: 567,
    status: "active",
    createdAt: "2024-12-18"
  },
  "survey-3": {
    id: "survey-3",
    companyId: "bravo",
    companyName: "Bravo",
    companyLogo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop",
    title: "Alış-veriş Vərdişləri Araşdırması",
    description: "Müştərilərimizin alış-veriş vərdişlərini və üstünlüklərini öyrənmək istəyirik.",
    questions: [
      { id: "q1", type: "single", question: "Həftədə neçə dəfə Bravo-ya gəlirsiniz?", options: ["Hər gün", "Həftədə 2-3 dəfə", "Həftədə 1 dəfə", "Ayda 1-2 dəfə"] },
      { id: "q2", type: "multiple", question: "Ən çox hansı şöbələrdən alış-veriş edirsiniz?", options: ["Qida məhsulları", "İçkilər", "Təmizlik vasitələri", "Kosmetika", "Ev əşyaları"] },
      { id: "q3", type: "rating", question: "Qiymətlərdən razısınızmı?" }
    ],
    expiresAt: "2025-01-10",
    responseCount: 89,
    status: "active",
    createdAt: "2024-12-22"
  }
};

const SurveyDetailPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const survey = surveyId ? testSurveys[surveyId] : null;

  if (!survey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sorğu tapılmadı</h1>
          <Button onClick={() => navigate('/surveys')}>Sorğulara qayıt</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(survey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleSingleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleAnswer = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter((o) => o !== option) };
      }
    });
  };

  const handleRatingAnswer = (questionId: string, rating: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unanswered = survey.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast({
        title: "Bütün suallara cavab verin",
        description: `${unanswered.length} sual cavabsızdır`,
        variant: "destructive",
      });
      return;
    }

    // Submit survey
    setIsSubmitted(true);
    toast({
      title: "Sorğu göndərildi!",
      description: survey.reward ? `Mükafatınız: ${survey.reward}` : "Təşəkkür edirik!",
    });
  };

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    switch (question.type) {
      case "single":
        return (
          <RadioGroup
            value={(answers[question.id] as string) || ""}
            onValueChange={(value) => handleSingleAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const currentAnswers = (answers[question.id] as string[]) || [];
              return (
                <div key={option} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={currentAnswers.includes(option)}
                    onCheckedChange={(checked) =>
                      handleMultipleAnswer(question.id, option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case "rating":
        return (
          <div className="flex items-center gap-4">
            <StarRating
              rating={(answers[question.id] as number) || 0}
              size="lg"
              interactive
              onRatingChange={(rating) => handleRatingAnswer(question.id, rating)}
            />
            <span className="text-muted-foreground">
              {answers[question.id] ? `${answers[question.id]}/5` : "Seçin"}
            </span>
          </div>
        );

      case "text":
        return (
          <Textarea
            placeholder="Cavabınızı yazın..."
            value={(answers[question.id] as string) || ""}
            onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Təşəkkür edirik!</h2>
              <p className="text-muted-foreground mb-6">
                Sorğuya cavab verdiyiniz üçün minnətdarıq.
                {survey.reward && (
                  <span className="block mt-2 text-gold font-medium">
                    Mükafatınız: {survey.reward}
                  </span>
                )}
              </p>
              <Button onClick={() => navigate('/surveys')}>Digər sorğulara bax</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/surveys')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sorğulara qayıt
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Survey Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={survey.companyLogo}
                    alt={survey.companyName}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">{survey.companyName}</p>
                    <h1 className="font-bold text-lg">{survey.title}</h1>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-6">{survey.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{daysLeft > 0 ? `${daysLeft} gün qaldı` : 'Vaxtı bitib'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{survey.responseCount} nəfər cavabladı</span>
                  </div>
                  {survey.reward && (
                    <div className="flex items-center gap-2 text-gold">
                      <Gift className="w-4 h-4" />
                      <span className="font-medium">{survey.reward}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions */}
          <div className="lg:col-span-2 space-y-6">
            {survey.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span>{question.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14">
                  {renderQuestion(question, index)}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button size="lg" variant="gold" onClick={handleSubmit}>
                Sorğunu göndər
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SurveyDetailPage;
